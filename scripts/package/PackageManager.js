// Object representing a package (as-yet installed or not):
const Package = require('./Package');
// Factory which constructs Packages:
const PackageFactory = require('./PackageFactory');
// Class that would actually install Packages to the filesystem if this were a "real" package manager:
const PackageInstaller = require('./installer/PackageInstaller');
// Object describing what happened whan an install of a Package was attempted:
const InstallAttemptResult = require('./attemptresults/InstallAttemptResult');
// Object describing what happened whan the removal of a Package was attempted:
const RemoveAttemptResult = require('./attemptresults/RemoveAttemptResult');


/**
 * The guts of the package manager.  While pkgmgr.js parses input (via a file containing commands such as DEPEND,
 * INSTALL, etc.) and writes output to the console, this class contains the actual logic determining how to respond
 * to these commands.  When relevant, the method processing a command will return a data structure which can be
 * iterated over to generate console output (for example, installPackage() handles INSTALL commands, and returns an
 * array of InstallAttemptResult objects that contain information about what happened when an install was attempted
 * for the specified package and for each of its dependencies.
 *
 * PackageManager tracks dependencies such that it knows when it's okay, for example, to remove a package or not.  It
 * also maintains a cache of all packages it knows about (it learns about packages via DEPEND and INSTALL commands;
 * this cache may contain more packages than are currently installed, because DEPEND doesn't install packages and
 * because packages once installed may have been removed but no packages are ever removed from this cache.
 *
 * Finally, it ensures that users don't issue commands in invalid order (e.g. issuing a DEPEND after any other command
 * has been issued; issuing any command after issuing an END command; etc.).
 *
 * PackageManager uses an instance of another class, PackageInstaller, to actually "install" packages - or would, if
 * this were a "real" package manager.
 */
class PackageManager {

    constructor() {
        /**
         * Cache of <i>all packages</i> we know about from DEPEND and INSTALL commands, regardless of whether they're
         * installed currently. This map describes nothing about the dependency tree; rather, it is a repository of
         * packages which we may retrieve by name.  We never remove entries from this Map.  Keys are package names,
         * values are Package objects.
         * @type {Map<String, Package>}
         * @private
         */
        this._cachedPackagesMap = new Map();

        /**
         * This PackageManager's PackageInstaller.  The PackageInstaller is responsible for actually installing
         * packages to the filesystem (or, it would be if this were a "real" package manager), as well as for
         * keeping track of what's currently installed and what is not.
         * @type {PackageInstaller}
         * @private
         */
        this._packageInstaller = new PackageInstaller();

        /**
         * All packages <i>currently installed</i>. This map also describes nothing about the dependency tree.  When we
         * install a Package, we get a reference to it from this._cachedPackagesMap and add a reference to it in this
         * Map. When we remove a package (after determining that it is not a dependency of any installed packages),
         * we also remove its entry from this map.  Keys are package names, values are objects like this:
         * {pkg: Package, protectFromImplicitRemoval: true}.  The protectFromImplicitRemoval boolean is initially false,
         * set to true if the package is ever installed via INSTALL rather than as a dependency.  This INSTALL install
         * may preceed or follow a dependency-install, but once an INSTALL of the package happens, this boolean does not
         * get set to false.  Once a protectFromImplicitRemoval package is attempted to be removed via REMOVE, its entry
         * is removed from this Map (and may be added later, with a fresh protectFromImplicitRemoval value of true).
         * @type {Map<String, Package>}
         * @private
         */

        /**
         * True if an END command has been issued (we track this because we only allow one END, and don't allow
         * other commands to follow an END.
         * @type {boolean}
         * @private
         */
        this._endCommandProcessed = false;

        /**
         * True if a command other than DEPEND has been issued; we don't allow DEPENDs after other commands
         * have been issued (that is, they're allowed at the beginning and not elsewhere).
         * @type {boolean}
         * @private
         */
        this._nonDependCommandProcessed = false;
    }

    /**
     * Handle a DEPEND command.
     *
     * Add a package to the dependency tree (note that this does not install the package; it just puts it in our
     * package cache if it's not already there, and then creates a dependency relationship between the package and its
     * dependencies.
     * @param {string} packageName The name of the package
     * @param {string[]} dependencyNamesArr Array of dependency package names
     */
    specifyPackageDependencies(packageName, dependencyNamesArr) {
        this._endCheck();
        if (this._nonDependCommandProcessed) {
            throw new Error('DEPEND command cannot be issued once other commands have been issued.');
        }
        const pkg = this._getFromOrAddToCache(packageName, true);

        // Now we have to deal with the package's dependencies, which may also mean adding those dependencies
        // to our cache (but not installing them yet; our cache contains packages which may be installed or not):
        dependencyNamesArr.forEach(dependencyPackageName => {
            const depPkg = this._getFromOrAddToCache(dependencyPackageName, true);
            // Establish a two-way link between these packages:
            this._createDependenceRelationship(pkg, depPkg);
        });
    }

    /**
     * Handle an INSTALL command.
     *
     * Install any of the package's dependencies that aren't already installed, then install the package if it's not
     * already installed (which it may have been, e.g., because it's a dependency of another explicitly installed
     * package). This is a recursive operation which involves (potential) recursive calls to the private method
     * _installPkgAndDependencies().
     * @param {string[]} packageName The name of the package to install if it hasn't been installed already
     * @return {InstallAttemptResult[]} Array of InstallAttemptResults (indicating packageName and whether the package
     * was installed, or not installed because it was already installed.
     */
    installPackage(packageName) {
        this._endCheck();
        this._nonDependCommandProcessed = true;
        // Get our package from cache:
        const pkg = this._getFromOrAddToCache(packageName, true);
        // Now we install the package and its dependencies:
        return this._installPkgAndDependencies(pkg);
    }

    /**
     * Handle a REMOVE command.
     *
     * Remove any of the package's dependencies which weren't explicitly installed and are not dependencies of other
     * packages, then remove the package if it's not a dependency of any other package. This is a recursive operation
     * which involves (potential) recursive calls to the private method_removePkgAndDependencies().
     * @param {string} packageName The name of the package to remove if it isn't a dependency of another package
     * @return {RemoveAttemptResult[]} Array of RemoveAttemptResults (indicating packageName and whether the package
     * was removed, or not removed because it's still needed as a dependency of another package, or not removed
     * because it wasn't installed.
     */
    removePackage(packageName) {
        this._endCheck();
        this._nonDependCommandProcessed = true;
        // Get our package from cache:
        const pkg = this._getFromOrAddToCache(packageName, false);
        // Now we remove the package and its dependencies as appropriate:
        return this._removePkgAndDependencies(pkg);
    }

    /**
     * Handle a LIST command.
     *
     * We return an array of the names of all Packages currently installed, sorted alphabetically.
     * @return Array of installed Package names.
     */
    listPackageNames() {
        this._endCheck();
        this._nonDependCommandProcessed = true;
        // Note: sort() with no sort-function arg sorts alphabetically, which is what we want:
        return this._packageInstaller.getInstalledPackageNames().sort();
    }

    /**
     * Handle an END command.
     *
     * The only thing this method does is make sure END is only called once.
     */
    endCommands() {
        this._endCheck();
        this._nonDependCommandProcessed = true;
        this._endCommandProcessed = true;
    }

    /**
     * Install this package and then its dependencies, which means iterating over the dependencies and installing their
     * dependencies and those dependencies' depencencies, and so on, which means that this method often calls itself
     * recursively.  This method always installs a package's dependencies before it installs the package itself.
     *
     * @param {Package} pkg A Package object
     * @return {InstallAttemptResult[]} Array of InstallAttemptResults (indicating packageName and whether the package
     * was installed, or not installed because it was already installed.  Note that this return value is ignored
     * when called recursively; it's only used after the recursion is over and we return to installPackage().
     * @private
     */
    _installPkgAndDependencies(pkg, installAttempResultsArr = [], depth = 0) {
        // Recurse through the deps FIRST (since we need the pkg's deps installed before we can install the pkg):
        pkg.dependencyPackages.forEach(depPkg => {
            this._installPkgAndDependencies(depPkg, installAttempResultsArr, depth + 1);
        });

        const currentInstallIsExplicit = (depth === 0); // installed via INSTALL rather than as a dependency
        const alreadyInstalled = this._packageInstaller.isPackageInstalled(pkg.name);
        if (alreadyInstalled) {
            const protectFromImplicitRemoval = this._packageInstaller.isPackageProtectedFromImplicitRemoval(pkg.name);
            if (!protectFromImplicitRemoval) {
                this._packageInstaller.setPackageProtectedFromImplicitRemoval(pkg.name, currentInstallIsExplicit);
            } else {
                // Else nothing.  The value of currentInstallIsExplicit is not relevant here.
            }
        } else {
            this._packageInstaller.installToFilesystem(pkg, currentInstallIsExplicit);
        }

        // We don't tell the user, e.g., "TCPIP is already installed" unless there was an explicit INSTALL TCPIP (as
        // opposed to an implicit install, as a dependency).  So:
        if (!alreadyInstalled || currentInstallIsExplicit) {
            installAttempResultsArr.push(new InstallAttemptResult(pkg.name, alreadyInstalled));
        }
        return installAttempResultsArr;
    }

    /**
     * Remove this package and then its dependencies, which means iterating over the dependencies and removing their
     * dependencies and those dependencies' depencencies, and so on, which means that this method often calls itself
     * recursively.  This method always removes the package itself before its dependencies (the opposite of what we
     * do when installing).
     * @param {Package} pkg A Package object
     * @return {RemoveAttempResult[]} Array of RemoveAttempResult (indicating packageName and whether the package
     * was removed or not, and if not, why. Note that this return value is ignored when called recursively; it's only
     * used after the recursion is over and we return to removePackage().
     * @private
     */
    _removePkgAndDependencies(pkg, removeAttempResultsArr = [], depth = 0) {


        let removedStatus; // we'll set this to one of the RemoveAttemptResult.REMOVED_STATUS_* constants
        // First, check if this package even needs to be removed:
        if (!this._packageInstaller.isPackageInstalled(pkg.name)) {
            removedStatus = RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED;
        } else {
            const currentRemoveIsExplicit = (depth === 0); // being removed via REMOVE rather than as a dependency
            const protectFromImplicitRemoval = this._packageInstaller.isPackageProtectedFromImplicitRemoval(pkg.name);
            if (protectFromImplicitRemoval) {
                if (currentRemoveIsExplicit) {
                    // This package was installed explicitly and is now being requested to be removed explicitly. That
                    // doesn't mean we're removing it; it does mean, though, that we're setting its
                    // protectFromImplicitRemoval boolean to false - if this package is a dep, we'll keep it, but
                    // won't require an explicit REMOVE to remove:
                    this._packageInstaller.setPackageProtectedFromImplicitRemoval(pkg.name, false);
                } else {
                    // Else nothing; this is a package we can remove when we like, which isn't changed by whether
                    // this is an explicit remove or not.
                }
            } else {
                // Also else nothing.  protectFromImplicitRemoval is false.  If currentRemoveIsExplicit is false, nothing
                // changes. If true, also nothing changes; protectFromImplicitRemoval needs to remain false so that
                // below we can remove the package if it doesn't have dependencies.
            }

            const hasInstalledDependingPackages = this._countInstalledDependingPackages(pkg) > 0;

            let keep = false;
            if (hasInstalledDependingPackages) {
                // has installed packages that depend on it, so we're keeping it:
                keep = true;
            } else {
                // doesn't have installed packages depending on it, so we only want to remove it if we installed
                // it explicitly and this is an explicit remove, so:
                if (this._packageInstaller.isPackageProtectedFromImplicitRemoval(pkg.name)) {
                    // this package can only be removed explicitly...
                    keep = !currentRemoveIsExplicit;
                }
            }

            if (!keep) {
                this._packageInstaller.removeFromFilesystem(pkg.name);
            }

            removedStatus = (keep
                ? RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED
                : RemoveAttemptResult.REMOVED_STATUS_REMOVED
            );
        }
        // We don't tell the user, e.g., "TCPIP is still needed" unless there was an explicit REMOVE TCPIP (as
        // opposed to an implicit remove, as a dependency).  So:
        if (removedStatus === RemoveAttemptResult.REMOVED_STATUS_REMOVED || depth === 0) {
            removeAttempResultsArr.push(new RemoveAttemptResult(pkg.name, removedStatus));
        }
        // Recurse through the deps LAST (since we remove the pkg before we remove its deps):
        pkg.dependencyPackages.forEach(depPkg => {
            this._removePkgAndDependencies(depPkg, removeAttempResultsArr, depth + 1);
        });

        return removeAttempResultsArr;
    }

    /**
     * Counts the number of dependencies this Package has which are currently installed.
     * @param pkg A Package.
     * @return {number} The count.
     * @private
     */
    _countInstalledDependingPackages(pkg) {
        let count = 0;
        pkg.dependingPackages.forEach(dependingPackage => {
            if (this._packageInstaller.isPackageInstalled(dependingPackage.name)) {
                count++;
            }
        });
        return count;
    }


    /**
     * Creates a depending-package/dependency-package relationship between two packages by adding dependingPackage to
     * dependencyPackage's dependingPackages Set, and adds dependencyPackage to dependingPackage's dependencyPackages
     * Set. (In both cases we may add() a value that's already in the Set, but this is fine since Set doesn't allow
     * dupes.)  We create this relationship for two reasons: first, when we install a Package, we need to know which
     * dependencies to install; second, when don't remove a Package until it has no dependingPackages (we also don't
     * remove a package which the PackageInstaller tells us is protected against implicit removal unless the remove
     * attempt is explicit (a REMOVE command) rather than implicit (removal attempt triggered by no longer being a
     * dependency of other installed packages).
     *
     * Note that there is no method which does the opposite of this one (severs a dependence relationship).  Once a
     * relationship exists, it always exists (whether the relevant dependents and dependencies are currently installed
     * is as important to us as dependency relationships).
     * @param {Package} dependingPackage
     * @param {Package} dependencyPackage
     * @private
     */
    _createDependenceRelationship(dependingPackage, dependencyPackage) {
        dependingPackage.dependencyPackages.add(dependencyPackage);
        dependencyPackage.dependingPackages.add(dependingPackage);
    }

    /**
     * Get the specified Package from the cache; if it's not in the cache and addIfNotFound is true, call
     * PackageFactory.getPackage() to create one, cache it, and return it.
     * @param {string} packageName
     * @param {boolean} addIfNotFound
     * @return {Package} The (possibly newly created) cached Package.
     * @private
     */
    _getFromOrAddToCache(packageName, addIfNotFound = true) {
        let pkg = this._cachedPackagesMap.get(packageName);
        if (!pkg && addIfNotFound) {
            // Not in cache, so we'll put it there:
            pkg = PackageFactory.getPackage(packageName);
            this._cachedPackagesMap.set(packageName, pkg);
        }
        // Whether it was in the cache or we just instantiated it, return it:
        return pkg;
    }

    /**
     * Called by all methods which handle commands (like INSTALL, REMOVE, etc.), throws an Error if END has already
     * been called.
     * @private
     */
    _endCheck() {
        if (this._endCommandProcessed) {
            throw new Error('No commands may be issued after END.');
        }
    }
}



module.exports = PackageManager;

/**
 * This class is a stub, partly; it is meant to be the interface through which the PackageManager installs a Package
 * to the filesystem (installToFilesystem()), or remove it from the filesystem (removeFromFilesystem()).  Since this
 * is not a real-world package manager, ofc we don't do that here.  This class does have "real" functionality though:
 * its _installedPackagesMap field, a Map of containing all currently installed packages.  (It also contains information
 * about how the Package was installed, specifically, if it's ever been installed explicitly, that is, via an INSTALL
 * command as opposed to being installed implicitly, as a dependency).  In the real world, this Map would always
 * reflect, exactly, which packages were currently actually installed on the filesystem.
 */
class PackageInstaller {

    /**
     * Construct a PackageInstaller.
     * @constructor
     */
    constructor() {
        /**
        * All packages <i>currently installed</i>. Entries have this structure:
        *
        *      key=packageName -> value={pkg: a Package, protectFromImplicitRemoval: boolean}
        *
        * The protectFromImplicitRemoval boolean is initially false,
        * set to true if the package is ever installed via INSTALL rather than as a dependency.  This INSTALL install
        * may preceed or follow a dependency-install, but once an INSTALL of the package happens, this boolean does not
        * get set to false.  Once a protectFromImplicitRemoval package is attempted to be removed via REMOVE, its entry
        * is removed from this Map (and may be added later, with a fresh protectFromImplicitRemoval value of true).
        *
        * @type {Map<string, {pkg: Package, protectFromImplicitRemoval: boolean}>}
        * @private
        */
        this._installedPackagesMap = new Map();
    }

    /**
     * Install the pkg Package to the filesystem.
     * @param {Package} pkg The Package to install.
     * @param {boolean} protectFromImplicitRemoval True if this method call resulted from the user explicitly issuing
     *    a command to install this package (e.g., INSTALL PACKAGENAME), false if the call resulted from the Package
     *    being installed because it's a dependency of another Package.
     * @throw Error if the Package is already installed (call isPackageInstalled() first to avoid this error)
     */
    installToFilesystem(pkg, protectFromImplicitRemoval) {
        if (this.isPackageInstalled(pkg.name)) {
            throw new Error(`Cannot install package "${pkg.name}" because it is already installed on the filesystem.`);
        }
        this._doInstall(pkg);
        this._installedPackagesMap.set(pkg.name, {pkg, protectFromImplicitRemoval});

    }

    /**
     * Remove the Package whose name is packageName from the filesystem.  Note that this method does not contain any
     * logic to determine whether or not it's safe to remove this package (e.g., whether other Packages depend on it,
     * etc.); all that logic shgould be in PackageManager.
     * @param {string} packageName
     * @throw Error if the Package was not installed (call isPackageInstalled() first to avoid this error)
     */
    removeFromFilesystem(packageName) {
        this._installedCheck(packageName, `Cannot remove package "${packageName}" because it is not installed on the filesystem.`);
        this._doRemove(this.getInstalledPackage(packageName));
        this._installedPackagesMap.delete(packageName);
    }

    /**
     * No-op method.  If this were a real-world package manager, this method would actually install the package to
     // the underlying system.
     * @param pkg Package to install
     * @private
     */
    _doInstall(pkg) {
    }

    /**
     * No-op method.  If this were a real-world package manager, this method would actually remove the package from
     // the underlying system.
     * @param pkg Package to remove
     * @private
     */
    _doRemove(pkg) {
    }



    /**
     * Returns true if a Package whose name is packageName is currently installed on the filesystem, false otherwise.
     * @param {string} packageName
     * @return {boolean} True if installed
     */
    isPackageInstalled(packageName) {
        return this._installedPackagesMap.has(packageName);
    }

    /**
     * Return the Package whose name is packageName.
     * @param {string} packageName
     * @return {Package} The Package.
     * @throws Error if the specified Package is not installed.
     */
    getInstalledPackage(packageName) {
        this._installedCheck(packageName, `Cannot return "${packageName}" package; it is not installed.`);
        return this._installedPackagesMap.get(packageName).pkg;
    }

    /**
     * Return an unsorted array of Package names which are currently installed.
     * @return {string[]} The Package names.
     */
    getInstalledPackageNames() {
        return Array.from(this._installedPackagesMap.keys());
    }

    /**
     * Returns the specified Package's protectFromImplicitRemoval boolean.
     * @param {string} packageName The name of the Package.
     * @return {boolean} True if Package's protectFromImplicitRemoval is true
     * @throws Error if the specified Package is not installed.
     */
    isPackageProtectedFromImplicitRemoval(packageName) {
        this._installedCheck(packageName, `Cannot continue; "${packageName}" it is not installed.`);
        return this._installedPackagesMap.get(packageName).protectFromImplicitRemoval;
    }

    /**
     * Sets the specified Package's protectFromImplicitRemoval flag to the specified value.
     * @param {string} packageName
     * @param {boolean} protect True to mark the package protected from being removed except by explicit REMOVE command
     * @throws Error if the specified Package is not installed.
     */
    setPackageProtectedFromImplicitRemoval(packageName, protect) {
        this._installedCheck(packageName, `Cannot continue; "${packageName}" it is not installed.`);
        this._installedPackagesMap.get(packageName).protectFromImplicitRemoval = protect;
    }

    /**
     * This privatge method is called by any methods which rely on the specified Package already being installed;
     * throws an error if the Package is not installed.
     * @param {string} packageName Name of the Package
     * @param {string} errorMessage Message for the Error we throw as needed
     * @throws Error if the Package is not installed
     * @private
     */
    _installedCheck (packageName, errorMessage) {
        if (!this.isPackageInstalled(packageName)) {
            throw new Error(errorMessage);
        }
    }


}

module.exports = PackageInstaller;

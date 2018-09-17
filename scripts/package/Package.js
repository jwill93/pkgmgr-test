/**
 * Represents a package which PackageManager knows about from processing either a DEPENDS or INSTALL command.  The
 * existence of a Package object does not mean that it's currently installed.  It does mean that it's currently
 * cached by PackageManager.  Packages hold references to their dependency Packages and to Packages which depend
 * on them.
 */
class Package {

    /**
     * Construct a Package.
     * @param {string} name The name of the package.
     * @constructor
     */
    constructor(name) {
        /**
         * The package's name.
         */
        this.name = name;

        /**
         * Packages which are dependencies of this package. Only PackageManager should ever alter this Set.
         * @type {Set<Package>}
         */
        this.dependencyPackages = new Set();

        /**
         * Packages of which this package is a dependency. Only PackageManager should ever alter this Set.
         * @type {Set<Package>}
         */
        this.dependingPackages = new Set();
    }
}

module.exports = Package;

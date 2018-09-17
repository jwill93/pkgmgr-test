class Package {

    /**
     * Represents a package and tracks its dependencies and dependent packages.  The existence of a Package object
     * does not mean that it's currently installed.  It does mean that it's currently cached.  This package manager
     * "learns" about the existence of packages (and then caches them) in on of two ways: on a DEPENDS command
     * (which PackageManager.specifyPackageDependencies() processes), or on an INSTALL command (which
     * PackageManager.installPackage() processes).
     * @param {string} name The name of the package.
     * @constructor
     */
    constructor(name) {
        /**
         * The package's name
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

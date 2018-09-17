const Package = require('./Package');

/**
 * A factory which ensures that we never instantiate more than one Package with the same name (presumably
 * referring to the same piece of software).  As such, PackageFactory.getPackage() is the only way users should
 * instantiate Packages.
 */
class PackageFactory {

    /**
     * Return a Package instance with the specified name, either a newly constructed one or if this factory has
     * already returned a Package with this name, that Package. Assuming users don't instantiate Packages directly,
     * getting instances only via this method, it is guaranteed that users will not end up with two Packages which
     * have the same name (and thus, preumably, refer to the same piece of software).
     * @param {string} name The name of the Package
     * @return {Package}
     */
    static getPackage(name) {
        if (!(packages[name])) {
            packages[name] = new Package(name);
        }
        return packages[name];
    }

}

// A map containing already-constructed Packages. Keys are package names; values are Packages.
const packages = {};

module.exports = PackageFactory;

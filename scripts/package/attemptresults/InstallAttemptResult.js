/**
 * An array of InstallAttemptResults is returned by PackageManager.installPackage. They do not affect the
 * operation of the PackageManager; they exist only to notify users of the outcomes of calls to installPackage.
 * A call to installPackage can result in one of two outcomes (for the package itself and for its dependencies):
 * either the Package was installed, or it wasn't because it had already been installed previously (either
 * explicitly by a user call to INSTALL, or implicitly, as a dependency).
 */
class InstallAttemptResult {

    /**
     * Construct an InstallAttemptResult.
     * @param packageName The name of the Package
     * @param previouslyInstalled True if the package was already installed, false if it was not (and thus the
     *   package was installed).
     * @constructor
     */
    constructor(packageName, previouslyInstalled) {
        this.packageName = packageName;
        this.previouslyInstalled = previouslyInstalled;
    }
}

module.exports = InstallAttemptResult;

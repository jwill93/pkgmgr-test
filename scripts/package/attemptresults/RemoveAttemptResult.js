/**
 * An array of RemoveAttemptResults is returned by PackageManager.removePackage. They do not affect the
 * operation of the PackageManager; they exist only to notify users of the outcomes of calls to removePackage.
 * A call to removePackage can result in one of three outcomes (for the package itself and for its dependencies): 1)
 * the package was removed; 2) the package was not removed because it was not installed to begin with; 3) the package
 * was not removed because it is still needed as a dependency of other packages.
 */
class RemoveAttemptResult {

    /**
     * Construct a RemoveAttemptResult
     * @param {string} packageName The name of the package.
     * @param {symbol} removedStatus One of the three RemoveAttemptResult.REMOVED_STATUS_* constants
     * @constructor
     */
    constructor(packageName, removedStatus) {
        this.packageName = packageName;
        this.removedStatus = removedStatus;
    }

    /**
     * Status indicating the package was removed.
     * @return {symbol}
     */
    static get REMOVED_STATUS_REMOVED() {
        return REMOVED_STATUS_REMOVED;
    }

    /**
     * Status indicating the package was not removed because it wasn't currently installed.
     * @return {symbol}
     */
    static get REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED() {
        return REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED;
    }

    /**
     * Status indicating the package was not removed because it was still needed as a dependency of one or more
     * packages.
     * @return {symbol}
     */
    static get REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED() {
        return REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED;
    }

}

const REMOVED_STATUS_REMOVED = Symbol('REMOVED_STATUS_REMOVED');
const REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED = Symbol('REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED');
const REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED = Symbol('REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED');

module.exports = RemoveAttemptResult;

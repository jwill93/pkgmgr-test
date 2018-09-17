#!/usr/bin/env node

/**
 * This script is the entry point for our package manager and is meant to be called from the command line as a node
 * script, as follows (assumes Node is installed; I used v8.9.4):
 *
 * node ./pkgmgr /path/to/input/file.ext
 *
 * ...where /path/to/input/file.ext is a file containing commands such as DEPEND, INSTALL, REMOVE, etc.  A sample
 * input file is in the same directory as the .js file you are reading now: ./sample-input.txt.
 */

// The command-line parser we're using
const clParser = require('commander');

// Function which loads a Promise to load the specified text file and returns its lines as an array.
const getCommandsFromFile = require('./scripts/getCommandsFromFile');

// The guts of the package-manager (this pkgmgr.js file you're reading merely parses input and outputs status to
// the console):
const PackageManager = require('./scripts/package/PackageManager');

// Instance of our PackageManager:
const packageManager = new PackageManager();

// Process CLI input and its commands (and throw errors when input is invalid; note that each of the command-processor
// methods in PackageManager do further validation as well), then outputs the results to the console:
clParser
    .arguments('<infilename>')
    .action((infilename) => {
        getCommandsFromFile(infilename)
            .then(commandsArr => {
                // Iterate over the commands in the file (e.g. DEPEND FOO BAR), one command per line:
                commandsArr.forEach((commandLine) => {
                    // Create array of command-line words (DEPEND FOO BAR -> ['DEPEND', 'FOO', 'BAR']
                    const commandElements = commandLine.split(' ');
                    // Ignore blank lines:
                    if (commandElements.length > 0) {
                        // Echo the raw command, per the spec:
                        console.info(commandLine);
                        // Shift the command off of the commandElements arr (note that commandElements thus now
                        //. contains only the args (if any) to the command):
                        const command = commandElements.shift().toUpperCase().trim();
                        if (command.length > 0) {
                            switch (command) {
                                // Go through all possible commands; note that PackageManager.do*() commands all
                                // throw validation Errors:
                                case 'DEPEND': {
                                    argsLengthCheck(command, commandElements, 2, false);
                                    // Note that after we shift the depending package off of the commandElements
                                    // array, commandElements is an array of dependent packages:
                                    packageManager.specifyPackageDependencies(commandElements.shift(), commandElements);
                                    // DEPEND requires no console output, so we're done:
                                    break;
                                }
                                case 'INSTALL': {
                                    argsLengthCheck(command, commandElements, 1, true);
                                    // commandElements[0] is the package name to install:
                                    const installAttemptResultsArr = packageManager.installPackage(commandElements[0]);
                                    // Iterate over an array of InstallAttemptResult objects, one for each of the
                                    // Package's dependencies and one for the package itself, reporting to the console
                                    // what the outcome of the attempted install was:
                                    installAttemptResultsArr.forEach(installAttemptResult => {
                                        if (installAttemptResult.previouslyInstalled) {
                                            console.info(`   ${installAttemptResult.packageName} is already installed.`);
                                        } else {
                                            console.info(`   Installing ${installAttemptResult.packageName}`);
                                        }
                                    });
                                    break;
                                }
                                case 'LIST': {
                                    argsLengthCheck(command, commandElements, 0, true);
                                    // Get an array of installed package names (alpha-sorted)...
                                    const namesArr = packageManager.listPackageNames();
                                    // ...and write them to the console, one per line:
                                    namesArr.forEach(name => {
                                        console.info(`   ${name}`);
                                    });
                                    break;
                                }
                                case 'REMOVE': {
                                    argsLengthCheck(command, commandElements, 1, true);
                                    // commandElements[0] is the package name to remove:
                                    const removeAttemptResultsArr = packageManager.removePackage(commandElements[0]);
                                    // Iterate over an array of RemoveAttemptResult objects, one for each of the
                                    // Package's dependencies and one for the package itself, reporting to the console
                                    // what the outcome of the attempted removal was:
                                    removeAttemptResultsArr.forEach(removeAttemptResult => {
                                        switch (removeAttemptResult.removedStatus) {
                                            case RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_STILL_NEEDED: {
                                                console.info(`   ${removeAttemptResult.packageName} is still needed.`);
                                                break;
                                            }
                                            case RemoveAttemptResult.REMOVED_STATUS_NOT_REMOVED_NOT_INSTALLED: {
                                                console.info(`   ${removeAttemptResult.packageName} is not installed`);
                                                break;
                                            }
                                            case RemoveAttemptResult.REMOVED_STATUS_REMOVED: {
                                                console.info(`   Removing ${removeAttemptResult.packageName}`);
                                                break;
                                            }
                                            default: {
                                                throw new Error(`Unrecognized status "${removeAttemptResult.removedStatus}"`);
                                            }
                                        }
                                    });
                                    break;
                                }
                                case 'END': {
                                    argsLengthCheck(command, commandElements, 0, true);
                                    // Tell the PackageManager we're done (any commands following this one will cause
                                    // an error to be thrown):
                                    packageManager.endCommands();
                                    // END requires no output, so we're done.
                                    break;
                                }
                                default: {
                                    throw new Error(`Command "${command}" not recognized; cannot continue.`);
                                }
                            }
                        }
                    }
                });
            })
            .catch((err) => {
                console.error(`There was an error; cannot continue: ${err}`);
            });
    })
    .parse(process.argv)
;

/**
 * Validation method for user input; throws Error on validation failure
 * @param {string} command The command (first word of the line)
 * @param {string[]} commandElements All words following the command, as an array
 * @param {number} minLength Minimum (or exact) number of words expected in commandElements
 * @param {boolean} exact True to require exactly the number of words expected; false if we should treat the number
 *   as a minimum (note: we don't do maximums in this validation method because validation needs here don't
 *   call for it).
 * @throws Error on validation failure. The Error's message is meant to be meaningful to lay users and therefore to be
 *   printed to the console
 */
const argsLengthCheck = (command, commandElements, minLength, exact) => {
    if (commandElements.length < minLength) {
        throw new Error(`The ${command} command requires ${exact ? 'exactly' : 'at least'} ${minLength} argument(s).`);
    }
};

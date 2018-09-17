const fs = require('fs'); // normal node file I/O

const getCommandsFromFile = (infilename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(infilename, 'utf-8', (err, fileContents) => {
            if (err) {
                reject(err);
            } else if (fileContents.length === 0) {
                reject('File is empty');
            } else {
                resolve(fileContents.split('\n'));
            }
        })
    });
};

module.exports = getCommandsFromFile;

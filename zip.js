const zipdir = require('zip-dir');
const CONFIG = require("./config");
const {DEFAULT_DIR} = CONFIG
const cwd = process.cwd()

module.exports = async function () {
    return new Promise((resolve, reject) => {
        const DIR_PATH = path.join(cwd, DEFAULT_DIR)
        zipdir(DIR_PATH, {
            saveTo: `${DIR_PATH}.zip`,
            filter: (path, stat) => !/\.zip$/.test(path) && !/(node_modules|.idea)/.test(path)
        }, function (err) {
            if (err) {
                reject(err)
            }
            resolve()
        });
    })
}

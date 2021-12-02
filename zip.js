const zipdir = require('zip-dir');
const CONFIG = require("./config");
const path = require("path")
const {DEFAULT_DIR} = CONFIG
const cwd = process.cwd()

module.exports = async function () {
    return new Promise((resolve, reject) => {
        const DIR_PATH = path.join(cwd, DEFAULT_DIR)
        zipdir(DIR_PATH, {
            saveTo: `${DIR_PATH}.zip`,
            filter: (paths, stat) => !/\.zip$/.test(paths) && !/(node_modules|.idea)/.test(paths)
        }, function (err) {
            if (err) {
                reject(err)
            }
            resolve()
        });
    })
}

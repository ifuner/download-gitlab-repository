const fs = require('fs-extra')
const path = require('path')
const simpleGit = require('simple-git');
const CONFIG = require("./config");
const git = simpleGit()
const {DEFAULT_DIR, cwd} = CONFIG

module.exports = async function (data = {}) {

    let {path_with_namespace, ssh_url_to_repo, http_url_to_repo} = data
    // 创建文件夹
    let proPath = path.join(cwd, DEFAULT_DIR, path_with_namespace)

    if (!await fs.pathExists(proPath)) {
        await fs.ensureDir(proPath)
        // clone 代码
        await git.clone(ssh_url_to_repo, proPath)
    }

    const git2 = simpleGit({
        baseDir: proPath
    });

    let branchs = await git2.branch(['-a'])
    for (let i = 0; i < branchs.length; i++) {
        const item = branchs[i] || {}
        const remote = "remotes"
        if (item.indexOf(remote) !== -1) {
            let remoteOrigin = item.replace(remote + "/", "")
            await git2.branch(['--track', remoteOrigin])
        }
    }

    await git2.fetch(['--all'])
    await git2.pull(['--all'])
}

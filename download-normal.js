const fs = require('fs-extra')
const path = require('path')
const simpleGit = require('simple-git');
const CONFIG = require("./config");
const git = simpleGit()
const GitUrlParse = require("git-url-parse");
const {cwd, DEFAULT_DIR, GITLAB_CLONE_MODE, GITLAB_USERNAME, GITLAB_PASSWORD} = CONFIG
module.exports = async function (data = {}) {

    let {path_with_namespace, ssh_url_to_repo, http_url_to_repo} = data
    // 创建文件夹
    let proPath = path.join(cwd, DEFAULT_DIR, path_with_namespace)

    if (!await fs.pathExists(proPath)) {
        await fs.ensureDir(proPath)
        let remoteUrl = ssh_url_to_repo
        if (!/^(HTTPS|SSH)/.test(GITLAB_CLONE_MODE)) {
            console.log("clone 方式不在定义范围内")
            return
        }
        if (GITLAB_CLONE_MODE === "HTTPS") {
            const {protocol, resource, pathname} = GitUrlParse(http_url_to_repo)
            remoteUrl = `${protocol}://${GITLAB_USERNAME}:${GITLAB_PASSWORD}@${resource}${pathname}`
        }
        await git.clone(remoteUrl, proPath)
    }

    const git2 = simpleGit({
        baseDir: proPath
    });

    let branchs = await git2.branch(['-a'])
    branchs = branchs.all
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

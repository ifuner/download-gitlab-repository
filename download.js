const simpleGit = require('simple-git');
const fs = require('fs-extra')
const path = require('path')
const workerpool = require('workerpool');
const GitUrlParse = require("git-url-parse");
const CONFIG = require("./config")

const {DEFAULT_DIR, GITLAB_CLONE_MODE, GITLAB_USERNAME, GITLAB_PASSWORD} = CONFIG
const cwd = process.cwd()
const download = async function (data = {}) {
    const {path_with_namespace, ssh_url_to_repo, http_url_to_repo} = data || {}
    let git = simpleGit();

    let proPath = path.join(cwd, DEFAULT_DIR, path_with_namespace)

    if (!await fs.pathExists(proPath)) {
        // 创建文件夹
        await fs.ensureDir(proPath)
        let remoteUrl = ssh_url_to_repo
        if (!/^(HTTPS|SSH)/.test(GITLAB_CLONE_MODE)) {
            console.log("clone 值不在定义范围内")
            return
        }
        if (GITLAB_CLONE_MODE === "HTTPS") {
            const {protocol, resource, pathname} = GitUrlParse(http_url_to_repo)
            remoteUrl = `${protocol}://${GITLAB_USERNAME}:${GITLAB_PASSWORD}@${resource}${pathname}`
        }
        // clone 代码
        await git.clone(remoteUrl, proPath)
        let git2 = simpleGit({
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

        git2 = null
    }

    let git3 = simpleGit({
        baseDir: proPath
    });
    await git3.fetch(['--all'])
    await git3.pull(['--all'])
    git3 = null

    return data
}


workerpool.worker({
    asyncDownload: async (data) => {
        return await Promise.all(
            data.map(item => download(item))
        )
    }
});

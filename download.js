const simpleGit = require('simple-git');
const fs = require('fs-extra')
const path = require('path')
const workerpool = require('workerpool');

const download = async function (data = {}, options = {}) {
    const {path_with_namespace, ssh_url_to_repo, http_url_to_repo} = data || {}
    const {cwd, DEFAULT_DIR} = options || {}
    let git = simpleGit();
    // 创建文件夹
    let proPath = path.join(cwd, DEFAULT_DIR, path_with_namespace)

    if (!await fs.pathExists(proPath)) {
        await fs.ensureDir(proPath)
        // clone 代码
        await git.clone(ssh_url_to_repo, proPath)
    }

    let git2 = simpleGit({
        baseDir: proPath
    });

    let branchs = await git2.branch(['-a'])
    branchs = branchs.all
    for (let i = 0; i < branchs.all.length; i++) {
        const item = branchs[i] || {}
        const remote = "remotes"
        if (item.indexOf(remote) !== -1) {
            let remoteOrigin = item.replace(remote + "/", "")
            await git2.branch(['--track', remoteOrigin])
        }
    }
    await git2.fetch(['--all'])
    await git2.pull(['--all'])
    git2 = null
    return data
}

workerpool.worker({
    asyncDownload: download
});

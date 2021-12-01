const workerpool = require('workerpool');
const args = require('minimist')(process.argv.slice(2))
const path = require("path")
const zip = require("./zip")
const gitlab = require("./gitlab")
const downloadNormal = require("./download-normal")
const fs = require("fs-extra")
// 配置项开始
const CONFIG = require("./config")
const {needCompression, DEFAULT_DIR, cwd, CLEAR_MODE} = CONFIG
// 配置项结束

const WORK_TASK = function (data, pool) {
    return new Promise((resolve, reject) => {
        pool.proxy()
            .then(function (worker) {
                return worker.asyncDownload(data, {cwd, DEFAULT_DIR});
            })
            .then(function (result) {
                // console.log(result);
                resolve(result)
            })
            .catch(function (err) {
                console.log("捕捉到错误", err);
                reject(null)
            })
    })
}

const INIT = async function () {
    console.time("执行时间")
    if (CLEAR_MODE) {

        const REMOVE_DIR = path.join(cwd, DEFAULT_DIR)
        console.log(`开始清空 ${REMOVE_DIR}`)
        if (await fs.pathExists(REMOVE_DIR)) await fs.remove(REMOVE_DIR)
        console.log(`文件夹已清空`)
    }
    // 获取仓库
    console.log(`开始获取gitlab的仓库列表`)
    let ALL_PRO = await gitlab() || []
    // console.log("ALL_PRO", ALL_PRO.length);
    // return
    if (!(ALL_PRO && ALL_PRO.length)) {
        console.log("仓库列表为空")
        console.timeEnd("执行时间")
        return
    }

    console.log(`获取到${ALL_PRO.length}条仓库列表数据`)
    if (args.workers) {
        // worker 模式执行方式
        console.log(`开始以多线程模式执行任务...`)
        const pool = workerpool.pool("./download.js");
        await Promise.all(
            ALL_PRO.map(item => WORK_TASK(item, pool))
        )
        pool.terminate();
        console.log(`多线程任务执行完成...`)
    } else {
        console.log(`开始以单线程模式执行任务...`)
        for (let i = 0; i < ALL_PRO.length; i++) {
            await downloadNormal(ALL_PRO[i])
        }
        console.log(`单线程任务执行完成...`)
    }

    // 结束后执行压缩
    if (needCompression) {
        console.log(`开始执行压缩...`)
        await zip()
        console.log(`压缩任务完成...`)
    }
    console.timeEnd("执行时间")
}

INIT()

const workerpool = require('workerpool');
const args = require('minimist')(process.argv.slice(2))
const path = require("path")
const zip = require("./zip")
const gitlab = require("./gitlab")
const downloadNormal = require("./download-normal")
const fs = require("fs-extra")
const array = require('lodash/array');

const CONFIG = require("./config")
const {NEED_COMPRESSION, DEFAULT_DIR, CLEAR_MODE, WORKERS_COUNTS} = CONFIG
const cwd = process.cwd()

const WORK_TASK = function (data, pool) {
    return new Promise((resolve, reject) => {
        pool.proxy()
            .then(function (worker) {
                return worker.asyncDownload(data, {cwd, DEFAULT_DIR});
            })
            .then(function (result) {
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
    if (!(ALL_PRO && ALL_PRO.length)) {
        console.log("仓库列表为空")
        console.timeEnd("执行时间")
        return
    }

    console.log(`获取到${ALL_PRO.length}条仓库列表数据`)
    if (args.workers) {
        // worker 模式执行
        console.log(`开始以多线程模式执行任务...`)
        let chunkSize = parseInt(ALL_PRO.length / WORKERS_COUNTS)
        let chunkArr = array.chunk(ALL_PRO, ALL_PRO.length <= WORKERS_COUNTS ? ALL_PRO.length : chunkSize)
        const pool = workerpool.pool("./download.js");
        for (let i = 0; i < chunkArr.length; i++) {
            await WORK_TASK(chunkArr[i], pool)
        }
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
    if (NEED_COMPRESSION) {
        console.log(`开始执行压缩...`)
        await zip()
        console.log(`压缩任务完成...`)
    }
    console.timeEnd("执行时间")
}

INIT()

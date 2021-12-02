const axios = require("axios")
const CONFIG = require("./config")

const {GITLAB_TOKEN, GITLAB_URL, GITLAB_API_VERSION} = CONFIG

//业务请求配置开始
axios.defaults.baseURL = GITLAB_URL + GITLAB_API_VERSION
axios.defaults.headers.common['PRIVATE-TOKEN'] = GITLAB_TOKEN
//业务请求配置结束


const getALLProjects = async function (resultData = [], defaultPage = 1) {
    const beforeData = resultData || [];
    let res = await axios.request({
        url: "/projects",
        method: "get",
        params: {
            per_page: 50,
            page: defaultPage,
            owned: false, // 下载 权限为owned的仓库
            /*
            * No access (0)
            * Minimal access (5) (Introduced in GitLab 13.5.)
            * Guest (10)
            * Reporter (20)
            * Developer (30)
            * Maintainer (40)
            * Owner (50) - Only valid to set for groups
            * */
            min_access_level: 10 // 下载为可访问的所有权限
        }
    })

    if (res.status >= 200 && res.status < 204) {
        const page = +res.headers['x-page']
        const pageSize = +res.headers['x-per-page']
        const total = +res.headers['x-total']
        if (beforeData.length !== total && res.data.length) {
            // console.log("page + 1", res);
            await getALLProjects(res.data, defaultPage + 1);
        }
        beforeData.push(...res.data);
    }

    return beforeData
}

module.exports = getALLProjects

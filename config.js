module.exports = {
    DEFAULT_DIR: "fe", // 存放文件的根目录
    GITLAB_TOKEN: "", // gitlab Token. getToken: https://gitlab.hello.com/-/profile/personal_access_tokens
    GITLAB_URL: "", // gitlabUrl eg:https://gitlab.hello.com
    API_VERSION: "/api/v4", // gitlab的调用版本
    needCompression: false, // 下载完成后是否需要压缩
    cwd: process.cwd(),
    CLEAR_MODE: true, // 是否每次执行都清除原先的文件
}

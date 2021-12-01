module.exports = {
    DEFAULT_DIR: "fe", // 存放文件的根目录

    // 下面参数是必填项
    GITLAB_TOKEN: "", // gitlab Token. getToken: https://gitlab.hello.com/-/profile/personal_access_tokens
    GITLAB_URL: "", // gitlabUrl eg:https://gitlab.hello.com
    GITLAB_USERNAME: "", // GITLAB_CLONE_MODE 为HTTPS必填
    GITLAB_PASSWORD: "", // GITLAB_CLONE_MODE 为HTTPS必填
    GITLAB_CLONE_MODE: 'HTTPS', // HTTPS,SSH 拉取代码的模式
    // 必填项结束

    WORKERS_COUNTS: 4, // 线程数量
    API_VERSION: "/api/v4", // gitlab的调用版本
    needCompression: false, // 下载完成后是否需要压缩
    cwd: process.cwd(),
    CLEAR_MODE: true, // 是否每次执行都清除原先的文件

}

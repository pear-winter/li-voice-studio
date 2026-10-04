## 安卓版与同步

[下载安卓 APK 1.2.0](https://github.com/pear-winter/li-voice-studio/raw/refs/heads/main/downloads/li-voice-1.2.0.apk)

安卓应用 **♪梨梨配音室 1.2.0**，包名 `net.pearvoice.app`，支持 Android 8.0 及以上，需要较新的 Android System WebView。应用独立运行，无需酒馆或任何插件。配音与翻译使用联网 API，录音、歌曲、歌词、音色和接口保存在应用本地；已有音频可离线播放。卸载应用会删除本地数据。

**歌曲**：导入音频，展开条目后导入或更换 LRC。歌词随播放进度高亮，点击歌词跳转；支持 UTF-8 / GB18030、多个时间标签与 offset。可按歌名或歌词搜索、下载歌曲和歌词、确认删除。单首音频最大 50 MB。

**配置 → 导入与导出**：APK 与插件使用同一种 `.livoice.json` 文件，App 文件包含录音、歌曲及歌词、音色、已保存的 MiniMax / 副 API 接口。插件 1.10.0 起仅导入录音及配置，跳过歌曲。导入不会删除其他内容；重复 ID 默认保留本地版本，选择「使用导入版本」可更新已有音色、接口与歌词。外观与当前页面偏好仍使用本机设置。未导出 Key 时，导入不会清掉已有 Key。若要把 Key 一起迁移，导出前勾选「包含 API Key」；该文件包含明文 Key，请自行保管。单次同步音频总量最大 100 MB。

**1.8.0 插件**：新增歌曲与歌词存储、跨端导入导出；旧录音数据库自动升级并保留。酒馆助手脚本不随此版本更新。

### 构建 APK

安装 Android SDK Platform 35 / Build Tools 35.0.0、Java 17 与 Eclipse ECJ 3.38.0。设置 `ANDROID_SDK_ROOT`、`ECJ_JAR` 和 `VOICE_SIGNING_DIR` 后运行 `python3 android/build-apk.py`。签名目录包含 `release.p12` 与 `password.txt`，别名 `pear`；签名资料不得放入公开仓库。构建会从 android/core.js 和 android/core-style.css 复制应用逻辑及样式，输出 `android/build/li-voice-1.2.0.apk`。

验证：浏览器自动化覆盖数据库升级、跨端音频逐字节对比、合并去重、Key 选择性导出、非法文件拒绝、歌词定位及持久化；安卓包通过编译和 APK 签名校验。未使用真实 MiniMax 账户计费合成，尚未在实体安卓设备上验收。


### 安卓 1.1.0

- 右上角显示当前已保存 MiniMax 接口关联的官网余额。首次点击登录 MiniMax 中国站，确认对应账户后点击「同步余额」，再返回。之后回到 APP 或完成配音 / 音色生成时自动尝试刷新；失败显示「上次」余额，不把失败当成余额为零。点击余额打开官网消费明细。接口 Key 或站点变更后需重新关联，不把旧账户余额套给新接口。国际站提供官网入口，暂不自动同步余额。
- 配置页最底部提供 MiniMax 充值链接，交给系统浏览器打开。
- 工作台提供参考音频克隆、文字描述生成音色、试听播放和下载、加入本地音色列表及「去配音」。主参考音频为 MP3 / M4A / WAV，10 秒–5 分钟、最大 20 MB；辅助音频可选，小于 8 秒，需同时填写原文。生成模式试听文本最大 500 字符，克隆模式最大 1000 字符。已有试听播放不再调用生成 API。
- 克隆与生成遵循 MiniMax 的账户权限和计费规则：试听合成计费，新音色首次正式合成另收音色费用；未正式调用的新音色有保留期限。请求超时或取消不代表服务端没有执行，APP 不自动重试创建。创建成功会先保存 Voice ID，再下载和保存试听，避免下载失败丢失音色信息。
- 新音色和试听继续随原有同步文件导出；官网 Cookie、余额关联和网页登录信息不导出。

余额来自登录后的官网控制台接口 `https://www.minimax.cn/account/query_balance`，并非公开的配音 API Key 查询接口。实现依据 2026-10-04 官网公开前端代码中的请求路径与字段；官网改版可能需要适配。登录页面使用独立 WebView，不暴露 APP 的文件与网络桥；仅将余额、账户 Group ID 和时间传回 APP。消费明细使用官网页面，不生成估算账单。

API 依据：
- https://platform.minimax.cn/docs/api-reference/voice-cloning-uploadcloneaudio
- https://platform.minimax.cn/docs/api-reference/voice-cloning-clone
- https://platform.minimax.cn/docs/api-reference/voice-design-design
- https://platform.minimax.cn/docs/guides/pricing-paygo

模拟接口验证覆盖 multipart 音频上传、辅助样本、64 位文件 ID 保真、克隆链接与生成 hex 试听、播放不重复请求、本地音色持久化、无效音频前置拒绝、取消、账户隔离及零余额。未使用真实账号登录或计费创建音色，也未在实体安卓手机上验证官网登录流程。

### 插件 1.9.0 / 安卓 1.2.0

配音页新增语气、0.5–2 倍语速，按音色保存在本地并随同步文件导出。自动语气不发送 emotion 参数。光标处可插入轻笑、叹气、换气等语气词（需 speech-2.8），也可插入 0.01–99.99 秒停顿（最多两位小数）。停顿需位于可朗读文字之间，不可连续或放在开头、末尾。生动、低语语气需 speech-2.6。余额、充值链接与克隆工作台仍仅在安卓应用中提供。

黑白线框 CSS 修复按钮点击、焦点、选中及禁用状态的前景与背景配对，避免白底白字。请替换配置中已保存的旧 CSS。

依据：https://platform.minimax.cn/docs/api-reference/speech-t2a-http


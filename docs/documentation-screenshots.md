# 官网教程截图维护

官网文章属于后端 `RelaxKonServer/Content/Docs/{language}/latest/`；图片属于官网前端 `public/assets/docs/screenshots/{language}/`，通过同源 `/assets/docs/screenshots/...` URL 加载。公开 API 不托管这些静态图片，部署时前后端必须一起更新。

当前每种语言有 20 个截图位置，共 60 张 SVG 占位图。它们显示“截图占位／Screenshot placeholder／仮画像”，不是模拟产品界面。文章在图片下方标明应展示的内容，`manifest.json` 保存 slot、语言、所属文章、URL、拍摄说明和状态，便于逐项替换。

## 替换真实截图

1. 用对应语言的当前客户端拍摄 manifest 中要求的界面。按文章步骤拍摄主机连接、预检、来源、配置、审阅、结果或功能操作，不用截图宣称尚未完成的验收。
2. 遮盖真实地址、账号、密钥、密码、令牌、有效配对码和敏感路径。保留用于理解流程的字段标签、阶段、结果和示例值。
3. 图片优先使用 16:9、1200×675 或更高分辨率 PNG/WebP；保留清晰文字。移动端截图可使用实际竖屏比例，不拉伸画面。
4. 以相同 slot 名添加 `.png` 或 `.webp`，更新对应 Markdown 图片 URL、alt 文本和 manifest 的 URL，将状态改为 `screenshot`，并删除已不再引用的旧 SVG。
5. 中英日保留相同截图位置，各自使用对应语言图片。文章内图片下的“截图位置／Capture／撮影箇所”说明改成适合真实截图的图注。
6. 执行 `node tools/verify-doc-screenshots.mjs`，后端执行 `node tools/verify-doc-links.mjs` 和 `node tools/verify-doc-order.mjs`，再构建官网并预览正文。

## 截图位置

| 教程 | slot |
| --- | --- |
| 远程安装 | `remote-host`、`remote-preflight`、`remote-source`、`remote-options`、`remote-review`、`remote-result` |
| 更新、卸载与维护 | `maintenance-status`、`maintenance-update`、`maintenance-repair`、`maintenance-rollback`、`maintenance-uninstall` |
| 文件管理器 | `files-navigation`、`files-transfer` |
| 文件传输 | `transfer-progress` |
| 终端 | `terminal-session` |
| 设置 | `settings-preferences` |
| Docker | `docker-engine`、`docker-container` |
| Windows 本机 | `windows-local-mode`、`windows-device-pairing` |

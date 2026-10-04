# 教程截图替换说明

文档中心新增三篇教程，每篇 4 个截图位置，中文、英文、日文分别使用对应语言目录中的图片。

占位图为 SVG，尺寸为 1440 × 900。每个文件中的标题标明截图内容，文档中的图片下方也保留相同说明。

| 文件名 | 截图内容 |
| --- | --- |
| tutorial-connect-1.svg | 客户端准备或下载页面 |
| tutorial-connect-2.svg | 客户端的 Server / SSH 连接方式选择 |
| tutorial-connect-3.svg | Server 登录信息和 SSH 隧道选项 |
| tutorial-connect-4.svg | 登录成功后的完整桌面 |
| tutorial-desktop-1.svg | 开始菜单与文件管理器入口 |
| tutorial-desktop-2.svg | 窗口标题栏、控制按钮和边缘 |
| tutorial-desktop-3.svg | 文件管理器和终端同时打开 |
| tutorial-desktop-4.svg | 设置中的外观或工作区偏好 |
| tutorial-files-terminal-1.svg | 文件管理器中的用户目录与地址栏 |
| tutorial-files-terminal-2.svg | 练习文件夹及重命名操作 |
| tutorial-files-terminal-3.svg | 终端的只读命令与输出 |
| tutorial-files-terminal-4.svg | 文件管理器与终端的工作位置 |

实际截图建议使用 PNG 或 WebP。将图片放入本目录的对应语言子目录，保留相同文件名前缀，再把 RelaxKonServer/RelaxKonServer/Content/Docs/<语言>/latest/getting-started/tutorial-*.md 中的图片扩展名改为 .png 或 .webp。例如 tutorial-connect-3.svg 改为 tutorial-connect-3.png。仅修改扩展名不会把 SVG 转成真实截图。

截图请使用演示账号并遮盖密码、密钥、令牌、真实主机地址和私人文件。保持页面可读，尽量使用一致的窗口尺寸与主题。各语言可以分别截图；如共用同一截图，请在三种语言的文档中改用同一图片路径。

文档由后端提供，占位图和实际截图由官网前端 public 目录提供；上线需要一并更新两者。

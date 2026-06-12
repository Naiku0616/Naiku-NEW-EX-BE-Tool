# BiliRSS · 突破 B 站 5000 关注上限的浏览器扩展

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](https://developer.chrome.com/docs/extensions/mv3/intro/)

**BiliRSS** 是一款轻量级的浏览器扩展，它不直接调用 B 站关注接口，而是利用 [RSSHub](https://rsshub.app) 将你关注的 UP 主转化为标准 RSS 订阅源，从而绕过官方的 5000 关注上限，让你轻松追踪任意数量的创作者动态。

### 功能亮点

- **无限「虚拟关注」**：在 UP 主空间一键订阅，数量只受本地存储限制，无惧 5000 上限。
- **RSS 聚合导出**：将订阅列表导出为 OPML 文件，可导入 Feedly、Inoreader 等任意阅读器。
- **内置阅读器（可选）**：直接在扩展内浏览所有 UP 主动态，无需额外工具。
- **完全本地化**：你的关注列表仅保存在浏览器内，不上传任何服务器。
- **安全合规**：仅读取 B 站公开页面信息，不调用私有 API、不模拟关注请求，遵守平台规则。

### 安装方法

### 开发者模式加载

1. 克隆仓库到本地：
   ```bash
   git clone https://github.com/Naiku0616/Naiku-NEW-EX-BE-Tool
   ```
2. 打开 Chrome/Edge 浏览器，进入扩展管理页面：
   - Chrome：`chrome://extensions`
   - Edge：`edge://extensions`
3. 开启右上角的 **「开发者模式」**。
4. 点击 **「加载已解压的扩展程序」**，选择刚才克隆的文件夹。
5. 扩展图标会出现在浏览器工具栏，点击即可使用。

## 使用指南

### 订阅 UP 主

1. 访问任意 B 站 UP 主空间（例如 `https://space.bilibili.com/123456`）。
2. 在页面右下角点击粉红色的 **「🔔 RSS 订阅」** 按钮。
3. 按钮变为 **「✅ 已订阅」** 即表示成功。你可以在扩展弹窗中看到完整的订阅列表。

### 导出 OPML 到阅读器

1. 点击浏览器工具栏中的扩展图标，打开弹窗。
2. 点击 **「导出 OPML」**，浏览器会下载一个 `bilibili_subscriptions.opml` 文件。
3. 打开你喜欢的 RSS 阅读器（如 Feedly、NetNewsWire），使用导入 OPML 功能即可看到所有动态。

### 使用内置阅读器

- 在弹窗底部点击 **「内置阅读器」**（如果已启用），将在新标签页打开动态流。
- 点击 **「刷新全部」** 获取所有订阅 UP 主的最新动态（首次加载可能需要一些时间，取决于订阅数量）。

### 自定义 RSSHub 地址

为避免公共 RSSHub 实例的请求频率限制，你可以搭建私有实例（[RSSHub 部署指南](https://docs.rsshub.app/install/)），然后在代码中将 `RSSHUB_BASE` 修改为你的域名。

## 项目结构

```
bilirss/
├── icons/              # 扩展图标
├── manifest.json       # 扩展描述文件
├── background.js       # Service Worker（数据存储与消息中转）
├── content.js          # 内容脚本（页面按钮注入）
├── popup.html          # 弹出窗口界面
├── popup.js            # 弹出窗口逻辑
├── popup.css           # 弹出窗口样式
├── reader.html         # 内置阅读器页面（可选）
├── reader.js           # 阅读器逻辑（RSS 解析与聚合）
├── reader.css          # 阅读器样式
└── README.md
```

## 技术细节

- **前端**：原生 JavaScript，使用 `MutationObserver` 适配 B 站 Vue 单页应用的异步渲染。
- **数据存储**：`chrome.storage.local`，无限容量。
- **RSS 源**：基于 RSSHub 的 `/bilibili/user/dynamic/:uid` 路由。
- **扩展标准**：Manifest V3，仅申请必要权限（`storage`、`alarms`、`downloads`、`host_permissions`）。
- **安全**：所有数据处理均在本地，无需用户登录 Cookie。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

### 本地开发

1. Fork 本仓库。
2. 克隆到本地后，在 `chrome://extensions` 中加载已解压的扩展。
3. 修改代码后刷新扩展即可看到效果。

### 待办事项

- [ ] 支持从视频页面一键订阅 UP 主。
- [ ] 增加导入/导出 JSON 格式的备份恢复功能。
- [ ] 添加搜索和分类管理功能。
- [ ] 上架 Chrome / Edge 应用商店。

## 开源协议

本项目采用 [MIT License](LICENSE) 开源，你可以自由使用、修改和分发，但需保留原始版权声明。

---

**如果这个扩展对你有帮助，请给个 Star ⭐️，让更多人看到！**

**免责声明**：本项目为第三方工具，与哔哩哔哩官方无关。请合理使用，遵守 B 站用户协议，不得用于商业或滥用目的。

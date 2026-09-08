# 制茶模拟器 · GitHub Pages 部署指南

## 一键部署

### 方法一：直接上传（最简单）

1. **创建 GitHub 仓库**
   - 登录 GitHub，点击右上角「+」→「New repository」
   - 仓库名随意填写（例如 `tea-simulator`），设为 Public
   - 不需要勾选任何初始化选项，直接 Create

2. **上传所有文件**
   - 进入刚创建的仓库，点击「Add file」→「Upload files」
   - 把本目录下的**所有文件和文件夹**直接拖进去（包括 index.html、manifest.json、sw.js、styles.css、assets/、components/ 等）
   - 底部点「Commit changes」

3. **开启 GitHub Pages**
   - 仓库顶部点击「Settings」
   - 左侧菜单找到「Pages」
   - Source 选择「Deploy from a branch」
   - Branch 选择 `main` / 根目录 `/`，点 Save
   - 等待 1~2 分钟，页面顶部会出现绿色的 **Your site is live at https://用户名.github.io/仓库名/**

### 方法二：Git 命令行

```bash
# 1. 新建仓库后，克隆到本地
git clone https://github.com/你的用户名/仓库名.git
cd 仓库名

# 2. 把所有文件复制进去
# （把解压出来的全部文件复制到仓库根目录）

# 3. 提交并推送
git add .
git commit -m "初版：制茶模拟器"
git push -u origin main

# 4. 在 GitHub 仓库 Settings → Pages 开启 Pages 服务即可
```

## 验证 PWA 功能

部署完成后用 **Chrome / Edge** 浏览器访问：

1. **Service Worker 注册成功**
   - 按 F12 打开开发者工具 → Application → Service Workers
   - 能看到 sw.js 状态为 `activated and is running`

2. **离线可用**
   - 在 Service Workers 面板勾选「Offline」
   - 刷新页面，应用仍能正常打开并使用所有功能

3. **可安装**
   - 地址栏右侧会出现「安装」图标
   - 点击即可安装到桌面/开始菜单
   - 手机 Chrome 访问时会弹出「添加到主屏幕」提示
   - iOS Safari：点分享按钮 →「添加到主屏幕」

4. **Manifest 有效**
   - F12 → Application → Manifest
   - 能看到应用名称、图标、主题色等信息均正确加载

## 文件结构

```
.
├── index.html              主页面
├── manifest.json           PWA 清单
├── sw.js                   Service Worker
├── styles.css              样式
├── tea-data.js             茶叶原始数据
├── data-layer.js           数据层（成就计算、进度存储）
├── app.jsx                 主应用（路由+错误隔离）
├── components/
│   ├── home.jsx            首页
│   ├── craft-simulator.jsx 工艺模拟
│   ├── quiz.jsx            知识问答
│   ├── library.jsx         茶叶图鉴
│   ├── achievements.jsx    成就系统
│   ├── onboarding.jsx      新手引导
│   └── pwa.jsx             PWA 相关组件（安装/离线提示等）
└── assets/icons/           应用图标（192/512/SVG）
```

## 子路径兼容性说明

所有资源引用均使用相对路径（`./xxx`），manifest 的 start_url / scope 也为相对路径，Service Worker 注册路径也为相对路径，因此部署在 `https://用户名.github.io/仓库名/` 子路径下可以正常工作，**不需要任何修改**。

## 更新版本后清除旧缓存

修改代码后重新 push，浏览器会自动检测到 Service Worker 版本变化并弹出「发现新版本」提示，用户点击即可刷新升级。

若需手动强制更新：
- 桌面端：Chrome DevTools → Application → Service Workers → SkipWaiting / Unregister
- 手机端：设置 → 清除网站数据

# Agent 项目练习场

把 [learnagent.org/projects/](https://learnagent.org/projects/) 的热门 Agent GitHub 项目整理成可练习、可追踪进度的练手平台。站点默认包含 21 个热门项目与 2 篇深度案例，支持方向/难度筛选、搜索、排序、完成打卡、练习笔记、我的 Agent 配置、深浅双主题和 AI 检察官。

AI 检察官是纯本地规则引擎：选择项目文件夹后，按完成度、创新度、与原项目相似度、美观度四个维度打分，并给出证据与改进建议，文件不会上传到任何服务器。

## 技术栈

- Vite + React 18 + TypeScript（strict）
- react-router-dom（HashRouter，GitHub Pages 子路径刷新不 404）
- 纯 CSS Variables + framer-motion（入场与页面切换动画）
- localStorage 持久化，无后端、无构建时网络依赖

## 本地开发

```bash
npm install
npm run dev
```

生产构建与预览：

```bash
npm run build
npm run preview
```

`npm run build` 会通过 `vite-plugin-singlefile` 把 JS/CSS 全部内联进 `dist/index.html`，这份单文件可以直接双击打开，不需要本地服务。

## 数据更新

题面数据位于 `data/projects.json`，字段包括方向、难度、摘要、技术栈、GitHub 地址、星级、学习点、建议步骤与三档验收标准。

### 1. 抓取 learnagent 项目库

```bash
# macOS / Linux
curl -L -A "Mozilla/5.0" https://learnagent.org/projects/ -o learnagent-projects.html

# Windows PowerShell
curl.exe -L -A "Mozilla/5.0" https://learnagent.org/projects/ -o learnagent-projects.html
```

从抓到的 HTML 中解析项目名称、简介、GitHub 地址、「适合学习」和「推荐做法」。若某些字段页面没有，可访问对应子页面或 GitHub 仓库补全。

### 2. 补全 GitHub 元数据

```bash
# Windows 遇到 TLS 撤销检查失败时可加 --ssl-no-revoke
curl.exe -L --ssl-no-revoke -H "User-Agent: agent-project-gym-scraper" \
  https://api.github.com/repos/<owner>/<repo>
```

从返回的 `stargazers_count`、`language`、`topics` 更新 `stars` 与 `tech`。

### 3. 重写 data/projects.json

按文件内既有结构整理 `projects` 与 `cases` 数组，并更新顶层 `updated`（learnagent 页面更新日期）与 `starsFetchedAt`（GitHub 快照日期）。

## GitHub Pages 部署

构建产物使用 `base: './'` 相对路径，路由使用 HashRouter，因此可直接部署到 `https://<user>.github.io/<repo>/` 子路径。

1. 把代码推到 `main` 分支。
2. 打开仓库 Settings → Pages，在 Source 里选择 **GitHub Actions**。
3. push 后 Actions 会自动执行 `.github/workflows/deploy.yml` 构建并发布，稍等片刻访问 `https://<user>.github.io/<repo>/`。

部署前把 `src/config.ts` 中的 `GITHUB_REPO_URL` 替换为你的仓库地址。

## 阿里云 Docker Compose 部署

先在本机构建：

```bash
npm install
npm run build
```

把 `dist` 与 `deploy` 上传到服务器，例如：

```bash
scp -r dist deploy root@8.166.100.79:/opt/agent-gym/
```

在服务器上启动：

```bash
cd /opt/agent-gym/deploy
docker compose up -d
```

Nginx 默认监听 80 端口。首次启动后如果访问返回 403，通常是 `dist` 目录权限导致 Nginx 工作进程无法读取：

```bash
chmod 755 /opt/agent-gym/dist
docker restart agent-gym
```

## 阿里云 Docker Compose 部署

先在本机构建：

```bash
npm install
npm run build
```

把 `dist` 与 `deploy` 上传到服务器，例如：

```bash
scp -r dist deploy root@8.166.100.79:/opt/agent-gym/
```

在服务器上启动：

```bash
cd /opt/agent-gym/deploy
docker compose up -d
```

Nginx 默认监听 80 端口。首次启动后如果访问返回 403，通常是 `dist` 目录权限导致 Nginx 工作进程无法读取：

```bash
chmod 755 /opt/agent-gym/dist
docker restart agent-gym
```

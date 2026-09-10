# Pulse Web

[Pulse](https://github.com/pulse-monitor/pulse) 面板的前端。

编译产物是一堆静态文件，由面板（pulse-server）通过 `PULSE_WEB_DIR` 提供。
它自己不需要跑服务。

## 开发

```bash
npm install
npm run dev          # 起 dev server，API 走 vite 代理
```

代理指向哪台面板，用环境变量控制：

```bash
PULSE_API=http://127.0.0.1:25774 npm run dev
```

## 构建

```bash
npm run build        # 产物在 dist/
```

`prebuild` 会从 node_modules 生成三份资源（国旗、世界地图多边形、系统图标），
所以它们不入库 —— 生成脚本在 [scripts/](scripts/)。

`postbuild` 会核对产物完整性：国旗数量、地图大小、有没有混进垃圾文件。

## 给面板用

面板要的是构建好的 `dist/`。三种拿法：

| 方式 | 做法 |
|---|---|
| 跟着面板装 | 安装脚本会自动下载对应版本，不用管 |
| 手动 | 从 [Releases](https://github.com/pulse-monitor/pulse-web/releases) 下 `pulse-web-dist.tar.gz` |
| 本地开发 | `PULSE_WEB_DIR=/path/to/pulse-web/dist` |

## 相关仓库

| 仓库 | 内容 |
|---|---|
| [pulse](https://github.com/pulse-monitor/pulse) | 面板（server），也是协议定义所在 |
| [pulse-agent](https://github.com/pulse-monitor/pulse-agent) | 探针 |
| [pulse-docs](https://github.com/pulse-monitor/pulse-docs) | 文档站 |

文档：<https://pulse-doc.pages.dev/>

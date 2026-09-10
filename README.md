# Pulse Web

**[Pulse](https://github.com/pulse-monitor/pulse) 的 Web 界面。**

Dashboard、服务器列表、指标图表、流量与成本、网络状态、设置。

构建产物是一组静态文件，由 Pulse Server 通过 `PULSE_WEB_DIR` 提供 ——
它自己不需要跑服务。

## 职责边界

| 负责 | 不负责 |
|---|---|
| UI 与页面路由 | 数据库 |
| 图表与数据展示 | Agent 协议实现 |
| 用户交互 | 遥测数据采集 |
| | 身份认证逻辑 |

右边这些都在 Pulse Server。

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS v4 · uPlot

图表用 uPlot 而不是 ECharts / Chart.js：首屏预算卡在 **180 KB gzip**，
CI 里超了就 fail。

地球是手写的正交投影（没有 d3-geo、没有 WebGL）。

## 开发

```bash
npm install
npm run dev
```

开发服务器会把 `/api` 代理到本机的 `http://127.0.0.1:25774`。
面板不在本机或换了端口：

```bash
PULSE_API=http://10.0.0.5:25774 npm run dev
```

## 构建

```bash
npm run build        # 产物在 dist/
```

`prebuild` 会从 `node_modules` 生成三份资源（国旗、世界地图多边形、系统图标），
所以它们**不入库** —— 生成脚本在 [scripts/](scripts/)。

`postbuild` 核对产物完整性：国旗数量、地图大小、有没有混进垃圾文件。

## 给 Server 用

| 方式 | 做法 |
|---|---|
| 跟着 Server 装 | 安装脚本自动下载对应版本，不用管 |
| 手动 | 从 [Releases](https://github.com/pulse-monitor/pulse-web/releases) 下 `pulse-web-dist.tar.gz` |
| 本地开发 | `PULSE_WEB_DIR=/path/to/pulse-web/dist` |

## 设计取向

不追求把尽可能多的指标塞进一屏。图表、数字和状态卡最终都要回答同一个问题：

> **现在有什么值得我关注？**

一条具体的规则：**采不到的指标显示为不可用，而不是 0**。
一个写着「温度 0°C」的卡片比没有这一项更糟。

## 相关仓库

| 仓库 | 内容 |
|---|---|
| [pulse](https://github.com/pulse-monitor/pulse) | Server + 协议定义 |
| [pulse-agent](https://github.com/pulse-monitor/pulse-agent) | Agent |
| [pulse-docs](https://github.com/pulse-monitor/pulse-docs) | 文档站 |

文档：<https://pulse-doc.pages.dev/>

## 许可

[MIT](LICENSE)

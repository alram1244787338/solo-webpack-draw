# Canvas 画板 (Canvas Draw)

一个基于原生 JS + Canvas 2D API 的浏览器自由绘画工具，支持画笔/橡皮擦、颜色粗细选择、撤销重做、导出 PNG。纯前端实现，零后端依赖。

## ✨ 功能一览

| 功能 | 说明 |
|------|------|
| 🖌️ **画笔绘制** | 鼠标按下→拖动→松开，Canvas 2D `lineTo` / `stroke` 平滑绘制 |
| 🧽 **橡皮擦** | 使用 `globalCompositeOperation = 'destination-out'` 真正擦除到透明（不是涂白色） |
| 🎨 **8 种预设颜色** | 黑/白/红/橙/黄/绿/蓝/紫，一键切换 |
| 📏 **笔刷粗细调节** | 1-20px 滑块实时预览，橡皮擦自动放大 3 倍 |
| ↶ **撤销 / ↷ 重做** | 双栈（undoStack + redoStack）快照管理；最多 30 步；支持键盘快捷键和按钮 |
| ⌨️ **快捷键** | `Ctrl+Z` 撤销、`Ctrl+Y` / `Ctrl+Shift+Z` 重做 |
| 📤 **导出 PNG** | 一按键下载当前画布 PNG 图片（自动补白底，避免透明 PNG） |
| 📊 **底部状态栏** | 实时显示当前工具名和画布尺寸（640 × 480） |

## 🚀 快速开始

### 前置
- Node.js ≥ 16
- npm ≥ 8

### 安装 & 启动

```bash
# 1. 进入项目目录
cd repos/19/work

# 2. 安装依赖
npm install

# 3. 启动开发服务器（带热更新）
npm run dev
```

打开浏览器访问 **http://localhost:3000** 即可开始作画 ✅

### 其他命令

```bash
# 生产构建（输出到 dist/）
npm run build

# 运行单元测试
npm test
```

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| 构建工具 | **webpack 5** + webpack-cli + webpack-dev-server |
| 代码组织 | **原生 ES Module (class-based)**，无框架（无 React/Vue） |
| 渲染 | **Canvas 2D API**（640 × 480 固定逻辑分辨率） |
| 样式 | **原生 CSS**（style-loader + css-loader 注入） |
| 测试 | **手写轻量 runner**（describe/it/expect）+ fake timers |
| HTML | **html-webpack-plugin** 自动生成 |

## 📁 目录结构

```
.
├── public/
│   └── index.html                 # HTML 模板，挂 #app 容器
├── src/
│   ├── components/
│   │   ├── App.js                 # 顶层容器：装配各模块、绑定全局事件/快捷键
│   │   ├── CanvasBoard.js         # 画板核心：Canvas 创建、绘制、橡皮擦、快照恢复、导出
│   │   └── Toolbar.js             # 侧边栏：工具切换 / 调色板 / 粗细滑块 / 撤销重做按钮
│   ├── styles/
│   │   ├── global.css             # CSS reset + 全局字体/滚动条基础样式
│   │   └── layout.css             # 各区块布局 + 控件视觉样式
│   ├── utils/
│   │   ├── HistoryManager.js      # 撤销/重做双栈管理（纯逻辑、无 DOM 依赖）
│   │   ├── common.js              # 通用工具：debounce / throttle
│   │   └── index.js               # 工具函数占位
│   └── index.js                   # webpack 入口：创建 App 实例
├── test/
│   ├── register.mjs               # 测试框架核心：describe / it / expect / 钩子
│   ├── fake-timers.mjs            # fake timers：手动推进 setTimeout / setInterval / Date.now
│   ├── runner.mjs                 # 测试执行器：加载 *.test.mjs 并输出报告
│   ├── HistoryManager.test.mjs    # 20 条 HistoryManager 纯逻辑用例
│   └── common.test.mjs            # 13 条 debounce / throttle 计时用例
├── webpack.config.js              # webpack 配置（端口 3000、HMR、@ 别名、生产 contenthash）
├── package.json
└── README.md
```

### 架构要点

- **HistoryManager** (`src/utils/HistoryManager.js`) — 纯数据类，不依赖 DOM，直接可测
- **CanvasBoard** 通过构造函数注入 HistoryManager，单一职责只管绘制
- **Toolbar** 通过 `onToolChange / onColorChange / onLineWidthChange / onUndo / onRedo` 回调与上层解耦
- **橡皮擦** 使用 `destination-out` 合成模式而非白色笔刷，避免在透明图层 / 导出时出现白色残留（导出时自动补白底）

## 🧪 测试

```bash
npm test
```

**覆盖率**（33 / 33 ✅）：

| 模块 | 用例数 | 覆盖范围 |
|------|--------|----------|
| **HistoryManager** | 20 | 初始化 / push / undo / redo / canUndo / canRedo / getter / clear / 完整状态流，含 undoStack 边界、redoStack 清空、maxSize 淘汰等 |
| **debounce** | 6 | 合批执行、0 延迟异步、默认 300ms、参数透传、this 上下文、重置计时 |
| **throttle** | 7 | 首帧语义、窗口抑制、间隔触发、默认 300ms、参数、this、长时间均匀调用统计 |

测试框架支持：`describe` 任意嵌套（自动继承父级 `beforeEach/afterEach`）、`expect` 全套断言、`useFakeTimers / advanceTimersByTime` 手动控制时间。

Canvas / DOM 相关交互未纳入，后续可按需补充端到端测试。

## 🔗 注意

- 本项目为**纯前端**，不需要任何后端服务
- 画布逻辑分辨率固定为 **640 × 480**，在容器内自适应缩放（坐标自动换算保证绘制精度）
- 开发服务器端口为 **3000**，可在 `webpack.config.js` 的 `devServer.port` 修改

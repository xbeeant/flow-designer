# @xbeeant/flow-designer

基于 [bpmn-js](https://github.com/bpmn-io/bpmn-js) 构建的 **Flowable BPMN 流程设计器**（React 组件）。

开箱即用地提供工具栏、组件面板、画布、属性配置面板、流程校验、XML 预览与流程仿真，并对 **Flowable 专有扩展**（异步配置、多实例、监听器、表单、Service Task 类型、In/Out 参数映射、历史级别等）提供了完整支持。

## 特性

- 🎨 **可视化编辑**：拖拽生成 BPMN 元素，支持选择、移动、连线、撤销/重做、缩放、删除
- 📦 **Flowable 专有扩展**：内置 `flowable` + `design` moddle 扩展，属性面板覆盖 Flowable 特有属性
- 🧩 **数据驱动属性面板**：每种 BPMN 元素类型 → 一组面板配置（`panel-items.tsx`），新增类型只需追加一行声明
- 🪄 **Service Task 多类型配置**：HTTP、Email、Shell、External Worker、Camel、DMN、Mule、普通（class / expression / delegateExpression）
- 👂 **监听器配置**：Execution Listener、Task Listener、Event Listener、Global Event（start / taskAssign / taskComplete / taskDelete 等）
- 📋 **多实例 & 表单**：多实例循环特性（并行/串行、集合、完成条件）、Flowable 表单绑定
- 🧭 **流程校验**：开启后自动校验流程合法性并将错误定位到画布
- 🌐 **国际化**：内置中文 / English，可一键切换
- 🔍 **XML 预览 / 流程图预览 / 流程仿真**：所见即所得

## 技术栈

| 技术 | 用途 |
|------|------|
| [bpmn-js](https://github.com/bpmn-io/bpmn-js) | BPMN 图形编辑核心 |
| React 19 + TypeScript | 组件层与应用工程 |
| [antd](https://ant.design/) + [@ant-design/pro-components](https://procomponents.ant.design/) | 属性面板 UI |
| [lucide-react](https://lucide.dev/) | 图标 |
| Tailwind CSS 4 | 样式 |
| [Vite](https://vitejs.dev/) | 构建 |

---

## 安装

```bash
# monorepo 内直接使用工作区
bun install

# 单独安装（发布后）
bun add @xbeeant/flow-designer
```

> 依赖要求：`react`、`react-dom`、`antd`（peer dependency）。

## 快速开始

```tsx
import { BpmnDesigner } from '@xbeeant/flow-designer';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ width: '100%', height: '100vh' }}>
        <BpmnDesigner
          // 表单服务配置（用于属性面板中「表单」的拉取与保存）
          forms={{
            parentFormKey: '2079378178966974464',
            search: {
              url: '/forms/api/form/published?...',
              option: { label: 'name', value: 'formVersionId' },
            },
            detail: (v) => `/forms/api/form/schema?formId=${v}`,
            onSave: async (schema) => '2079378178966974464',
          }}
          value={savedXml}      // 可选：初始 BPMN XML，不传则使用默认空白流程
          onSave={(xml) => {
            // 点击保存按钮时触发，xml 为当前流程图数据
            console.log('[bpmn]', xml);
          }}
        />
      </div>
    </ConfigProvider>
  );
}
```

> 设计器整体基于 antd 组件，外层建议包裹 `ConfigProvider` 以统一中英文。

## API

### `BpmnDesigner`

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `forms` | [`BpmnForm`](#bpmnform) | ✅ | 表单服务配置，用于属性面板中表单的拉取与保存 |
| `config` | [`BpmnDesignerConfig`](#bpmndesignerconfig) | — | 透传给 bpmn-js `Modeler` 的配置（渲染器、键盘等） |
| `value` | `string` | — | 初始 BPMN XML；不传则载入默认空白流程 |
| `onSave` | `(xml: string) => void` | — | 点击「保存」时回调当前 BPMN XML |
| `enableValidation` | `boolean` | — | 是否启用流程校验，默认 `true` |

### `BpmnForm`

```ts
interface BpmnForm {
  parentFormKey: string;
  search: {
    url: string;
    option: { label: string; value: string };
  };
  detail: (value: string) => string;
  onSave: (schema: XRenderSchema) => Promise<string>;
}
```

`XRenderSchema` 为 x-render 表单 schema 结构（见 `packages/lib/src/bpmn-designer/types.ts`）。

### `BpmnDesignerConfig`

透传给 bpmn-js `Modeler`，同时支持以下内置默认值（可通过 config 覆盖）：

```ts
interface BpmnDesignerConfig {
  container?: HTMLElement;
  translate?: TranslateFunction;
  bpmnRenderer?: BpmnRendererOptions;   // 默认 fill #ffffff / stroke #475569 / label #1e293b
  textRenderer?: TextRendererOptions;
  keyboard?: { bindTo?: HTMLElement };
  [key: string]: any;
}
```

内置附加模块：`TranslateModule`（国际化）、`GridLineModule`（网格背景）；内置 moddle 扩展：`flowable`、`design`。

## 工具栏能力

| 分区 | 能力 |
|------|------|
| 文件 | 新建 / 打开（导入 XML）/ 保存 / 导出 BPMN / 预览 XML（复制） |
| 编辑 | 撤销 / 重做 / 删除 |
| 视图 | 缩小 / 放大 / 适应画布 |
| 预览 | 流程图预览 / 流程仿真（Token Simulation） |
| 其它 | 流程校验开关 / 中英文切换 |

## Flowable 属性覆盖

属性面板基于数据驱动（`panel-items.tsx`），按元素类型自动组装。覆盖范围：

- **流程级**：候选组 / 候选人、版本标签、历史存活时间、任务列表中可启动、历史级别（`flowable:HistoryLevel`）、失败重试周期（`flowable:FailedJobRetryTimeCycle`）
- **开始事件**：`initiator`、`formKey`、`formHandlerClass`
- **边界事件**：`cancelActivity`（可中断）
- **用户任务**：`assignee` + 候选人/组（三选一校验）、`dueDate`、`priority`、`formKey`、`formHandlerClass`
- **服务任务**：`class` / `expression` / `delegateExpression` / `resultVariableName` / `triggerable`，以及按 `type` 分发的 HTTP/Email/Shell/External/Camel/DMN/Mule 详细配置（`flowable:Field` 注入）
- **脚本任务**：`script`、`scriptFormat`、`resultVariable`、`autoStoreVariables`、`resource`、`skipExpression`
- **业务规则任务**：DMN 决策引用相关属性
- **调用活动**：`calledElement`、继承变量/业务键、In/Out 参数映射表格
- **通用**：异步配置（`async` / `asyncBefore` / `asyncAfter` / `exclusive`）、跳过表达式、多实例（并行/串行、集合、元素变量、完成条件、`noWaitStatesAsyncLeave`）、Execution/Task Listener、表单
- **事件定义**：消息、信号（含 `signalScope`）、定时器、错误、条件、补偿、升级、终止、Flowable 变量监听事件
- **连接线**：`conditionExpression`、`skipExpression`
- **子流程**：`triggeredByEvent`、AdHoc 相关属性

> 更完整的属性字段与扩展机制说明见仓库根目录 [`BPMN-Flowable-Designer-Guide.md`](BPMN-Flowable-Designer-Guide.md)。

## 开发

这是一个 lerna + bun workspace 的 monorepo：

```
flow-designer/
├── packages/
│   ├── lib/        # 核心设计器库 @xbeeant/flow-designer
│   └── examples/   # 示例应用（引用 lib 源码）
├── biome.json      # 根目录 Biome 配置
└── BPMN-Flowable-Designer-Guide.md
```

### 常用命令

```bash
# 安装依赖
bun install

# 启动示例应用（会用到 lib 的源码）
npm run dev --workspace @xbeeant/flow-designer-examples
# 等价于 cd packages/examples && bun dev

# 构建 lib（多格式）
cd packages/lib
npm run build          # ES（vite build -f es）
npm run build:cjs
npm run build:es
npm run build:amd
npm run build:umd

# 类型检查
cd packages/lib && bunx tsc -b

# 代码格式化 / 检查（根目录）
bunx @biomejs/biome check --write .
```

### 构建说明（`packages/lib/vite.config.ts`）

- **库模式多入口**：`es`/`cjs` 按 `src/**` 保留模块结构输出到 `dist/<format>`；`amd`/`umd` 输出单文件
- **外部依赖按包名处理**：通过 `package.json` 的 dependencies/peerDependencies 生成裸模块正则做 `external`，避免把解析后的绝对路径写进产物
- **产物清理**：`emptyOutDir` 开启，构建时自动移除已删除源文件遗留的孤儿产物

## 项目结构

```
src/
├── index.ts                          # 入口，导出 BpmnDesigner
├── index.css                         # 全局样式（Tailwind 入口）
└── bpmn-designer/
    ├── index.tsx                     # 主设计器组件：布局 + 模块编排
    ├── types.ts                      # 类型定义（BpmnDesignerProps / BpmnForm / XRenderSchema 等）
    ├── translate.ts / lang/          # 国际化
    ├── flowable.json                 # Flowable moddle 扩展描述符
    ├── flowable-design.json          # 设计期扩展描述符
    ├── components/
    │   ├── panel-items.tsx           # 元素类型 → 属性面板配置（数据驱动）
    │   ├── PropertiesPanel.tsx       # 属性面板容器
    │   ├── CanvasComponent.tsx       # 画布
    │   ├── Palette.tsx               # 左侧组件面板
    │   ├── Toolbar.tsx               # 顶部工具栏
    │   ├── ProcessPreview.tsx        # 流程图预览
    │   ├── ProcessSimulation.tsx     # 流程仿真
    │   ├── ValidationPanel.tsx       # 校验结果面板
    │   ├── service-task/             # Service Task 各类型配置
    │   ├── event-definition/         # 事件定义配置
    │   └── end-event/                # 结束事件配置
    ├── hooks/                        # React hooks（modeler 封装、属性更新、各类面板数据）
    ├── properties/                   # 复用的弹窗 / 表格组件
    └── util/                         # 工具函数（extension-elements 读写、随机 id 等）
```

## License

MIT
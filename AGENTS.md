# Flow Designer Agents

基于 bpmn-js 的 Flowable 流程设计器，采用 React + TypeScript 构建，使用 Ant Design 作为 UI 组件库，lucide-react 作为图标库。

## 项目架构

```
flow-designer/
├── packages/
│   ├── lib/           # 核心设计器库 (@xbeeant/flow-designer)
│   │   └── src/
│   │       ├── bpmn-designer/   # BPMN 设计器核心模块
│   │       │   ├── lang/        # 国际化语言文件
│   │       │   ├── util/        # 工具函数
│   │       │   ├── index.tsx    # 主组件
│   │       │   ├── types.ts     # 类型定义
│   │       │   └── translate.ts # 翻译函数
│   │       ├── index.ts         # 入口文件
│   │       └── index.css        # 全局样式
│   └── examples/      # 示例应用
├── biome.json         # Biome 配置（根目录）
├── lerna.json         # Lerna 配置
└── bun.lock           # Bun 依赖锁文件
```

## 核心组件

### 1. BpmnDesigner

**位置**: [packages/lib/src/bpmn-designer/index.tsx](file:///Users/amybee/Codes/xbeeant/flow-designer/packages/lib/src/bpmn-designer/index.tsx)

**当前状态**: 骨架组件，尚未实现完整功能

**职责**: 主设计器组件，整合工具栏、组件面板、画布和属性面板。

**TODO - 待实现功能**:
- [ ] 流程画布渲染（集成 bpmn-js）
- [ ] 工具栏操作（新建、打开、保存、导出）
- [ ] Flowable 组件栏（拖拽添加流程元素）
- [ ] 属性配置面板（配置流程元素属性）
- [ ] 流程模拟（Token Simulation）

**当前实现**:

```tsx
const BpmnDesigner = () => {
  return (
    <div className='flex flex-col h-full w-full flow-designer'>
      {/*工具栏*/}
      {/*flowable组件栏*/}
      {/*bpmnjs画布*/}
      {/*属性配置栏*/}
    </div>
  );
};
```
bpmn的结构定义
[bpmn的结构定义](file:///Users/amybee/Codes/xbeeant/flow-designer/bpmn-structure.md)
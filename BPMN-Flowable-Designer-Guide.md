# BPMN-Flowable 流程设计器开发指南

## 一、项目概述

本项目是一个基于 bpmn-js 构建的 Flowable 流程设计器，支持完整的 BPMN 2.0 标准及 Flowable 特有扩展。设计器核心逻辑与前端框架解耦，可集成到 Vue、React、Angular 等任意前端框架中。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| TypeScript | 5.8.x | 类型系统 |
| bpmn-js | 18.6.x | BPMN 图形编辑核心 |
| Codemirror | 6.x | 代码编辑器 |

---

## 二、bpmn-js 自定义流程设计器实现细节

### 2.1 核心架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        ProcessDesigner                          │
│  ┌───────────────────┐    ┌──────────────────────────────────┐ │
│  │   BpmnModeler     │    │            PropertyPanel          │ │
│  │  (画布/渲染引擎)   │    │        (属性编辑面板)              │ │
│  └─────────┬─────────┘    └──────────────────────────────────┘ │
│            │                                                        │
│            ▼                                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    bpmn-js 核心模块                            │ │
│  │  Canvas | EventBus | ElementRegistry | Modeling | CommandStack│ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 模型器初始化配置

核心文件：`BpmnModeler.ts`

```typescript
const modeler = new BpmnModeler({
  container: canvasRef.value,
  additionalModules: [
    GridLineModule,          // 网格背景
    CustomModeling,          // 自定义建模
    MinimapModule,           // 小地图
    Translate,               // 国际化
    LintModule,              // 校验模块
    TokenSimulationModule,   // 流程模拟
    httpTaskRenderer,        // 自定义渲染器
    CustomContextPad,        // 右键菜单
    CustomPopupMenu,         // 弹出菜单
    CustomReplace,           // 替换功能
    ElementParse,            // 解析模块
    RerenderPalette,         // 工具栏
    BpmnColorPickerModule,   // 颜色选择器
  ],
  moddleExtensions: {
    flowable: flowableModdleDescriptors,  // Flowable 扩展定义
  },
})
```

### 2.3 事件监听机制

核心文件：`PropertyPanel.ts`

```typescript
eventBus.on('selection.changed', (e) => {
  // 元素选中变化
})
eventBus.on('elements.changed', (e) => {
  // 元素属性变化
})
eventBus.on('root.added', (e) => {
  // 根元素添加
})
eventBus.on('replace.end', (e) => {
  // 元素替换完成
})
```

### 2.4 属性更新机制

核心文件：`service.ts`

```typescript
const updateProperties = (props: Record<string, any>, moddleElement?: ModdleElement) => {
  const modeling = getService<Modeling>('modeling')
  const businessObject = getBusinessObject(bpmnContext.selectedElement)
  modeling?.updateModdleProperties(
    bpmnContext.selectedElement,
    moddleElement || businessObject,
    props,
  )
}
```

**关键点**：必须通过 `modeling.updateModdleProperties` 更新属性，以确保操作记录到撤销栈。

---

## 三、Flowable 流程设计器实现细节

### 3.1 Flowable 扩展定义

核心文件：[flowable.json](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/flowable.json)

这是整个 Flowable 支持的核心，定义了所有 Flowable 特有的扩展类型。

#### 3.1.1 扩展类型分类

| 类型分类 | 说明 | 示例 |
|----------|------|------|
| **基础扩展** | 为标准 BPMN 元素添加 Flowable 属性 | AsyncCapable、JobPriorized |
| **任务扩展** | Flowable 特有任务类型 | ServiceTaskLike、ExternalCapable |
| **表单扩展** | 表单相关定义 | FormSupported、FormProperty、FormData |
| **监听器扩展** | 执行监听器和任务监听器 | ExecutionListener、TaskListener |
| **多实例扩展** | 多实例循环特性 | Collectable、VariableAggregation |
| **连接器扩展** | ServiceTask 连接器 | Connector、InputOutput |
| **事件扩展** | 事件定义扩展 | VariableListenerEventDefinition |

#### 3.1.2 关键扩展类型定义

**AsyncCapable（异步能力）**

```json
{
  "name": "AsyncCapable",
  "isAbstract": true,
  "extends": ["bpmn:Activity"],
  "properties": [
    {"name": "async", "isAttr": true, "type": "Boolean", "default": false},
    {"name": "asyncBefore", "isAttr": true, "type": "Boolean", "default": false},
    {"name": "asyncAfter", "isAttr": true, "type": "Boolean", "default": false},
    {"name": "exclusive", "isAttr": true, "type": "Boolean", "default": true}
  ]
}
```

**ServiceTaskLike（服务任务类型）**

```json
{
  "name": "ServiceTaskLike",
  "extends": ["bpmn:ServiceTask", "bpmn:BusinessRuleTask", "bpmn:SendTask"],
  "properties": [
    {"name": "expression", "isAttr": true, "type": "String"},
    {"name": "class", "isAttr": true, "type": "String"},
    {"name": "delegateExpression", "isAttr": true, "type": "String"},
    {"name": "resultVariableName", "isAttr": true, "type": "String"},
    {"name": "skipExpression", "isAttr": true, "type": "String"}
  ]
}
```

### 3.2 自定义 BPMN 工厂

核心文件：[CustomBpmnFactory.ts](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/Modeling/CustomBpmnFactory.ts)

```typescript
export default class CustomBpmnFactory extends BpmnFactory {
  create(type: string, attrs?: any): ModdleElement {
    if (type === 'bpmn:AdHocSubProcess') {
      attrs = { ...attrs, cancelRemainingInstances: 'true', ordering: 'Parallel' }
    } else if (type === 'bpmn:CallActivity') {
      attrs = { ...attrs, calledElementType: 'key' }
    } else if (type === 'bpmn:StartEvent') {
      attrs = { ...attrs, initiator: 'initiator' }
    } else if (type === 'bpmn:ScriptTask') {
      attrs = { ...attrs, scriptFormat: 'javascript' }
    }
    return super.create(type, attrs)
  }
}
```

### 3.3 ServiceTask 类型分发

核心文件：`PropertyPanel.tsx`

```typescript
if (is(element, 'bpmn:ServiceTask')) {
  if (businessObject.type === 'http') {
    slots.basic.push('HttpTask')
  } else if (businessObject.type === 'camel') {
    slots.basic.push('CamelTask')
  } else if (businessObject.type === 'shell') {
    slots.basic.push('ShellTask')
  } else if (businessObject.type === 'email') {
    slots.basic.push('EmailTask')
  } else if (businessObject.type === 'cc') {
    slots.basic.push('CcTask')
  } else if (businessObject.type === 'external-worker') {
    slots.basic.push('ExternalTask')
  } else if (businessObject.type === 'dmn') {
    slots.basic.push('DecisionTask')
  } else if (businessObject.type === 'mule') {
    slots.basic.push('MuleTask')
  } else if (businessObject.type === 'jump') {
    slots.basic.push('JumpTask')
  } else {
    slots.basic.push('ServiceTask')
  }
}
```

---

## 四、Flowable 流程组件属性字段与规则

### 4.1 流程组件分类

#### 4.1.1 事件类型 (Event)

| 组件 | 标识 | 属性字段 |
|------|------|----------|
| **开始事件** | bpmn:StartEvent | id, name, initiator, formKey, formHandlerClass |
| **结束事件** | bpmn:EndEvent | id, name |
| **中间捕获事件** | bpmn:IntermediateCatchEvent | id, name |
| **中间抛出事件** | bpmn:IntermediateThrowEvent | id, name |
| **边界事件** | bpmn:BoundaryEvent | id, name, cancelActivity |

#### 4.1.2 事件定义类型

| 事件定义 | 标识 | 属性字段 |
|----------|------|----------|
| **消息事件** | bpmn:MessageEventDefinition | messageRef |
| **信号事件** | bpmn:SignalEventDefinition | signalRef, async |
| **定时器事件** | bpmn:TimerEventDefinition | timeDate, timeDuration, timeCycle |
| **错误事件** | bpmn:ErrorEventDefinition | errorRef, errorCodeVariable, errorMessageVariable |
| **条件事件** | bpmn:ConditionalEventDefinition | condition, variableName, variableEvent |
| **补偿事件** | bpmn:CompensateEventDefinition | waitForCompletion, activityRef |
| **升级事件** | bpmn:EscalationEventDefinition | escalationRef, escalationCodeVariable |
| **终止事件** | bpmn:TerminateEventDefinition | terminateAll |
| **变量事件** | flowable:VariableListenerEventDefinition | variableName, variableChangeType |

#### 4.1.3 任务类型 (Task)

| 组件 | 标识 | 属性字段 |
|------|------|----------|
| **用户任务** | bpmn:UserTask | assignee, candidateUsers, candidateGroups, dueDate, priority, formKey, formHandlerClass |
| **服务任务** | bpmn:ServiceTask | class, expression, delegateExpression, resultVariableName, type, triggerable |
| **脚本任务** | bpmn:ScriptTask | script, scriptFormat, resultVariable, autoStoreVariables, resource, skipExpression |
| **业务规则任务** | bpmn:BusinessRuleTask | decisionRef, decisionRefBinding, decisionRefVersion, mapDecisionResult, decisionRefTenantId |
| **调用活动** | bpmn:CallActivity | calledElement, calledElementType, inheritVariables, inheritBusinessKey, sameDeployment, processInstanceName, idVariableName, businessKey, useLocalScopeForOutParameters, In/Out 参数映射 |
| **HTTP任务** | bpmn:ServiceTask(type=http) | 通过 flowable:Field 注入：requestMethod, requestUrl, requestHeaders, requestBody, ignoreException, disallowRedirects, saveResponseVariableAsJson, saveResponseParametersTransient |
| **邮件任务** | bpmn:ServiceTask(type=email) | 通过 flowable:Field 注入：to, cc, bcc, subject, text |
| **Shell任务** | bpmn:ServiceTask(type=shell) | 通过 flowable:Field 注入：command, arguments, directory, wait, errorCodeVariable |
| **外部任务** | bpmn:ServiceTask(type=external-worker) | topic（直接属性） |
| **决策任务** | bpmn:ServiceTask(type=dmn) | 通过 flowable:Field 注入：decisionTableReferenceKey, decisionTaskThrowErrorOnNoHits, sameDeployment |

#### 4.1.4 网关类型 (Gateway)

| 组件 | 标识 | 属性字段 |
|------|------|----------|
| **排他网关** | bpmn:ExclusiveGateway | id, name, default |
| **并行网关** | bpmn:ParallelGateway | id, name |
| **包容网关** | bpmn:InclusiveGateway | id, name, default |
| **事件网关** | bpmn:EventBasedGateway | id, name, instantiate |

#### 4.1.5 子流程类型

| 组件 | 标识 | 属性字段 |
|------|------|----------|
| **子流程** | bpmn:SubProcess | id, name, triggeredByEvent |
| **AdHoc子流程** | bpmn:AdHocSubProcess | id, name, cancelRemainingInstances, ordering |

#### 4.1.6 连接线

| 组件 | 标识 | 属性字段 |
|------|------|----------|
| **顺序流** | bpmn:SequenceFlow | id, name, conditionExpression, sourceRef, targetRef |

#### 4.1.7 流程级别属性 (Process)

核心文件：`Panel/Process/index.tsx`

| 属性 | 类型 | 说明 |
|------|------|------|
| candidateStarterGroups | String[] | 流程启动角色（候选组） |
| candidateStarterUsers | String[] | 流程启动用户（候选人） |
| versionTag | String | 版本标签 |
| historyTimeToLive | String | 历史数据存活时间 |
| isStartableInTasklist | Boolean | 是否可在任务列表启动 |
| historyLevel | String | 历史级别（通过 flowable:HistoryLevel 扩展元素） |

**历史级别可选值**：
- `none` - 不记录（性能最佳）
- `instance` - 仅流程实例（记录启动/结束）
- `task` - 任务级别（记录处理人、任务状态）
- `activity` - 节点活动（记录每一步执行）
- `audit` - 审计跟踪（流程+任务+节点+变量）
- `full` - 全部细节（最完整记录）

### 4.2 通用属性扩展

#### 4.2.1 异步配置 (AsyncCapable)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| async | Boolean | false | 是否异步执行 |
| asyncBefore | Boolean | false | 执行前异步 |
| asyncAfter | Boolean | false | 执行后异步 |
| exclusive | Boolean | true | 是否排他 |

#### 4.2.2 多实例配置 (MultiInstanceLoopCharacteristics)

| 属性 | 类型 | 说明 |
|------|------|------|
| isSequential | Boolean | 是否串行 |
| loopCardinality | String | 循环基数 |
| collection | String | 集合变量 |
| elementVariable | String | 元素变量 |
| completionCondition | String | 完成条件表达式 |
| noWaitStatesAsyncLeave | Boolean | 并行多实例无等待离开 |

#### 4.2.3 监听器配置

**ExecutionListener**

| 属性 | 类型 | 说明 |
|------|------|------|
| event | String | 触发事件：start/end/take |
| class | String | Java类全限定名 |
| expression | String | 表达式 |
| delegateExpression | String | 委托表达式 |
| script | Script | 脚本定义 |
| fields | Field[] | 字段注入 |

**TaskListener**

| 属性 | 类型 | 说明 |
|------|------|------|
| event | String | 触发事件：create/assignment/complete/delete |
| class | String | Java类全限定名 |
| expression | String | 表达式 |
| delegateExpression | String | 委托表达式 |
| script | Script | 脚本定义 |
| fields | Field[] | 字段注入 |

#### 4.2.4 表单配置

**FormProperty**

| 属性 | 类型 | 说明 |
|------|------|------|
| id | String | 属性ID |
| name | String | 属性名称 |
| type | String | 类型：string/long/date/enum/boolean |
| required | Boolean | 是否必填 |
| readable | Boolean | 是否可读 |
| writable | Boolean | 是否可写 |
| variable | String | 绑定变量名 |
| expression | String | 表达式 |
| datePattern | String | 日期格式 |
| default | String | 默认值 |

---

## 五、bpmn-js 扩展 Flowable 支持的细节

### 5.1 扩展机制概述

bpmn-js 通过 `moddleExtensions` 机制扩展 BPMN 元模型，使编辑器能够识别和处理 Flowable 特有的 XML 元素和属性。

### 5.2 ExtensionElements 操作

核心文件：[ExtensionElementsUtil.ts](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/utils/ExtensionElementsUtil.ts)

```typescript
// 获取或创建 extensionElements
export const getOrCreateExtensionElements = (element: Element) => {
  const businessObject = getBusinessObject(element)
  let extensionElements = businessObject.get('extensionElements')
  if (!extensionElements && bpmnFactory) {
    extensionElements = createElement('bpmn:ExtensionElements', bpmnFactory, { values: [] }, element)
    updateProperties({ extensionElements }, businessObject)
  }
  return extensionElements
}

// 添加扩展元素
export const addExtensionElements = (element: Element, extensionElementToAdd: Element | Element[]) => {
  // ... 创建或更新 extensionElements
}

// 删除扩展元素
export const removeExtensionElements = (element: Element, extensionElementsToRemove: Element | Element[]) => {
  // ... 从 values 数组中移除
}
```

### 5.3 事件定义操作

核心文件：[EventDefinitionUtil.ts](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/utils/EventDefinitionUtil.ts)

```typescript
// 判断元素是否包含指定类型的事件定义
export const isEventDefinition = (element: Element, eventType: string | string[]) => {
  const businessObject = getBusinessObject(element)
  const eventDefinitions: Element[] = businessObject.get('eventDefinitions') || []
  const isEvent = eventDefinitions.some((definition) => isAny(definition, eventType))
  if (!isEvent) {
    const elements = getExtensionElementsList(element)
    return elements.some((definition) => isAny(definition, eventType))
  }
  return isEvent
}

// 获取事件定义
export const getEventDefinition = (element: Element, eventType: string) => {
  // 先从 eventDefinitions 获取，再从 extensionElements 获取
}
```

### 5.4 属性绑定工具

核心文件：`ElementUtil.ts`

提供属性绑定工具函数，将属性读取和更新封装为统一接口，便于在不同框架中使用：

```typescript
// 直接属性读取
export const getProperty = <T = string>(element: Element, key: string): T => {
  return getBusinessObject(element)?.get(key)
}

// 直接属性更新
export const setProperty = (element: Element, key: string, value: any) => {
  const modeling = getService<Modeling>('modeling')
  const businessObject = getBusinessObject(element)
  modeling?.updateModdleProperties(element, businessObject, { [key]: value })
}

// 针对 Field 类型的扩展属性读取
export const getFieldProperty = (element: Element, key: string): string | undefined => {
  const fields = getExtensionElementsList(element, 'flowable:Field')
  const field = fields.find((field) => field.get('name') === key)
  return field?.get('stringValue') || field?.get('expression') || field?.get('string')
}

// 针对 Field 类型的扩展属性更新
export const setFieldProperty = (element: Element, key: string, value: string) => {
  // 创建或更新 Field 扩展元素
  const moddle = getService<Moddle>('moddle')
  const bpmnFactory = getService<BpmnFactory>('bpmnFactory')
  const fields = getExtensionElementsList(element, 'flowable:Field')
  let field = fields.find((f) => f.get('name') === key)
  
  if (!field) {
    field = moddle.create('flowable:Field', { name: key })
    addExtensionElements(element, field)
  }
  
  field.set('stringValue', value)
}
```

**在不同框架中的使用示例**：

**Vue 3**：
```typescript
import { customRef } from 'vue'
export const useCustomRef = <T = string>(key: string) => {
  return customRef<T>((track, trigger) => ({
    get() { track(); return getProperty<T>(selectedElement, key) },
    set(v) { setProperty(selectedElement, key, v); trigger() }
  }))
}
```

**React**：
```typescript
import { useState, useEffect } from 'react'
export const useProperty = <T = string>(element: Element, key: string) => {
  const [value, setValue] = useState<T>(getProperty(element, key))
  useEffect(() => {
    const handler = () => setValue(getProperty(element, key))
    eventBus.on('elements.changed', handler)
    return () => eventBus.off('elements.changed', handler)
  }, [element, key])
  const update = (v: T) => setProperty(element, key, v)
  return [value, update] as const
}
```

### 5.5 自定义渲染器

核心文件：[Renderer/index.ts](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/Renderer/index.ts)

自定义渲染器通过继承 `BaseRenderer` 并重写 `canRender` 和 `drawShape` 方法实现：

#### 5.5.1 VariableEventRenderer

核心文件：[VariableEventRenderer.ts](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/Renderer/RewriteRenderer/VariableEventRenderer.ts)

为变量监听事件（`flowable:VariableListenerEventDefinition`）绘制自定义图标：

```typescript
canRender(element: Shape): boolean {
  if (!isLabel(element)) {
    if (isAny(element, ['bpmn:StartEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent'])) {
      return isEventDefinition(element, 'flowable:VariableListenerEventDefinition')
    }
  }
  return false
}

drawShape(parentNode: SVGElement, element: Shape): SVGElement {
  // 调用原生渲染器绘制基础形状
  const renderer = this.bpmnRenderer.handlers[element.type]
  const gfx = renderer(parentNode, element, { renderIcon: false })
  
  // 绘制自定义图标（EVENT_MULTIPLE 路径）
  const pathData = this.pathMap.getScaledPath('EVENT_MULTIPLE', { ... })
  const path = svgCreate('path', { d: pathData, fill, stroke })
  svgAppend(parentNode, path)
  
  return gfx
}
```

#### 5.5.2 ConnectorIconRenderer

核心文件：[ConnectorIconRenderer.ts](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/Renderer/RewriteRenderer/ConnectorIconRenderer.ts)

为 ServiceTask 绘制连接器图标（HTTP、Email、Shell 等）：

```typescript
canRender(element: Shape): boolean {
  if (!isLabel(element)) {
    if (isAny(element, ['bpmn:Task', 'bpmn:Event'])) {
      return !!this._getIcon(element)
    }
  }
  return false
}

_getIcon(element: Shape) {
  return getBusinessObject(element).get(this._iconProperty) // flowable:connectorIcon
}

drawShape(visuals: SVGElement, shape: Shape): SVGElement {
  const renderer = this._bpmnRenderer.handlers[shape.type]
  const gfx = renderer(visuals, shape, { renderIcon: false })
  
  const icon = this._getIcon(shape)
  if (/^#icon-/.test(icon)) {
    // SVG 图标引用
    const svg = svgCreate('svg', { ... })
    const use = svgCreate('use', { href: icon })
    svgAppend(svg, use)
    svgAppend(visuals, svg)
  } else {
    // 图片图标
    const img = svgCreate('image')
    svgAttr(img, { href: icon, width: size, height: size })
    svgAppend(visuals, img)
  }
  return gfx
}
```

#### 5.5.3 渲染器配置

```typescript
const httpTaskRenderer = {
  __init__: ['variableEventRenderer', 'connectorIconRenderer', 'neutralElementColors', 'exclusiveGatewayRender'],
  variableEventRenderer: ['type', VariableEventRenderer],
  neutralElementColors: ['type', class {}],
  connectorIconRenderer: ['type', ConnectorIconRenderer],
  exclusiveGatewayRender: ['type', ExclusiveGatewayRender],
}
```

### 5.6 自定义工具栏

核心文件：[CustomPaletteProvider.ts](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/Palette/CustomPaletteProvider.ts)

```typescript
getPaletteEntries() {
  const actions: PaletteEntries = super.getPaletteEntries()
  
  // 添加自定义任务类型
  const createUserTask = (event: Event) => {
    const userTask = this.elementFactory.createShape({ type: 'bpmn:UserTask' })
    this.create.start(event, userTask)
  }
  
  assign(actions, {
    'create.task': {
      group: 'activity',
      className: 'bpmn-icon-user-task',
      title: this.translate('Create user task'),
      action: { click: createUserTask, dragstart: createUserTask },
    },
  })
  
  // 删除不需要的默认工具
  delete actions['create.group']
  delete actions['create.data-object']
  
  return actions
}
```

---

## 六、代码规范与最佳实践

### 6.1 核心约束

| 规则 | 说明 |
|------|------|
| **属性更新** | 必须通过 `modeling.updateModdleProperties` 更新业务对象，确保操作记录到撤销栈 |
| **Flowable 前缀** | 所有 Flowable 扩展属性使用 `flowable:` 前缀 |
| **类型定义** | 严格定义 TS 类型，少用 `any` |
| **框架解耦** | 核心工具函数与前端框架解耦，通过适配器模式接入具体框架 |

### 6.2 属性更新模式

```typescript
// 正确方式：通过 modeling.updateModdleProperties
const { updateProperties } = useBpmnContextService()
updateProperties({ name: '新名称' })

// 正确方式：更新扩展元素
const fieldElement = businessObject.$model.create('flowable:Field', properties)
addExtensionElements(selectedElement, fieldElement)

// 错误方式：直接修改业务对象
// selectedElement.businessObject.name = '新名称'  // ❌
```

### 6.3 属性面板组件开发规范

每个属性面板组件必须：

1. 通过 `getService()` 获取 bpmn-js 服务（如 `modeling`、`eventBus`）
2. 使用 `getProperty`/`setProperty` 或框架响应式封装读取和更新属性
3. 在组件挂载时初始化数据
4. 监听必要的事件（如 `selection.changed`、`elements.changed`）

**框架无关的核心逻辑示例**：

```typescript
import { getService, getProperty, setProperty } from './service'
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'

const eventBus = getService<EventBus>('eventBus')
const selectedElement = /* 当前选中元素 */

// 读取属性
const assignee = getProperty(selectedElement, 'assignee')

// 更新属性
setProperty(selectedElement, 'assignee', 'newUser')

// 监听事件
eventBus.on('selection.changed', (e) => {
  // 选中元素变化时更新面板
})
```

**React 示例**：

```tsx
import { useState, useEffect } from 'react'
import { getService, getProperty, setProperty } from './service'

export const UserTaskPanel = ({ element }) => {
  const [assignee, setAssignee] = useState(getProperty(element, 'assignee'))
  const [candidateUsers, setCandidateUsers] = useState(getProperty(element, 'candidateUsers'))
  
  useEffect(() => {
    const eventBus = getService('eventBus')
    const handler = () => {
      setAssignee(getProperty(element, 'assignee'))
      setCandidateUsers(getProperty(element, 'candidateUsers'))
    }
    eventBus.on('elements.changed', handler)
    return () => eventBus.off('elements.changed', handler)
  }, [element])
  
  return (
    <div>
      <input 
        value={assignee} 
        onChange={(e) => setProperty(element, 'assignee', e.target.value)} 
      />
    </div>
  )
}
```

### 6.4 属性面板路由机制

核心文件：`PropertyPanel.ts`

属性面板使用基于 Slot 的动态路由机制，根据选中元素类型动态组装属性面板组件。

#### 6.4.1 Slot 定义

```typescript
type PanelSlotName = 'default' | 'general' | 'basic' | 'other'
type PanelSlots = Record<PanelSlotName, PanelComponentKey[]>
```

| Slot 名称 | 渲染位置 | 用途 |
|-----------|----------|------|
| `general` | 基础配置 Tab → 常规折叠项内 | 通用属性（如发起人、表单权限） |
| `basic` | 基础配置 Tab → 专属折叠项 | 元素专属配置（如处理人、服务配置） |
| `other` | 其他配置 Tab | 监听器、扩展属性等附加配置 |
| `default` | BaseActivity 默认 slot | 特殊组件（如全局事件、表单权限） |

#### 6.4.2 路由逻辑

```typescript
const PANEL_COMPONENTS: Record<string, PanelComponent> = {
  UserTask: /* 用户任务面板组件 */,
  ServiceTask: /* 服务任务面板组件 */,
  HttpTask: /* HTTP任务面板组件 */,
  EmailTask: /* 邮件任务面板组件 */,
  // ... 其他面板组件
}

const setCurrentComponents = (element: Element): PanelSlots => {
  const businessObject = getBusinessObject(element)
  const slots: PanelSlots = { default: [], general: [], basic: [], other: [] }
  
  // 根据元素类型分配组件到对应 slot
  if (is(element, 'bpmn:UserTask')) {
    slots.basic.push('UserTask')
    slots.other.push('TaskListener')
    slots.default.push('FormPermissions')
  } else if (is(element, 'bpmn:ServiceTask')) {
    if (businessObject.type === 'http') {
      slots.basic.push('HttpTask')
    } else if (businessObject.type === 'email') {
      slots.basic.push('EmailTask')
    } else if (businessObject.type === 'shell') {
      slots.basic.push('ShellTask')
    } else if (businessObject.type === 'external-worker') {
      slots.basic.push('ExternalTask')
    } else if (businessObject.type === 'dmn') {
      slots.basic.push('DecisionTask')
    } else {
      slots.basic.push('ServiceTask')
    }
  }
  
  slots.basic.push('Advanced')
  
  return slots
}
```

#### 6.4.3 添加新 Panel 组件步骤

1. 在 `PANEL_COMPONENTS` 中注册组件
2. 在 `setCurrentComponents` 中添加路由逻辑
3. 实现组件（遵循 BaseActivity 的 slot 结构）

#### 6.4.4 直接属性 vs Field 属性

| 属性类型 | 使用场景 | 数据存储位置 | 读取方法 |
|----------|----------|--------------|----------|
| 直接属性 | 如 assignee, name, async | 业务对象直接属性 | `getProperty(element, key)` |
| Field 属性 | 通过 flowable:Field 注入的属性 | extensionElements 中的 flowable:Field | `getFieldProperty(element, key)` |

```typescript
// 直接属性：存储在 businessObject.assignee
const assignee = getProperty(element, 'assignee')
setProperty(element, 'assignee', 'newUser')

// Field 属性：存储在 extensionElements.values 中的 flowable:Field(name="requestUrl")
const requestUrl = getFieldProperty(element, 'requestUrl')
setFieldProperty(element, 'requestUrl', 'http://api.example.com')
```

### 6.5 校验规则

项目包含完整的 bpmnlint 校验规则，位于 [Lint/rules](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/Lint/rules) 目录：

| 规则文件 | 校验内容 |
|----------|----------|
| activity-label-required.ts | 活动节点必须有标签 |
| user-task-required.ts | 用户任务必须配置处理人（assignee/candidateUsers/candidateGroups） |
| service-task-required.ts | 服务任务必须配置执行方式（class/expression/delegateExpression） |
| script-task-required.ts | 脚本任务必须配置脚本内容 |
| timer-event-required.ts | 定时事件必须配置时间定义 |
| sequence-flows-required.ts | 排他网关输出连线必须配置条件或默认 |
| conditional-flows.ts | 条件流校验 |
| call-activity-required.ts | 调用活动必须配置被调用元素 |
| message-event-required.ts | 消息事件必须配置消息引用 |
| signal-event-required.ts | 信号事件必须配置信号引用 |
| error-event-required.ts | 错误事件必须配置错误引用 |
| escalation-event-required.ts | 升级事件必须配置升级引用 |
| compensate-event-required.ts | 补偿事件必须配置活动引用 |
| conditional-event-required.ts | 条件事件必须配置条件表达式 |
| multi-instance-required.ts | 多实例必须配置集合或基数 |
| variable-event-required.ts | 变量事件必须配置变量名 |
| http-task-required.ts | HTTP任务必须配置请求URL |

#### 6.5.1 校验规则编写示例

核心文件：[user-task-required.ts](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/Lint/rules/user-task-required.ts)

```typescript
import type { Reporter, RuleDefinition } from 'bpmnlint/lib/types'
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts'
import { is } from 'bpmn-js/lib/util/ModelUtil'

const userTaskRequired = (): RuleDefinition => {
  return {
    check: (node: ModdleElement, reporter: Reporter) => {
      if (is(node, 'bpmn:UserTask')) {
        // 检查是否配置了受让人
        const assignee = node.get('assignee')
        if (assignee) {
          return
        }
        // 检查是否配置了候选人
        const candidateUsers = node.get('candidateUsers')
        if (candidateUsers && candidateUsers.length) {
          return
        }
        // 检查是否配置了候选组
        const candidateGroups = node.get('candidateGroups')
        if (candidateGroups && candidateGroups.length) {
          return
        }
        // 未配置任何处理人，报告错误
        reporter.report(node.id, 'Missing assignee or candidate/group')
      }
    },
    meta: {
      documentation: {
        url: 'https://demo.lowflow.vip/',
      },
    },
  }
}

export default userTaskRequired
```

### 6.6 Advanced 面板组件

核心文件：`Advanced.tsx`

Advanced 面板对所有活动类型渲染，包含：

| 配置项 | 显示条件 | 说明 |
|--------|----------|------|
| 跳过表达式 | 元素支持 `skipExpression` 属性 | 支持 JUEL 表达式 |
| 多实例配置 | 元素支持 `loopCharacteristics` | 串行/并行多实例设置 |
| 异步配置 | 元素支持 `async` 属性 | 异步执行配置 |
| 文档配置 | 始终显示 | 关联文档设置 |

**框架无关的核心逻辑**：

```typescript
const renderAdvancedPanel = (element: Element) => {
  const businessObject = getBusinessObject(element)
  const propertiesByName = businessObject?.$descriptor?.propertiesByName || {}
  const components = []
  
  if (propertiesByName['skipExpression']) {
    components.push({ type: 'SkipExpression' })
  }
  if (propertiesByName['loopCharacteristics']) {
    components.push({ type: 'MultiInstance' })
  }
  if (propertiesByName['async']) {
    components.push({ type: 'Async' })
  }
  components.push({ type: 'Document' })
  
  return components
}
```

**React 示例**：

```tsx
import { useState, useEffect } from 'react'
import { getProperty, setProperty, getBusinessObject } from '../service'

export const AdvancedPanel = ({ element }) => {
  const [skipExpression, setSkipExpression] = useState(getProperty(element, 'skipExpression'))
  const businessObject = getBusinessObject(element)
  const propertiesByName = businessObject?.$descriptor?.propertiesByName || {}
  
  useEffect(() => {
    const eventBus = getService('eventBus')
    const handler = () => setSkipExpression(getProperty(element, 'skipExpression'))
    eventBus.on('elements.changed', handler)
    return () => eventBus.off('elements.changed', handler)
  }, [element])
  
  return (
    <div className="advanced-panel">
      <h3>高级</h3>
      {propertiesByName['skipExpression'] && (
        <div>
          <label>跳过表达式</label>
          <Codemirror 
            value={skipExpression} 
            onChange={(v) => setProperty(element, 'skipExpression', v)}
            extensions={[juelSupport()]} 
          />
        </div>
      )}
      {propertiesByName['loopCharacteristics'] && <MultiInstance element={element} />}
      {propertiesByName['async'] && <Async element={element} />}
      <Document element={element} />
    </div>
  )
}
```

---

## 七、文件结构说明

```
src/views/ProcessDesigner/
├── BpmnModeler.tsx          # 模型器核心配置
├── PropertyPanel.tsx        # 属性面板容器（框架适配层）
├── index.tsx                # 设计器主组件（框架适配层）
├── flowable.json            # Flowable 扩展定义
├── EmptyXML.ts              # 空流程模板
├── ContextPad/              # 右键菜单扩展
│   ├── CustomContextPadProvider.ts
│   └── index.ts
├── Palette/                 # 工具栏扩展
│   ├── CustomPaletteProvider.ts
│   └── index.ts
├── Modeling/                # 建模扩展
│   ├── CustomBpmnFactory.ts
│   └── index.ts
├── Renderer/                # 渲染器扩展
│   ├── RewriteRenderer/
│   └── index.ts
├── Parse/                   # 解析模块
├── Replace/                 # 替换模块
├── PopupMenu/               # 弹出菜单
├── Translate/               # 国际化
├── Properties/              # 属性面板渲染器
├── Connector/               # 连接器模板
├── Lint/                    # 校验规则
│   ├── rules/
│   └── index.ts
├── utils/                   # 工具类（框架无关）
│   ├── ElementUtil.ts
│   ├── ExtensionElementsUtil.ts
│   ├── EventDefinitionUtil.ts
│   ├── ValidationUtil.ts
│   └── index.ts
├── service.ts               # 服务获取与属性操作（框架无关）
└── Panel/                   # 属性编辑面板（框架适配层）
    ├── UserTask/            # 用户任务
    ├── ServiceTask/         # 服务任务
    ├── ScriptTask/          # 脚本任务
    ├── CallActivity/        # 调用活动
    ├── StartEvent/          # 开始事件
    ├── TimerEvent/          # 定时事件
    ├── SequenceFlow/        # 顺序流
    ├── MultiInstance/       # 多实例
    ├── BaseActivity/        # 基础活动
    └── ...
```

**文件类型说明**：

| 后缀 | 说明 |
|------|------|
| `.ts` | 框架无关的核心逻辑，可在任意框架中复用 |
| `.tsx` | 框架适配层，需根据目标框架（Vue/React/Angular）实现对应版本 |

---

## 八、XML 导入导出

### 8.1 导入流程

```typescript
const importXml = async (xml: string) => {
  const result = await modeler.importXML(xml)
  if (result) {
    const { warnings } = result
    console.log('警告：', warnings)
  }
}
```

### 8.2 导出流程

```typescript
const exportXml = async () => {
  const res = await modeler.saveXML({ format: true, preamble: true })
  return res?.xml
}

const exportSvg = async () => {
  const { svg } = await modeler.saveSVG()
  // 处理颜色变量
  const replacedSvg = svg
    .replace(/var\(--bjsl-fill-color\)/g, '#fff')
    .replace(/var\(--bjsl-stroke-color\)/g, '#000')
  return replacedSvg
}
```

### 8.3 XML 输出示例

导出的 BPMN XML 包含 Flowable 扩展属性，格式如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:flowable="http://flowable.org/bpmn"  <!-- Flowable 命名空间 -->
             id="Definitions_xxx"
             targetNamespace="http://flowable.org/bpmn">
  
  <process id="Process_xxx" name="审批流程" isExecutable="true"
           flowable:candidateStarterUsers="zhangsan,lisi"  <!-- 流程级扩展属性 -->
           flowable:candidateStarterGroups="deptA">
    
    <!-- 用户任务示例 -->
    <userTask id="UserTask_xxx" name="审批"
              flowable:assignee="manager"  <!-- 直接扩展属性 -->
              flowable:priority="1">
      <extensionElements>
        <flowable:taskListener event="create" delegateExpression="${taskListener}" />
      </extensionElements>
    </userTask>
    
    <!-- HTTP 服务任务示例 -->
    <serviceTask id="ServiceTask_xxx" name="调用API" flowable:type="http">
      <extensionElements>
        <flowable:Field name="requestMethod">
          <flowable:string>POST</flowable:string>
        </flowable:Field>
        <flowable:Field name="requestUrl">
          <flowable:string>http://api.example.com/notify</flowable:string>
        </flowable:Field>
        <flowable:Field name="requestBody">
          <flowable:string>{"status":"approved"}</flowable:string>
        </flowable:Field>
      </extensionElements>
    </serviceTask>
    
    <!-- 调用活动示例（带参数映射） -->
    <callActivity id="CallActivity_xxx" name="调用子流程"
                  calledElement="sub-process-key"
                  flowable:calledElementType="key"
                  flowable:inheritVariables="true">
      <extensionElements>
        <flowable:In source="orderId" target="subOrderId" />
        <flowable:Out source="result" target="subResult" />
      </extensionElements>
    </callActivity>
    
    <!-- 异步配置示例 -->
    <serviceTask id="AsyncTask_xxx" name="异步任务"
                 flowable:async="true"
                 flowable:asyncBefore="false"
                 flowable:asyncAfter="true"
                 flowable:exclusive="true">
      <extensionElements>
        <flowable:FailedJobRetryTimeCycle>R5/PT5M</flowable:FailedJobRetryTimeCycle>
      </extensionElements>
    </serviceTask>
    
    <!-- 多实例示例 -->
    <userTask id="MultiInstanceTask_xxx" name="会签审批">
      <multiInstanceLoopCharacteristics isSequential="false"
                                        flowable:collection="${approvers}"
                                        flowable:elementVariable="approver">
        <completionCondition>${nrOfCompletedInstances >= nrOfInstances * 0.6}</completionCondition>
        <extensionElements>
          <flowable:VariableAggregation target="approvalResults">
            <flowable:Variable source="approvalResult" target="results" />
          </flowable:VariableAggregation>
        </extensionElements>
      </multiInstanceLoopCharacteristics>
    </userTask>
    
  </process>
</definitions>
```

### 8.4 Connector 模块（可选）

Connector 模块在 [BpmnModeler.tsx](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/views/ProcessDesigner/BpmnModeler.tsx) 中被注释掉，是一个可选功能：

```typescript
// import ConnectorTemplate from './Connector'

additionalModules: [
  // ConnectorTemplate,  // 已禁用
]
```

该模块提供服务任务连接器模板功能，允许预定义常用的 HTTP、Email、Shell 等连接器配置。如需启用，取消注释并实现对应的连接器配置。

---

## 九、高级功能

### 9.1 流程模拟

集成 `bpmn-js-token-simulation` 模块，支持流程运行时模拟：

```typescript
// 获取流程模拟状态
const getSimulationActive = (modeler: BpmnModeler): boolean => {
  const toggleMode = modeler.get<ToggleMode>('toggleMode')
  return toggleMode?._active || false
}

// 切换流程模拟模式
const toggleSimulation = (modeler: BpmnModeler) => {
  const toggleMode = modeler.get<ToggleMode>('toggleMode')
  toggleMode?.toggleMode()
}
```

### 9.2 代码编辑器集成

使用 Codemirror 6 集成多种脚本语言支持：

| 语言 | 扩展模块 | 用途 |
|------|----------|------|
| JUEL | juel/ | 条件表达式、委托表达式 |
| JavaScript | javascript/ | 脚本任务 |
| Groovy | groovy/ | 脚本任务 |
| JSON | json/ | 数据配置 |
| Shell | shell/ | Shell 任务 |

### 9.3 国际化支持

项目支持中英文切换，语言文件位于 [languages/](file:///Users/amybee/Codes/github/vue-bpmn-designer/src/languages) 目录。

---

## 十、新项目搭建参考

### 10.1 核心依赖安装

```bash
pnpm install bpmn-js \
             bpmn-js-color-picker \
             bpmn-js-token-simulation \
             bpmn-js-bpmnlint \
             bpmn-auto-layout \
             diagram-js-minimap \
             diagram-js-grid-bg \
             didi \
             ids \
             min-dash
```

### 10.2 关键文件创建清单

| 文件 | 说明 |
|------|------|
| flowable.json | Flowable 扩展定义 |
| BpmnModeler.tsx | 模型器配置（框架适配层） |
| PropertyPanel.tsx | 属性面板容器（框架适配层） |
| service.ts | 服务获取与属性操作（框架无关） |
| ElementUtil.ts | 元素操作工具（框架无关） |
| ExtensionElementsUtil.ts | 扩展元素工具（框架无关） |
| EventDefinitionUtil.ts | 事件定义工具（框架无关） |
| CustomBpmnFactory.ts | 自定义工厂（框架无关） |
| CustomPaletteProvider.ts | 自定义工具栏（框架无关） |
| CustomContextPadProvider.ts | 自定义右键菜单（框架无关） |
| 各 Panel 组件 | 属性编辑面板（框架适配层） |

### 10.3 扩展新组件步骤

1. 在 `flowable.json` 中定义新的扩展类型
2. 创建对应的 Panel 组件（框架适配层）
3. 在 `PropertyPanel.tsx` 的 `PANEL_COMPONENTS` 中注册组件
4. 在 `setCurrentComponents` 中添加组件路由逻辑
5. 如果需要，创建对应的校验规则（框架无关）

---

## 十一、总结

本项目提供了一个完整的基于 bpmn-js 的 Flowable 流程设计器实现，核心要点：

1. **扩展机制**：通过 `moddleExtensions` 扩展 BPMN 元模型，支持 Flowable 特有属性
2. **框架解耦**：核心工具函数与前端框架解耦，通过适配器模式接入 Vue、React、Angular 等任意框架
3. **模块化架构**：将工具栏、右键菜单、渲染器、校验规则等拆分为独立模块
4. **事件驱动**：通过 bpmn-js 的 `EventBus` 实现组件间通信
5. **校验体系**：集成 bpmnlint 提供完整的流程校验能力

**跨框架适配策略**：

| 框架 | 适配方式 |
|------|----------|
| Vue 3 | 使用 `customRef` 封装属性绑定，自动同步到 bpmn-js 模型 |
| React | 使用 `useState` + `useEffect` 监听事件，手动同步属性 |
| Angular | 使用 `BehaviorSubject` 或 `@Input`/`@Output` 实现双向绑定 |

这个架构可以作为构建其他 BPMN 流程引擎设计器（如 Activiti、Camunda）的参考模板。
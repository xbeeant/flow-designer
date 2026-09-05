/**
 * 面板 Item 工厂 + 数据驱动的元素类型配置
 *
 * 核心思路：
 * 1. 每种可复用的面板 → 一个工厂函数（消除重复 JSX）
 * 2. 每种 BPMN 元素类型 → 一个 PanelKey[] 声明式配置
 * 3. resolveElementPanelItems() 根据配置自动组装面板列表
 *
 * 新增元素类型只需在 ELEMENT_PANEL_MAP 中添加一行配置即可
 */
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import type { Connection } from 'diagram-js/lib/model/Types.ts';
import type { BpmnForm } from '../types.ts';
import AsyncConfig, { AsyncConfigPanel } from './AsyncConfig';
import BasicProperties, { BasicPropertiesPanel } from './BasicProperties';
import BoundaryEventProperties, {
  BoundaryEventPropertiesPanel,
} from './BoundaryEventProperties';
import BusinessRuleTaskProperties, {
  BusinessRuleTaskPropertiesPanel,
} from './BusinessRuleTaskProperties';
import CallActivityProperties, {
  CallActivityPropertiesPanel,
} from './CallActivityProperties';
import ElementInfoProperties, {
  ElementInfoPropertiesPanel,
} from './ElementInfoProperties.tsx';
import EventDefinitionProperties, {
  EventDefinitionPropertiesPanel,
} from './EventDefinitionProperties';
import EndEventProperties, {
  EndEventPropertiesPanel,
} from './end-event/EndEventProperties';
import FeatureItems, { FeatureItemsPanel } from './FeatureItems';
import FormConfig, { FormConfigPanel } from './FormConfig';
import MultiInstanceProperties, {
  MultiInstancePropertiesPanel,
} from './MultiInstanceProperties';
import {
  DataObjectsPanel,
  DataObjectsPanelConfig,
  EventListenersPanel,
  EventListenersPanelConfig,
  ExecutionListenersPanel,
  ExecutionListenersPanelConfig,
  ExtensionsPanel,
  ExtensionsPanelConfig,
  GlobalEventsPanel,
  GlobalEventsPanelConfig,
  ProcessAdvancedInfo,
  ProcessAdvancedInfoPanel,
  ProcessBasicInfo,
  ProcessBasicInfoPanel,
  ProcessStarterConfig,
  ProcessStarterConfigPanel,
} from './ProcessProperties';
import ScriptTaskProperties, {
  ScriptTaskPropertiesPanel,
} from './ScriptTaskProperties';
import SequenceFlowProperties, {
  SequenceFlowPropertiesPanel,
} from './SequenceFlowProperties';
import ServiceTaskProperties, {
  ServiceTaskPropertiesPanel,
} from './ServiceTaskProperties';
import StartEventProperties, {
  StartEventPropertiesPanel,
} from './StartEventProperties';
import SubProcessProperties, {
  EventBasedGatewayProperties,
  EventBasedGatewayPropertiesPanel,
  SubProcessPropertiesPanel,
} from './SubProcessProperties';
import TaskListenerPanel, {
  TaskListenerPanelConfig,
} from './TaskListenerPanel';
import UserTaskProperties, {
  UserTaskPropertiesPanel,
} from './UserTaskProperties';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type PanelItem = {
  key?: string;
  label: React.ReactNode;
  children: React.ReactNode;
};

interface PanelContext {
  modeler: Modeler;
  modelerVersion?: number;
  selectedElement: ModdleElement;
  processElement: ModdleElement;
  onPropertyChange: (property: string, value: string | boolean) => void;
  forms: BpmnForm;
}

// ──────────────────────────────────────────────
// 单面板 Item 工厂函数
// ──────────────────────────────────────────────

export interface PanelConfigProps extends Record<string, any> {}

const executionListenersItem = (ctx: PanelContext): PanelItem => ({
  ...ExecutionListenersPanelConfig({
    listenerCount: 0,
  }),
  children: (
    <ExecutionListenersPanel
      modeler={ctx.modeler}
      modelerVersion={ctx.modelerVersion}
      element={ctx.selectedElement || ctx.processElement}
    />
  ),
});

const extensionsItem = (ctx: PanelContext): PanelItem => ({
  ...ExtensionsPanelConfig({
    propertyCount: 0,
  }),
  children: (
    <ExtensionsPanel
      modeler={ctx.modeler}
      modelerVersion={ctx.modelerVersion}
      element={ctx.selectedElement || ctx.processElement}
    />
  ),
});

const asyncConfigItem = (ctx: PanelContext): PanelItem => ({
  ...AsyncConfigPanel,
  children: <AsyncConfig modeler={ctx.modeler} element={ctx.selectedElement} />,
});

const featureItemsItem = (ctx: PanelContext): PanelItem => ({
  ...FeatureItemsPanel,
  children: (
    <FeatureItems modeler={ctx.modeler} element={ctx.selectedElement} />
  ),
});

const multiInstanceItem = (ctx: PanelContext): PanelItem => ({
  ...MultiInstancePropertiesPanel,
  children: (
    <MultiInstanceProperties
      modeler={ctx.modeler}
      element={ctx.selectedElement}
    />
  ),
});

const eventDefinitionItem = (ctx: PanelContext): PanelItem => ({
  ...EventDefinitionPropertiesPanel,
  children: (
    <EventDefinitionProperties
      modeler={ctx.modeler}
      element={ctx.selectedElement}
    />
  ),
});

const startEventPropsItem = (ctx: PanelContext): PanelItem => ({
  ...StartEventPropertiesPanel,
  children: (
    <StartEventProperties modeler={ctx.modeler} element={ctx.selectedElement} />
  ),
});

const boundaryEventPropsItem = (ctx: PanelContext): PanelItem => ({
  ...BoundaryEventPropertiesPanel,
  children: (
    <BoundaryEventProperties
      modeler={ctx.modeler}
      element={ctx.selectedElement}
    />
  ),
});

const endEventItem = (ctx: PanelContext): PanelItem => ({
  ...EndEventPropertiesPanel,
  children: (
    <EndEventProperties modeler={ctx.modeler} element={ctx.selectedElement} />
  ),
});

const eventListenersItem = (ctx: PanelContext): PanelItem => ({
  ...EventListenersPanelConfig({
    listenerCount: 0,
  }),
  children: (
    <EventListenersPanel
      modeler={ctx.modeler}
      modelerVersion={ctx.modelerVersion}
      element={ctx.selectedElement || ctx.processElement}
    />
  ),
});

const dataObjectsItem = (ctx: PanelContext): PanelItem => ({
  ...DataObjectsPanelConfig({
    dataObjectCount: 0,
  }),
  children: (
    <DataObjectsPanel
      modeler={ctx.modeler}
      modelerVersion={ctx.modelerVersion}
      processElement={ctx.processElement}
    />
  ),
});

const taskListenerItem = (ctx: PanelContext): PanelItem => ({
  ...TaskListenerPanelConfig({
    listenerCount: 0,
  }),
  children: (
    <TaskListenerPanel modeler={ctx.modeler} element={ctx.selectedElement} />
  ),
});

const formConfigItem = (ctx: PanelContext): PanelItem => ({
  ...FormConfigPanel,
  children: (
    <FormConfig
      modeler={ctx.modeler}
      modelerVersion={ctx.modelerVersion}
      element={ctx.selectedElement || ctx.processElement}
      forms={ctx.forms}
    />
  ),
});

const subProcessPropsItem = (ctx: PanelContext): PanelItem => ({
  ...SubProcessPropertiesPanel,
  children: (
    <SubProcessProperties modeler={ctx.modeler} element={ctx.selectedElement} />
  ),
});

const eventBasedGatewayPropsItem = (ctx: PanelContext): PanelItem => ({
  ...EventBasedGatewayPropertiesPanel,
  children: (
    <EventBasedGatewayProperties
      modeler={ctx.modeler}
      element={ctx.selectedElement}
    />
  ),
});

// 特定任务类型面板
const serviceTaskPropsItem = (ctx: PanelContext): PanelItem => ({
  ...ServiceTaskPropertiesPanel,
  children: (
    <ServiceTaskProperties
      modeler={ctx.modeler}
      element={ctx.selectedElement}
    />
  ),
});

const userTaskPropsItem = (ctx: PanelContext): PanelItem => ({
  ...UserTaskPropertiesPanel,
  children: (
    <UserTaskProperties modeler={ctx.modeler} element={ctx.selectedElement} />
  ),
});
const scriptTaskPropsItem = (ctx: PanelContext): PanelItem => ({
  ...ScriptTaskPropertiesPanel,
  children: (
    <ScriptTaskProperties modeler={ctx.modeler} element={ctx.selectedElement} />
  ),
});
const businessRuleTaskPropsItem = (ctx: PanelContext): PanelItem => ({
  ...BusinessRuleTaskPropertiesPanel,
  children: (
    <BusinessRuleTaskProperties
      modeler={ctx.modeler}
      element={ctx.selectedElement}
    />
  ),
});
const callActivityPropsItem = (ctx: PanelContext): PanelItem => ({
  ...CallActivityPropertiesPanel,
  children: (
    <CallActivityProperties
      modeler={ctx.modeler}
      element={ctx.selectedElement}
    />
  ),
});

const sequenceFlowPropsItem = (ctx: PanelContext): PanelItem => ({
  ...SequenceFlowPropertiesPanel,
  children: (
    <SequenceFlowProperties
      modeler={ctx.modeler}
      element={ctx.selectedElement}
    />
  ),
});

// ──────────────────────────────────────────────
// 可复用的面板组合（常见模式）
// ──────────────────────────────────────────────

/** 任务类元素的通用面板组: FeatureItems + MultiInstance + Async + ExecListeners + Extensions */
const taskCommonPanels = (ctx: PanelContext): PanelItem[] => [
  featureItemsItem(ctx),
  multiInstanceItem(ctx),
  asyncConfigItem(ctx),
  executionListenersItem(ctx),
  extensionsItem(ctx),
];

/** 事件类元素的通用面板组: Async + Extensions */
const eventCommonPanels = (ctx: PanelContext): PanelItem[] => [
  asyncConfigItem(ctx),
  executionListenersItem(ctx),
  extensionsItem(ctx),
];

/** 网关类元素的通用面板组: Async + Extensions */
const gatewayCommonPanels = (ctx: PanelContext): PanelItem[] => [
  asyncConfigItem(ctx),
  executionListenersItem(ctx),
  extensionsItem(ctx),
];

/** 最小组合: 仅 Extensions */
const extensionsOnlyPanels = (ctx: PanelContext): PanelItem[] => [
  extensionsItem(ctx),
];

// ──────────────────────────────────────────────
// 元素类型 → 面板配置（数据驱动）
// ──────────────────────────────────────────────

type PanelResolver = (ctx: PanelContext) => PanelItem[];

const ELEMENT_PANEL_MAP: Record<string, PanelResolver> = {
  'bpmn:StartEvent': (ctx) => {
    return [
      startEventPropsItem(ctx),
      executionListenersItem(ctx),
      extensionsItem(ctx),
    ];
  },

  'bpmn:EndEvent': (ctx) => {
    return [
      endEventItem(ctx),
      executionListenersItem(ctx),
      extensionsItem(ctx),
    ];
  },

  'bpmn:IntermediateCatchEvent': (ctx) => {
    return [
      executionListenersItem(ctx),
      eventDefinitionItem(ctx),
      extensionsItem(ctx),
    ];
  },

  'bpmn:IntermediateThrowEvent': (ctx) => {
    return [
      executionListenersItem(ctx),
      eventDefinitionItem(ctx),
      extensionsItem(ctx),
    ];
  },

  'bpmn:BoundaryEvent': (ctx) => {
    return [boundaryEventPropsItem(ctx), ...eventCommonPanels(ctx)];
  },

  'bpmn:Task': (ctx) => {
    return [multiInstanceItem(ctx)];
  },

  'bpmn:UserTask': (ctx) => {
    return [
      userTaskPropsItem(ctx),
      formConfigItem(ctx),
      featureItemsItem(ctx),
      multiInstanceItem(ctx),
      asyncConfigItem(ctx),
      executionListenersItem(ctx),
      taskListenerItem(ctx),
      extensionsItem(ctx),
    ];
  },

  'bpmn:ScriptTask': (ctx) => {
    return [scriptTaskPropsItem(ctx), ...taskCommonPanels(ctx)];
  },

  'bpmn:ServiceTask': (ctx) => {
    return [serviceTaskPropsItem(ctx), ...taskCommonPanels(ctx)];
  },

  'bpmn:SendTask': (ctx) => {
    return taskCommonPanels(ctx);
  },

  'bpmn:ReceiveTask': (ctx) => {
    return taskCommonPanels(ctx);
  },

  'bpmn:ManualTask': (ctx) => {
    return taskCommonPanels(ctx);
  },

  'bpmn:BusinessRuleTask': (ctx) => {
    return [businessRuleTaskPropsItem(ctx), ...taskCommonPanels(ctx)];
  },

  'bpmn:CallActivity': (ctx) => {
    return [
      callActivityPropsItem(ctx),
      multiInstanceItem(ctx),
      asyncConfigItem(ctx),
      executionListenersItem(ctx),
      extensionsItem(ctx),
    ];
  },

  'bpmn:ExclusiveGateway': (ctx) => gatewayCommonPanels(ctx),
  'bpmn:ParallelGateway': (ctx) => gatewayCommonPanels(ctx),
  'bpmn:InclusiveGateway': (ctx) => gatewayCommonPanels(ctx),

  'bpmn:EventBasedGateway': (ctx) => {
    return [eventBasedGatewayPropsItem(ctx), ...extensionsOnlyPanels(ctx)];
  },

  'bpmn:SubProcess': (ctx) => {
    return [
      subProcessPropsItem(ctx),
      asyncConfigItem(ctx),
      executionListenersItem(ctx),
      extensionsItem(ctx),
    ];
  },

  'bpmn:AdHocSubProcess': (ctx) => {
    return [
      subProcessPropsItem(ctx),
      asyncConfigItem(ctx),
      executionListenersItem(ctx),
      extensionsItem(ctx),
    ];
  },

  'bpmn:Participant': (ctx) => {
    return [
      executionListenersItem(ctx),
      eventListenersItem(ctx),
      dataObjectsItem(ctx),
      extensionsItem(ctx),
    ];
  },

  'bpmn:SequenceFlow': (ctx) => {
    return [
      sequenceFlowPropsItem(ctx),
      executionListenersItem(ctx),
      ...extensionsOnlyPanels(ctx),
    ];
  },
};

// ──────────────────────────────────────────────
// 公开 API
// ──────────────────────────────────────────────

/**
 * 根据元素类型解析出对应的面板 Item 列表
 */
export function resolveElementPanelItems(
  elementType: string,
  ctx: PanelContext,
): PanelItem[] {
  const resolver = ELEMENT_PANEL_MAP[elementType];
  return resolver ? resolver(ctx) : [];
}

/**
 * 构建流程级别的面板 Item 列表
 */
export function buildProcessPanelItems(ctx: PanelContext): PanelItem[] {
  const proc = ctx.processElement;
  return [
    {
      ...ProcessBasicInfoPanel,
      children: (
        <ProcessBasicInfo
          modeler={ctx.modeler}
          element={proc}
          onPropertyChange={ctx.onPropertyChange}
        />
      ),
    },
    formConfigItem(ctx),
    {
      ...ProcessStarterConfigPanel,
      children: (
        <ProcessStarterConfig
          modeler={ctx.modeler}
          element={proc}
          onPropertyChange={ctx.onPropertyChange}
        />
      ),
    },
    {
      ...ProcessAdvancedInfoPanel,
      children: (
        <ProcessAdvancedInfo
          modeler={ctx.modeler}
          element={proc}
          onPropertyChange={ctx.onPropertyChange}
        />
      ),
    },
    {
      ...GlobalEventsPanelConfig({ eventCount: 0 }),
      children: (
        <GlobalEventsPanel
          modeler={ctx.modeler}
          modelerVersion={ctx.modelerVersion}
        />
      ),
    },
    executionListenersItem(ctx),
    eventListenersItem(ctx),
    dataObjectsItem(ctx),
    extensionsItem(ctx),
  ];
}

/**
 * 构建元素级别的基础面板（BasicProperties + AdvancedProperties + Connections + 元素特有面板）
 */
export function buildElementBasicItems(
  ctx: PanelContext,
  incoming: Connection,
  outgoing: Connection,
): PanelItem[] {
  return [
    {
      ...ElementInfoPropertiesPanel,
      children: (
        <ElementInfoProperties
          element={ctx.selectedElement}
          incoming={incoming}
          outgoing={outgoing}
        />
      ),
    },
    {
      ...BasicPropertiesPanel,
      children: (
        <BasicProperties
          modeler={ctx.modeler}
          element={ctx.selectedElement}
          onPropertyChange={ctx.onPropertyChange}
        />
      ),
    },
    ...resolveElementPanelItems(
      getBusinessObject(ctx.selectedElement)?.$type ?? '',
      ctx,
    ),
  ];
}

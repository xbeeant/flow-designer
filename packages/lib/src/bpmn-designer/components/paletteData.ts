/** Palette 静态数据与类型定义 */
import type Modeler from 'bpmn-js/lib/Modeler';

export interface PaletteGroup {
  title: string;
  items: PaletteEntry[];
  icon: string;
  color: string;
}

export interface TargetConfig extends Record<string, any> {
  type: string;
  eventDefinitionType?: string;
}

export interface PaletteEntry {
  target: string | TargetConfig;
  title: string;
  icon: string;
  color?: string;
  toolType?: string;
}

export interface PaletteProps {
  modeler: Modeler;
  onToolChange: (toolName: string, e: MouseEvent) => void;
}

export const TOOL_ITEMS: PaletteEntry[] = [
  {
    target: 'tool-select',
    title: '选择',
    icon: 'bpmn-icon-hand-tool',
    color: '#64748b',
    toolType: 'select',
  },
  {
    target: 'tool-lasso',
    title: '套索工具',
    icon: 'bpmn-icon-lasso-tool',
    color: '#64748b',
    toolType: 'lasso',
  },
  {
    target: 'tool-space',
    title: '创建/删除空间',
    icon: 'bpmn-icon-space-tool',
    color: '#64748b',
    toolType: 'space',
  },
  {
    target: 'tool-delete',
    title: '删除',
    icon: 'bpmn-icon-trash',
    color: '#64748b',
    toolType: 'delete',
  },
];

export const PALETTE_GROUPS: PaletteGroup[] = [
  {
    title: '事件',
    icon: 'bpmn-icon-intermediate-event-none',
    color: '#10b981',
    items: [
      {
        target: 'bpmn:StartEvent',
        title: '开始事件',
        icon: 'bpmn-icon-start-event-none',
        color: '#10b981',
      },
      {
        target: 'bpmn:IntermediateThrowEvent',
        title: '中间抛出事件',
        icon: 'bpmn-icon-intermediate-event-none',
        color: '#8b5cf6',
      },
      {
        target: {
          type: 'bpmn:StartEvent',
          eventDefinitionType: 'bpmn:MessageEventDefinition',
        },
        title: '消息开始事件',
        icon: 'bpmn-icon-start-event-message',
        color: '#3b82f6',
      },
      {
        target: {
          type: 'bpmn:StartEvent',
          eventDefinitionType: 'bpmn:SignalEventDefinition',
        },
        title: '信号开始事件',
        icon: 'bpmn-icon-start-event-signal',
        color: '#06b6d4',
      },
      {
        target: {
          type: 'bpmn:StartEvent',
          eventDefinitionType: 'bpmn:TimerEventDefinition',
        },
        title: '定时器开始事件',
        icon: 'bpmn-icon-start-event-timer',
        color: '#f59e0b',
      },
      {
        target: {
          type: 'bpmn:StartEvent',
          eventDefinitionType: 'bpmn:ConditionalEventDefinition',
        },
        title: '条件开始事件',
        icon: 'bpmn-icon-start-event-condition',
        color: '#06b6d4',
      },
      {
        target: 'bpmn:EndEvent',
        title: '结束事件',
        icon: 'bpmn-icon-end-event-none',
        color: '#ef4444',
      },
    ],
  },
  {
    title: '任务',
    icon: 'bpmn-icon-task',
    color: '#3b82f6',
    items: [
      {
        target: 'bpmn:UserTask',
        title: '用户任务',
        icon: 'bpmn-icon-user',
        color: '#3b82f6',
      },
      {
        target: 'bpmn:ServiceTask',
        title: '服务任务',
        icon: 'bpmn-icon-service',
        color: '#8b5cf6',
      },
      {
        target: 'bpmn:ScriptTask',
        title: '脚本任务',
        icon: 'bpmn-icon-script',
        color: '#f59e0b',
      },
      {
        target: 'bpmn:SendTask',
        title: '发送任务',
        icon: 'bpmn-icon-send',
        color: '#10b981',
      },
      {
        target: 'bpmn:ReceiveTask',
        title: '接收任务',
        icon: 'bpmn-icon-receive',
        color: '#06b6d4',
      },
      {
        target: 'bpmn:ManualTask',
        title: '手动任务',
        icon: 'bpmn-icon-manual',
        color: '#64748b',
      },
      {
        target: 'bpmn:BusinessRuleTask',
        title: '业务规则任务',
        icon: 'bpmn-icon-business-rule',
        color: '#ec4899',
      },
    ],
  },
  {
    title: '网关',
    icon: 'bpmn-icon-gateway-none',
    color: '#f59e0b',
    items: [
      {
        target: 'bpmn:ExclusiveGateway',
        title: '排他网关',
        icon: 'bpmn-icon-gateway-none',
        color: '#f59e0b',
      },
      {
        target: 'bpmn:ParallelGateway',
        title: '并行网关',
        icon: 'bpmn-icon-gateway-parallel',
        color: '#10b981',
      },
      {
        target: 'bpmn:InclusiveGateway',
        title: '包含网关',
        icon: 'bpmn-icon-gateway-or',
        color: '#8b5cf6',
      },
      {
        target: 'bpmn:EventBasedGateway',
        title: '事件网关',
        icon: 'bpmn-icon-gateway-eventbased',
        color: '#f97316',
      },
      {
        target: 'bpmn:ComplexGateway',
        title: '复杂网关',
        icon: 'bpmn-icon-gateway-complex',
        color: '#f97316',
      },
    ],
  },
  {
    title: '子流程',
    icon: 'bpmn-icon-subprocess-expanded',
    color: '#8b5cf6',
    items: [
      {
        target: 'bpmn:CallActivity',
        title: '调用活动',
        icon: 'bpmn-icon-call-activity',
        color: '#10b981',
      },
      {
        target: { type: 'bpmn:SubProcess', isExpanded: true },
        title: '展开的子流程',
        icon: 'bpmn-icon-subprocess-expanded',
        color: '#8b5cf6',
      },
      {
        target: { type: 'bpmn:SubProcess', isExpanded: false },
        title: '折叠的子流程',
        icon: 'bpmn-icon-subprocess-collapsed',
        color: '#6366f1',
      },
      {
        target: {
          type: 'bpmn:SubProcess',
          isExpanded: true,
          triggeredByEvent: true,
        },
        title: '事件子流程',
        icon: 'bpmn-icon-event-subprocess-expanded',
        color: '#f59e0b',
      },
      {
        target: { type: 'bpmn:Transaction', isExpanded: true },
        title: '事务子流程',
        icon: 'bpmn-icon-transaction',
        color: '#ef4444',
      },
    ],
  },
  {
    title: '泳道/协作者',
    icon: 'bpmn-icon-participant',
    color: '#f97316',
    items: [
      {
        target: 'bpmn:Participant',
        title: '池',
        icon: 'bpmn-icon-participant',
        color: '#f97316',
      },
      {
        target: 'bpmn:Lane',
        title: '泳道',
        icon: 'bpmn-icon-lane',
        color: '#fb923c',
      },
      {
        target: 'bpmn:Group',
        title: '分组',
        icon: 'bpmn-icon-group',
        color: '#a855f7',
      },
    ],
  },
];

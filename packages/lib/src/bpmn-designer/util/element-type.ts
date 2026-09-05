// ──────────────────────────────────────────────
// 事件类型集合（需要进一步查询 EventDefinition 子类型）
// ──────────────────────────────────────────────

import {
  getEventDefinition,
  getEventDefinitionColor,
  getEventDefinitionLabel,
} from './bpmn-helper.ts';

const EVENT_TYPES = [
  'bpmn:StartEvent',
  'bpmn:EndEvent',
  'bpmn:IntermediateCatchEvent',
  'bpmn:IntermediateThrowEvent',
  'bpmn:BoundaryEvent',
];

// ──────────────────────────────────────────────
// 类型 → 标签 / 颜色（整合对象）
// ──────────────────────────────────────────────

export interface ElementTypeInfo {
  label: string;
  color: string;
}

export const ELEMENT_TYPE_MAP: Record<string, ElementTypeInfo> = {
  'bpmn:StartEvent': { label: '开始事件', color: '#10b981' },
  'bpmn:EndEvent': { label: '结束事件', color: '#ef4444' },
  'bpmn:IntermediateCatchEvent': { label: '中间捕获事件', color: '#3b82f6' },
  'bpmn:IntermediateThrowEvent': { label: '中间抛出事件', color: '#8b5cf6' },
  'bpmn:BoundaryEvent': { label: '边界事件', color: '#f59e0b' },
  'bpmn:Task': { label: '任务', color: '#3b82f6' },
  'bpmn:UserTask': { label: '用户任务', color: '#3b82f6' },
  'bpmn:ServiceTask': { label: '服务任务', color: '#8b5cf6' },
  'bpmn:ScriptTask': { label: '脚本任务', color: '#f59e0b' },
  'bpmn:SendTask': { label: '发送任务', color: '#10b981' },
  'bpmn:ReceiveTask': { label: '接收任务', color: '#06b6d4' },
  'bpmn:ManualTask': { label: '手动任务', color: '#64748b' },
  'bpmn:BusinessRuleTask': { label: '业务规则任务', color: '#ec4899' },
  'bpmn:CallActivity': { label: '调用活动', color: '#8b5cf6' },
  'bpmn:ExclusiveGateway': { label: '排他网关', color: '#f59e0b' },
  'bpmn:ParallelGateway': { label: '并行网关', color: '#10b981' },
  'bpmn:InclusiveGateway': { label: '包含网关', color: '#8b5cf6' },
  'bpmn:EventBasedGateway': { label: '事件网关', color: '#06b6d4' },
  'bpmn:SequenceFlow': { label: '顺序流', color: '#64748b' },
  'bpmn:SubProcess': { label: '子流程', color: '#6366f1' },
  'bpmn:AdHocSubProcess': { label: 'AdHoc子流程', color: '#6366f1' },
  'bpmn:Participant': { label: '参与者', color: '#64748b' },
  'bpmn:Process': { label: '流程', color: '#3b82f6' },
};

export const TYPE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ELEMENT_TYPE_MAP).map(([key, value]) => [key, value.label]),
);

export const TYPE_COLOR_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ELEMENT_TYPE_MAP).map(([key, value]) => [key, value.color]),
);

// ──────────────────────────────────────────────
// 查询函数
// ──────────────────────────────────────────────

/**
 * 获取元素类型的中文标签。
 * 对于事件类型，会进一步解析 EventDefinition 子类型以返回更精确的标签。
 */
export function getElementTypeLabel(
  type: string,
  businessObject?: any,
): string {
  if (EVENT_TYPES.includes(type) && businessObject) {
    const definitionType = getEventDefinition(businessObject);
    return getEventDefinitionLabel(type, definitionType);
  }
  return TYPE_LABEL_MAP[type] || type;
}

/**
 * 获取元素类型对应的主题色。
 * 对于事件类型，会进一步解析 EventDefinition 子类型以返回更精确的颜色。
 */
export function getElementTypeColor(
  type: string,
  businessObject?: any,
): string {
  if (EVENT_TYPES.includes(type) && businessObject) {
    const definitionType = getEventDefinition(businessObject);
    return getEventDefinitionColor(type, definitionType);
  }
  return TYPE_COLOR_MAP[type] || '#64748b';
}

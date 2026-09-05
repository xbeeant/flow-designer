import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil';

export interface EventDefinitionProps extends ModdleElement {
  [key: string]: any;
}

export const isFlowElement = (el: ModdleElement): boolean => {
  if (!el) {
    return false;
  }
  const $type = el.$type || getBusinessObject(el)?.$type;
  if (!$type) return false;
  return ['bpmn:MessageFlow', 'bpmn:SequenceFlow'].includes($type);
};

export const isTaskElement = (el: ModdleElement): boolean => {
  if (!el) {
    return false;
  }
  const $type = el.$type || getBusinessObject(el)?.$type;
  if (!$type) return false;
  return [
    'bpmn:BusinessRuleTask',
    'bpmn:ManualTask',
    'bpmn:ReceiveTask',
    'bpmn:ScriptTask',
    'bpmn:SendTask',
    'bpmn:ServiceTask',
    'bpmn:Task',
    'bpmn:UserTask',
  ].includes($type);
};

export const isGatewayElement = (el: ModdleElement): boolean => {
  if (!el) {
    return false;
  }
  const $type = el.$type || getBusinessObject(el)?.$type;
  if (!$type) return false;
  return [
    'bpmn:ComplexGateway',
    'bpmn:EventBasedGateway',
    'bpmn:ExclusiveGateway',
    'bpmn:Gateway',
    'bpmn:InclusiveGateway',
    'bpmn:ParallelGateway',
  ].includes($type);
};

export function getEventDefinition(element: ModdleElement) {
  const businessObject = getBusinessObject(element),
    eventDefinitions = businessObject.eventDefinitions;

  return eventDefinitions?.[0] as EventDefinitionProps;
}

export const getEventDefinitionLabel = (
  eventType: string,
  definitionType: EventDefinitionProps,
): string => {
  if (!definitionType) {
    const typeMap: Record<string, string> = {
      'bpmn:StartEvent': '开始事件',
      'bpmn:EndEvent': '结束事件',
      'bpmn:IntermediateCatchEvent': '中间捕获事件',
      'bpmn:IntermediateThrowEvent': '中间抛出事件',
      'bpmn:BoundaryEvent': '边界事件',
    };
    return typeMap[eventType] || eventType;
  }

  const definitionMap: Record<string, Record<string, string>> = {
    'bpmn:StartEvent': {
      'bpmn:MessageEventDefinition': '消息开始事件',
      'bpmn:SignalEventDefinition': '信号开始事件',
      'bpmn:TimerEventDefinition': '定时开始事件',
      'bpmn:ConditionalEventDefinition': '条件开始事件',
      'bpmn:ErrorEventDefinition': '错误开始事件',
      'bpmn:EscalationEventDefinition': '升级开始事件',
      'flowable:VariableListenerEventDefinition': '变量开始事件',
    },
    'bpmn:EndEvent': {
      'bpmn:MessageEventDefinition': '消息结束事件',
      'bpmn:SignalEventDefinition': '信号结束事件',
      'bpmn:ErrorEventDefinition': '错误结束事件',
      'bpmn:EscalationEventDefinition': '升级结束事件',
      'bpmn:TerminateEventDefinition': '终止结束事件',
      'bpmn:CompensateEventDefinition': '补偿结束事件',
    },
    'bpmn:IntermediateCatchEvent': {
      'bpmn:MessageEventDefinition': '消息捕获事件',
      'bpmn:SignalEventDefinition': '信号捕获事件',
      'bpmn:TimerEventDefinition': '定时捕获事件',
      'bpmn:ConditionalEventDefinition': '条件捕获事件',
      'bpmn:EscalationEventDefinition': '升级捕获事件',
      'flowable:VariableListenerEventDefinition': '变量捕获事件',
    },
    'bpmn:IntermediateThrowEvent': {
      'bpmn:MessageEventDefinition': '消息抛出事件',
      'bpmn:SignalEventDefinition': '信号抛出事件',
      'bpmn:CompensateEventDefinition': '补偿抛出事件',
    },
    'bpmn:BoundaryEvent': {
      'bpmn:MessageEventDefinition': '消息边界事件',
      'bpmn:SignalEventDefinition': '信号边界事件',
      'bpmn:TimerEventDefinition': '定时边界事件',
      'bpmn:ConditionalEventDefinition': '条件边界事件',
      'bpmn:ErrorEventDefinition': '错误边界事件',
      'bpmn:EscalationEventDefinition': '升级边界事件',
      'bpmn:CompensateEventDefinition': '补偿边界事件',
      'flowable:VariableListenerEventDefinition': '变量边界事件',
    },
  };

  return definitionMap[eventType]?.[definitionType.$type] || eventType;
};

export const getEventDefinitionColor = (
  eventType: string,
  definitionType: EventDefinitionProps,
): string => {
  if (!definitionType) {
    const typeMap: Record<string, string> = {
      'bpmn:StartEvent': '#10b981',
      'bpmn:EndEvent': '#ef4444',
      'bpmn:IntermediateCatchEvent': '#3b82f6',
      'bpmn:IntermediateThrowEvent': '#8b5cf6',
      'bpmn:BoundaryEvent': '#f59e0b',
    };
    return typeMap[eventType] || '#64748b';
  }

  const definitionColorMap: Record<string, string> = {
    'bpmn:MessageEventDefinition': '#3b82f6',
    'bpmn:SignalEventDefinition': '#8b5cf6',
    'bpmn:TimerEventDefinition': '#f59e0b',
    'bpmn:ErrorEventDefinition': '#ef4444',
    'bpmn:ConditionalEventDefinition': '#06b6d4',
    'bpmn:CompensateEventDefinition': '#ec4899',
    'bpmn:EscalationEventDefinition': '#f97316',
    'bpmn:TerminateEventDefinition': '#dc2626',
    'flowable:VariableListenerEventDefinition': '#10b981',
  };

  return definitionColorMap[definitionType.$type] || '#64748b';
};

export function getEventDefinitions(element: ModdleElement) {
  const businessObject = getBusinessObject(element);
  return (businessObject.eventDefinitions || []) as EventDefinitionProps[];
}

export function getConditionalEventDefinition(node: ModdleElement) {
  if (!is(node, 'bpmn:Event')) {
    return;
  }

  const eventDefinitions = getEventDefinitions(node);
  return eventDefinitions.find((def) =>
    is(def, 'bpmn:ConditionalEventDefinition'),
  );
}

export function hasCondition(connection: ModdleElement) {
  const bo = getBusinessObject(connection);

  return bo.conditionExpression?.body;
}

export const findParent: ModdleElement | null = (
  node: ModdleElement,
  type: string,
) => {
  if (!node) {
    return null;
  }

  const parent = node.parent;
  if (!parent) {
    return node;
  }

  if (is(parent, type)) {
    return parent;
  }

  return findParent(parent, type);
};

/**
 * Check if the node is inside of an executable process.
 *
 * @param { ModdleElement } node
 *
 * @return { boolean }
 */
export const isInExecutableProcess = (node: ModdleElement) => {
  const process = findParent(node, 'bpmn:Process');

  return getBusinessObject(process).isExecutable;
};

export function isConditionalForking(node: ModdleElement) {
  const defaultFlow = getBusinessObject(node).default;
  const outgoing = node.outgoing || [];
  return defaultFlow || outgoing.find(hasCondition);
}

export function isDefaultFlow(node: ModdleElement, flow: ModdleElement) {
  const defaultFlow: ModdleElement = getBusinessObject(node).default || {};
  return flow.id === defaultFlow.id;
}

export function hasEndEvent(node: ModdleElement) {
  const flowElements: ModdleElement[] = node.children || [];
  return flowElements.some((node) => is(node, 'bpmn:EndEvent'));
}

export function hasName(element: ModdleElement) {
  const bo = getBusinessObject(element);
  return bo.name && bo.name.trim() !== '';
}

export const getElementValue = (el: ModdleElement, key: string) => {
  return el[key] || getBusinessObject(el)[key];
};

export function isUnique(
  element: ModdleElement,
  elements: ModdleElement[],
  key: string,
) {
  const exists = elements.filter((otherRootElement) => {
    if (otherRootElement.type === 'label') {
      return false;
    }

    const elValue = getBusinessObject(element)[key];
    const otherValue = getBusinessObject(otherRootElement)[key];

    return (
      elValue !== undefined &&
      otherValue !== undefined &&
      elValue === otherValue
    );
  });

  return exists.length <= 1;
}

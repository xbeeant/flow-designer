import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { is, isAny } from 'bpmn-js/lib/util/ModelUtil';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import type Outline from 'diagram-js/lib/features/outline/Outline';
import { useCallback, useState } from 'react';
import {
  getConditionalEventDefinition,
  getElementValue,
  getEventDefinition,
  hasCondition,
  hasEndEvent,
  hasName,
  isDefaultFlow,
  isFlowElement,
  isGatewayElement,
  isInExecutableProcess,
  isTaskElement,
  isUnique,
} from '../util/bpmn-helper';

export interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  title: string;
  message: string;
  elementId?: string;
  elementName?: string;
}

export interface ProcessValidationState {
  open: boolean;
  errors: ValidationError[];
}

export interface ValidationRule {
  id: string;
  name: string;
  level: 'error' | 'warning';
  check: (elements: Map<string, ModdleElement>) => ValidationError[];
}

export const builtinRules: ValidationRule[] = [
  {
    id: 'start-event',
    name: '开始事件',
    level: 'error',
    check: (elements) => {
      const startEvents = Array.from(elements.values()).filter(
        (el) => el.type === 'bpmn:StartEvent',
      );

      if (startEvents.length === 0) {
        return [
          {
            id: 'no-start-event',
            type: 'error',
            title: '缺少开始事件',
            message: '流程必须包含至少一个开始事件',
          },
        ];
      } else if (startEvents.length > 1) {
        return [
          {
            id: 'multiple-start-events',
            type: 'warning',
            title: '多个开始事件',
            message: `流程包含 ${startEvents.length} 个开始事件，建议只有一个开始事件`,
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'ad-hoc-sub-process',
    name: '即席子流程',
    level: 'error',
    check: (elements) => {
      const els = Array.from(elements.values()).filter((el) =>
        is(el, 'bpmn:AdHocSubProcess'),
      );

      const errors: ValidationError[] = [];
      els.forEach((node) => {
        const flowElements: ModdleElement[] = node.children || [];

        flowElements.forEach((flowElement) => {
          if (is(flowElement, 'bpmn:StartEvent')) {
            const name = getElementValue(flowElement, 'name');
            errors.push({
              id: `ad-hoc-sub-process-${flowElement.id}`,
              type: 'error',
              title: '即席子流程',
              message: `在 （即席子流程）中不允许包含 （开始事件）`,
              elementId: flowElement.id,
              elementName: name,
            });
          }

          if (is(flowElement, 'bpmn:EndEvent')) {
            const name = getElementValue(flowElement, 'name');
            errors.push({
              id: `ad-hoc-sub-process-${flowElement.id}`,
              type: 'error',
              title: '即席子流程',
              message: `在 （即席子流程）中不允许包含 （结束事件）`,
              elementId: flowElement.id,
              elementName: name,
            });
          }
        });
      });
      return errors;
    },
  },
  {
    id: 'conditional-event',
    name: '缺少条件事件表达式',
    level: 'error',
    check: (elements) => {
      const els = Array.from(elements.values()).filter((el) =>
        isInExecutableProcess(el),
      );
      const errors: ValidationError[] = [];
      els.forEach((node) => {
        const eventDefinition = getConditionalEventDefinition(node);

        if (!eventDefinition) {
          return;
        }

        if (!hasCondition(eventDefinition)) {
          const name = getElementValue(node, 'name');
          errors.push({
            id: `conditional-event-${node.id}`,
            type: 'error',
            title: '缺少条件事件表达式',
            message: `${name}(${node.id}) 缺少条件（表达式）`,
            elementId: node.id,
            elementName: name,
          });
        }
      });
      return errors;
    },
  },
  {
    id: 'conditional-flows',
    name: '缺少条件的外向流',
    level: 'error',
    check: (elements) => {
      const els = Array.from(elements.values()).filter(
        (el) =>
          isGatewayElement(el) &&
          ['bpmn:ParallelGateway', 'bpmn:InclusiveGateway'].indexOf(el.type) ===
            -1,
      );

      const errors: ValidationError[] = [];

      els.forEach((node) => {
        const outgoing: ModdleElement[] = node.outgoing || [];

        outgoing.forEach((flow) => {
          if (!isDefaultFlow(node, flow)) {
            const missingCondition = !hasCondition(flow);

            if (missingCondition) {
              const name = getElementValue(flow, 'name');
              errors.push({
                id: `conditional-flows-${flow.id}`,
                type: 'error',
                title: '缺少条件的外向流',
                message: `${name || '网关'}(${node.id}) 的输出连线 ${flow.id} 缺少条件表达式`,
                elementId: node.id,
                elementName: name,
              });
            }
          }
        });
      });
      return errors;
    },
  },
  {
    id: 'end-event-required',
    name: '缺少结束事件',
    level: 'error',
    check: (elements) => {
      const els = Array.from(elements.values()).filter((el) =>
        isAny(el, ['bpmn:Process', 'bpmn:SubProcess', 'bpmn:AdHocSubProcess']),
      );
      const errors: ValidationError[] = [];

      els.forEach((node) => {
        if (!hasEndEvent(node)) {
          const name = getElementValue(node, 'name');
          errors.push({
            id: `end-event-required-${node.id}`,
            type: 'error',
            title: '缺少结束事件',
            message: `${name} (${node.id}) 缺少结束事件`,
            elementId: node.id,
            elementName: name,
          });
        }
      });
      return errors;
    },
  },
  {
    id: 'incoming',
    name: '传入数量',
    level: 'error',
    check: (elements) => {
      const els = Array.from(elements.values()).filter(
        (el) => isGatewayElement(el) || isTaskElement(el),
      );
      const errors: ValidationError[] = [];

      els.forEach((node) => {
        const incoming: Outline[] = node.incoming || [];

        if (incoming.length < 1) {
          const name = getElementValue(node, 'name');
          errors.push({
            id: `incoming-${node.id}`,
            type: 'error',
            title: '传入数量',
            message: `${name || ''}(${node.id}) 必须至少包含 1 条传入（序列流）。`,
            elementId: node.id,
            elementName: name,
          });
        }
      });
      return errors;
    },
  },
  {
    id: 'outgoing',
    name: '传出数量',
    level: 'error',
    check: (elements) => {
      const els = Array.from(elements.values()).filter(
        (el) => isGatewayElement(el) || isTaskElement(el),
      );
      const errors: ValidationError[] = [];

      els.forEach((node) => {
        const outgoing: Outline[] = node.outgoing || [];

        if (outgoing.length < 1) {
          const name = getElementValue(node, 'name');
          errors.push({
            id: `outgoing-${node.id}`,
            type: 'error',
            title: '传出数量',
            message: `${name || ''}(${node.id}) 必须至少包含 1 条传出（序列流）。`,
            elementId: node.id,
            elementName: name,
          });
        }
      });
      return errors;
    },
  },
  {
    id: 'event-based-gateway',
    name: '基于事件的网关',
    level: 'error',
    check: (elements) => {
      const els = Array.from(elements.values()).filter((el) =>
        is(el, 'bpmn:EventBasedGateway'),
      );
      const errors: ValidationError[] = [];

      els.forEach((node) => {
        const outgoing: Outline[] = node.outgoing || [];
        console.log(outgoing);
        if (outgoing.length < 2) {
          const name = getElementValue(node, 'name');
          errors.push({
            id: `event-based-gateway-${node.id}`,
            type: 'error',
            title: '基于事件的网关',
            message: `${name || ''}(${node.id}) 必须至少包含 2 条传出（序列流）。`,
            elementId: node.id,
            elementName: name,
          });
        }

        outgoing.forEach((flow) => {
          if (hasCondition(flow)) {
            const name = getElementValue(node, 'name');
            errors.push({
              id: `event-based-gateway-${node.id}`,
              type: 'error',
              title: '基于事件的网关',
              message: `${name || ''}(${node.id}) 从 （事件网关）引出的 （序列流）不能包含条件。`,
              elementId: node.id,
              elementName: name,
            });
          }
        });
      });
      return errors;
    },
  },
  {
    id: 'event-sub-process-typed-start-event',
    name: '事件子流程的特定开始事件',
    level: 'error',
    check: (elements) => {
      const els = Array.from(elements.values()).filter(
        (el) => is(el, 'bpmn:SubProcess') && el.triggeredByEvent,
      );
      const errors: ValidationError[] = [];

      els.forEach((node) => {
        const flowElements: ModdleElement[] = node.children || [];

        flowElements.forEach((flowElement) => {
          if (is(flowElement, 'bpmn:StartEvent')) {
            const eventDefinition = getEventDefinition(flowElement);

            if (!eventDefinition) {
              const name = getElementValue(node, 'name');
              errors.push({
                id: `event-sub-process-typed-start-event-${node.id}`,
                type: 'error',
                title: '事件子流程的特定开始事件',
                message: `${name || ''}(${node.id}) 开始事件缺少事件定义。`,
                elementId: node.id,
                elementName: name,
              });
            }
          }
        });
      });
      return errors;
    },
  },
  {
    id: 'global',
    name: '全局',
    level: 'error',
    check: (elements) => {
      const errors: ValidationError[] = [];
      const elValues = Array.from(elements.values());
      elValues.forEach((node) => {
        if (
          !is(node, 'bpmn:Definitions') &&
          !isFlowElement(node) &&
          !isGatewayElement(node)
        ) {
          if (!hasName(node)) {
            errors.push({
              id: `global-name-${node.id}`,
              type: 'warning',
              title: '全局',
              message: `${node.id} 缺少标签/名称。`,
              elementId: node.id,
            });
          }

          if (node.type !== 'label' && !isUnique(node, elValues, 'name')) {
            const name = getElementValue(node, 'name');
            errors.push({
              id: `global-unique-${node.id}`,
              type: 'warning',
              title: '全局',
              message: `${name || ''} (${node.id}) 名称不唯一。`,
              elementId: node.id,
              elementName: name,
            });
          }
        }
      });
      return errors;
    },
  },
];

export const useProcessValidation = () => {
  const [validationState, setValidationState] =
    useState<ProcessValidationState>({
      open: false,
      errors: [],
    });

  const highlightElements = useCallback(
    (modeler: Modeler, errors: ValidationError[]) => {
      const elementRegistry = modeler.get('elementRegistry') as ElementRegistry;
      const canvas = modeler.get('canvas') as Canvas;

      elementRegistry.forEach((element: ModdleElement) => {
        canvas.removeMarker(element, 'highlight');
        canvas.removeMarker(element, 'error');
        canvas.removeMarker(element, 'warning');
      });

      errors.forEach((error) => {
        if (error.elementId) {
          const element = elementRegistry.get(error.elementId);
          if (
            error.type === 'error' &&
            element &&
            !is(element, 'bpmn:Process')
          ) {
            // @ts-expect-error
            canvas.addMarker(element, 'highlight');
            // @ts-expect-error
            canvas.addMarker(element, error.type);
          }
        }
      });
    },
    [],
  );

  const validateProcess = useCallback(
    (_: string, modeler: Modeler): ValidationError[] => {
      const errors: ValidationError[] = [];

      try {
        const elementRegistry = modeler.get(
          'elementRegistry',
        ) as ElementRegistry;
        const elements = new Map<string, ModdleElement>();

        elementRegistry.forEach((el: ModdleElement) => {
          elements.set(el.id, el);
        });

        builtinRules.forEach((rule) => {
          const ruleErrors = rule.check(elements);
          ruleErrors.forEach((err) => {
            if (!errors.some((e) => e.id === err.id)) {
              errors.push(err);
            }
          });
        });

        highlightElements(modeler, errors);
      } catch (e) {
        console.error('Validation failed:', e);
      }

      return errors;
    },
    [highlightElements],
  );

  const handleValidate = useCallback(
    async (getXml: () => Promise<string>, modeler: Modeler) => {
      try {
        await getXml();
        const errors = validateProcess('', modeler);
        setValidationState({ open: true, errors });
        return errors;
      } catch (e) {
        console.error('Validation failed:', e);
        setValidationState({
          open: true,
          errors: [
            {
              id: 'validation-error',
              type: 'error',
              title: '校验失败',
              message: '无法解析BPMN XML，请检查XML格式是否正确',
            },
          ],
        });
        return [];
      }
    },
    [validateProcess],
  );

  const handleCloseValidation = useCallback(() => {
    setValidationState({ open: false, errors: [] });
  }, []);

  const clearMarkers = useCallback((modeler: Modeler) => {
    const elementRegistry = modeler.get('elementRegistry') as ElementRegistry;
    const canvas = modeler.get('canvas') as Canvas;

    elementRegistry.forEach((element: ModdleElement) => {
      canvas.removeMarker(element, 'highlight');
      canvas.removeMarker(element, 'error');
      canvas.removeMarker(element, 'warning');
    });
  }, []);

  return {
    validationState,
    handleValidate,
    handleCloseValidation,
    validateProcess,
    clearMarkers,
  };
};

import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useCallback, useEffect, useState } from 'react';
import { useModelerUpdate } from './useModelerUpdate';

export interface CallActivityParam {
  id: string;
  source: string;
  sourceExpression: string;
  target: string;
  variables: string;
  local: boolean;
}

const isInOutElement = (el: any): boolean =>
  el?.$type === 'flowable:In' || el?.$type === 'flowable:Out';

export function useCallActivityParams({
  modeler,
  element,
}: {
  modeler: Modeler;
  element: ModdleElement;
}) {
  const {
    moddle,
    createModdleElement,
    updateModdleProperties,
    findExtensionElementsByType,
  } = useModelerUpdate({ modeler });

  const [inParams, setInParams] = useState<CallActivityParam[]>([]);
  const [outParams, setOutParams] = useState<CallActivityParam[]>([]);

  useEffect(() => {
    if (!element || !modeler) {
      setInParams([]);
      setOutParams([]);
      return;
    }

    const bo = getBusinessObject(element);
    const ins = findExtensionElementsByType(bo, 'flowable:In');
    const outs = findExtensionElementsByType(bo, 'flowable:Out');

    const toItem = (el: any): CallActivityParam => ({
      id: el.id || '',
      source: el.source || '',
      sourceExpression: el.sourceExpression || '',
      target: el.target || '',
      variables: el.variables || '',
      local: !!el.local,
    });

    setInParams(ins.map(toItem));
    setOutParams(outs.map(toItem));
  }, [element, modeler, findExtensionElementsByType]);

  const sync = useCallback(
    (params: CallActivityParam[], type: 'flowable:In' | 'flowable:Out') => {
      if (!element || !moddle) return;

      const bo = getBusinessObject(element);
      let extensionElements = bo.extensionElements;
      if (!extensionElements) {
        extensionElements = createModdleElement('bpmn:ExtensionElements');
      }

      const existingValues = extensionElements.values || [];
      const otherElements = existingValues.filter(
        (el: any) => !isInOutElement(el),
      );

      const moddleItems = params.map((item) => {
        const moddleItem = moddle.create(type, {
          id: item.id,
          source: item.source || undefined,
          sourceExpression: item.sourceExpression || undefined,
          target: item.target || undefined,
          variables: item.variables || undefined,
          local: item.local || undefined,
        });
        return moddleItem;
      });

      extensionElements.values = [...otherElements, ...moddleItems];
      updateModdleProperties(element, bo, { extensionElements });
    },
    [element, moddle, createModdleElement, updateModdleProperties],
  );

  const updateIn = useCallback(
    (items: CallActivityParam[]) => {
      setInParams(items);
      sync(items, 'flowable:In');
    },
    [sync],
  );
  const updateOut = useCallback(
    (items: CallActivityParam[]) => {
      setOutParams(items);
      sync(items, 'flowable:Out');
    },
    [sync],
  );

  return { inParams, outParams, updateIn, updateOut };
}

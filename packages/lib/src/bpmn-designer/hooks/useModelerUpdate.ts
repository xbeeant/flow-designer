import type BpmnModeler from 'bpmn-js/lib/Modeler';
import type { Moddle } from 'bpmn-js/lib/model/Types';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type { RootLike } from 'diagram-js/lib/model/Types';
import { useCallback, useMemo } from 'react';

interface UseModelerUpdateProps {
  modeler: BpmnModeler | null | undefined;
  modelerVersion?: number;
}

interface ModelingService {
  updateProperties: (
    element: ModdleElement,
    properties: Record<string, any>,
  ) => void;
  updateModdleProperties: (
    element: ModdleElement,
    businessObject: any,
    properties: Record<string, any>,
  ) => void;
  removeElements: (elements: ModdleElement[]) => void;
  createShape: (
    shape: { type: string; businessObject?: any },
    position: { x: number; y: number },
    parent?: ModdleElement,
    options?: any,
  ) => void;
}

interface EventBusService {
  fire: (event: string, data?: Record<string, any>) => void;
}

interface ModdleService {
  create: (type: string, properties: Record<string, any>) => any;
}

interface ElementRegistry {
  get: (id: string) => ModdleElement | undefined;
  filter: (callback: (element: ModdleElement) => boolean) => ModdleElement[];
}

export const useModelerUpdate = ({
  modeler,
  modelerVersion,
}: UseModelerUpdateProps) => {
  const modeling = useMemo(
    () => modeler?.get('modeling') as ModelingService | null,
    [modeler, modelerVersion],
  );
  const moddle = useMemo(
    () => modeler?.get('moddle') as ModdleService | null,
    [modeler, modelerVersion],
  );
  const eventBus = useMemo(
    () => modeler?.get('eventBus') as EventBusService | null,
    [modeler, modelerVersion],
  );
  const elementRegistry = useMemo(
    () => modeler?.get('elementRegistry') as ElementRegistry | null,
    [modeler, modelerVersion],
  );

  const getRootElement = useCallback(() => {
    const canvas = modeler?.get('canvas') as Canvas;
    return canvas?.getRootElement() as RootLike;
  }, [modeler, modelerVersion]);

  const updateProperties = useCallback(
    (element: ModdleElement, properties: Record<string, any>) => {
      modeling?.updateProperties(element, properties);
    },
    [modeling],
  );

  const updateModdleProperties = useCallback(
    (
      element: ModdleElement,
      businessObject: any,
      properties: Record<string, any>,
    ) => {
      modeling?.updateModdleProperties(element, businessObject, properties);
    },
    [modeling],
  );

  const getDefinitions = useCallback(() => {
    const rootElement = getRootElement();
    return getBusinessObject(rootElement).$parent;
  }, [getRootElement]);

  const getRootElements = useCallback(
    (type?: string) => {
      const definitions = getDefinitions();

      if (!definitions) {
        return [] as ModdleElement[];
      }

      if (type) {
        return (definitions.rootElements || []).filter(
          (el: ModdleElement) => el.$type === type,
        ) as ModdleElement[];
      }

      return (definitions.rootElements || []) as ModdleElement[];
    },
    [getDefinitions],
  );

  const getRootElementById = useCallback(
    (signalId: string) => {
      return getRootElements().find((signal) => signal.id === signalId);
    },
    [getDefinitions],
  );

  const removeElements = useCallback(
    (elements: ModdleElement[]) => {
      modeling?.removeElements(elements);
    },
    [modeling],
  );

  const createShape = useCallback(
    (
      shape: { type: string; businessObject?: any },
      position: { x: number; y: number },
      parent?: ModdleElement,
      options?: any,
    ) => {
      modeling?.createShape(shape, position, parent, options);
    },
    [modeling],
  );

  const fire = useCallback(
    (event: string, data?: Record<string, any>) => {
      eventBus?.fire(event, data);
    },
    [eventBus],
  );

  const createModdleElement = useCallback(
    (type: string, properties: Record<string, any> = {}) => {
      return moddle?.create(type, properties) ?? null;
    },
    [moddle],
  );

  const getElementById = useCallback(
    (id: string) => elementRegistry?.get(id) ?? null,
    [elementRegistry],
  );

  const findElements = useCallback(
    (filter: (element: ModdleElement) => boolean) => {
      return elementRegistry?.filter(filter) ?? [];
    },
    [elementRegistry],
  );

  const updateDesignElement = useCallback(
    (element: ModdleElement, businessObject: any, key: string, value: any) => {
      let extensionElements = businessObject.get('extensionElements');
      if (!extensionElements) {
        extensionElements = createModdleElement('bpmn:ExtensionElements');
      }

      const values = extensionElements.get('values') || [];

      const designType = `design:${key.charAt(0).toUpperCase() + key.slice(1)}`;
      const exitItemIdx = values.findIndex(
        (v: ModdleElement) => v.$type === designType,
      );

      if (exitItemIdx >= 0) {
        values[exitItemIdx].value = value;
      } else {
        const designElement = createModdleElement(designType, {
          value,
        });
        if (designElement) {
          values.push(designElement);
        }
      }

      extensionElements.set('values', values);

      updateModdleProperties(element, businessObject, {
        extensionElements,
      });
    },
    [createModdleElement, updateModdleProperties],
  );

  const getDesignElement = useCallback((businessObject: any, key: string) => {
    const extensionElements = businessObject.get('extensionElements');
    if (!extensionElements) return '';

    const values = extensionElements.get('values') || [];
    const designType = `design:${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const designElement = values.find((el: any) => el.$type === designType);
    return designElement?.value || '';
  }, []);

  const getExtensionElements = useCallback((businessObject: any): any => {
    return businessObject.extensionElements || null;
  }, []);

  const getExtensionElementValues = useCallback(
    (businessObject: any): any[] => {
      const extensionElements = getExtensionElements(businessObject);
      return extensionElements?.values || [];
    },
    [getExtensionElements],
  );

  const findExtensionElementsByType = useCallback(
    (businessObject: any, type: string): any[] => {
      const values = getExtensionElementValues(businessObject);
      return values.filter((el: any) => el.$type === type);
    },
    [getExtensionElementValues],
  );

  const syncExtensionElementsByType = useCallback(
    (
      element: ModdleElement,
      businessObject: any,
      items: ModdleElement[],
      itemType: string,
      buildModdleItem: (moddle: Moddle, item: ModdleElement) => ModdleElement,
    ) => {
      if (!moddle || !createModdleElement) return;

      let extensionElements = getExtensionElements(businessObject);
      if (!extensionElements) {
        extensionElements = createModdleElement('bpmn:ExtensionElements');
      }

      const existingValues = extensionElements.values || [];
      const otherElements = existingValues.filter(
        (el: ModdleElement) => el.$type !== itemType,
      );

      const moddleItems = items.map((item) => buildModdleItem(moddle, item));
      extensionElements.values = [...otherElements, ...moddleItems];

      updateModdleProperties(element, businessObject, { extensionElements });
    },
    [moddle, createModdleElement, updateModdleProperties, getExtensionElements],
  );

  const removeExtensionElementsByType = useCallback(
    (element: ModdleElement, businessObject: any, type: string) => {
      const extensionElements = getExtensionElements(businessObject);
      if (!extensionElements) return;

      const existingValues = extensionElements.values || [];
      const filteredValues = existingValues.filter(
        (el: ModdleElement) => el.$type !== type,
      );

      if (filteredValues.length === 0) {
        updateModdleProperties(element, businessObject, {
          extensionElements: undefined,
        });
      } else {
        extensionElements.values = filteredValues;
        updateModdleProperties(element, businessObject, { extensionElements });
      }
    },
    [getExtensionElements, updateModdleProperties],
  );

  return {
    modeling,
    moddle,
    updateProperties,
    updateModdleProperties,
    removeElements,
    createShape,
    fire,
    createModdleElement,
    updateDesignElement,
    getDesignElement,
    getElementById,
    findElements,
    getRootElement,
    getDefinitions,
    getRootElements,
    getRootElementById,
    getExtensionElements,
    getExtensionElementValues,
    findExtensionElementsByType,
    syncExtensionElementsByType,
    removeExtensionElementsByType,
  };
};

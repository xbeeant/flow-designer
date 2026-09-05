import type Modeler from 'bpmn-js/lib/Modeler';
import type { Moddle } from 'bpmn-js/lib/model/Types';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useCallback, useEffect, useState } from 'react';
import { generateId } from '../util/random-char';
import { useModelerUpdate } from './useModelerUpdate';

export interface EventListenerField {
  id: string;
  name: string;
  string: string;
  expression: string;
}

export interface EventListenerItem extends Record<string, any> {
  id: string;
  events: string[];
  throwEvent: string;
  listenerType: string;
  className: string;
  expression: string;
  delegateExpression: string;
  entityType: string;
  fields: EventListenerField[];
}

interface UseEventListenersOptions {
  modeler: Modeler;
  element: ModdleElement;
  modelerVersion?: number;
  onListenersChange?: (count: number) => void;
}

const getListenerType = (listener: any): string =>
  listener.class
    ? 'class'
    : listener.expression
      ? 'expression'
      : listener.delegateExpression
        ? 'delegateExpression'
        : '';

const extractFields = (fields: any[]): EventListenerField[] =>
  fields.map((field: any) => ({
    id: field.id || '',
    name: field.name || '',
    string: field.string || '',
    expression: field.expression || '',
  }));

const buildModdleEventListener = (
  moddle: Moddle,
  item: EventListenerItem,
): ModdleElement => {
  const moddleItem = moddle.create('flowable:EventListener', {
    id: item.id,
    events: item.events.join(','),
    entityType: item.entityType,
  }) as ModdleElement;
  if (item.className) moddleItem.class = item.className;
  if (item.expression) moddleItem.expression = item.expression;
  if (item.delegateExpression)
    moddleItem.delegateExpression = item.delegateExpression;
  if (item.throwEvent) moddleItem.throwEvent = item.throwEvent;
  if (item.fields?.length > 0) {
    moddleItem.fields = item.fields.map((field: EventListenerField) => {
      const moddleField = moddle.create('flowable:Field', { name: field.name });
      if (field.string) moddleField.string = field.string;
      if (field.expression) moddleField.expression = field.expression;
      return moddleField;
    });
  }
  return moddleItem;
};

export function useEventListeners({
  modeler,
  element,
  modelerVersion,
  onListenersChange,
}: UseEventListenersOptions) {
  const { findExtensionElementsByType, syncExtensionElementsByType } =
    useModelerUpdate({
      modeler,
      modelerVersion,
    });

  const [listeners, setListeners] = useState<EventListenerItem[]>([]);
  const [editingItem, setEditingItem] = useState<EventListenerItem | null>(
    null,
  );

  useEffect(() => {
    if (!element) {
      setListeners([]);
      return;
    }

    const processData = getBusinessObject(element);
    const rawListeners =
      processData?.extensionElements?.get?.('eventListeners') ||
      processData?.extensionElements?.get?.('flowable:eventListeners') ||
      findExtensionElementsByType(processData, 'flowable:EventListener');

    if (!rawListeners || !Array.isArray(rawListeners)) {
      setListeners([]);
      return;
    }

    const items = rawListeners.map((listener: any) => ({
      id: listener.id || '',
      events: listener.events
        ? typeof listener.events === 'string'
          ? listener.events.split(',').filter(Boolean)
          : listener.events
        : [],
      throwEvent: listener.throwEvent || '',
      listenerType: getListenerType(listener),
      className: listener.class || '',
      expression: listener.expression || '',
      delegateExpression: listener.delegateExpression || '',
      entityType: listener.entityType || '',
      fields: extractFields(listener.fields || []),
    }));

    setListeners(items);
    onListenersChange?.(items.length);
  }, [
    modeler,
    modelerVersion,
    element,
    onListenersChange,
    findExtensionElementsByType,
  ]);

  const syncListeners = useCallback(
    (items: EventListenerItem[]) => {
      if (!element) return;
      const businessObject = getBusinessObject(element);
      syncExtensionElementsByType(
        element,
        businessObject,
        items,
        'flowable:EventListener',
        buildModdleEventListener,
      );
    },
    [element, syncExtensionElementsByType],
  );

  const handleEdit = useCallback((item: EventListenerItem) => {
    setEditingItem(item);
  }, []);

  const handleDelete = useCallback(
    (index: number) => {
      const next = listeners.filter((_, i) => i !== index);
      setListeners(next);
      syncListeners(next);
      onListenersChange?.(next.length);
    },
    [listeners, syncListeners, onListenersChange],
  );

  const handleSave = useCallback(
    (values: EventListenerItem) => {
      const next = editingItem
        ? listeners.map((item) => (item.id === editingItem.id ? values : item))
        : [...listeners, { ...values, id: generateId('EventListener') }];
      console.log(next);
      setListeners(next);
      syncListeners(next);
      onListenersChange?.(next.length);
      setEditingItem(null);
    },
    [editingItem, listeners, syncListeners, onListenersChange],
  );

  return {
    listeners,
    editingItem,
    handleEdit,
    handleDelete,
    handleSave,
  };
}

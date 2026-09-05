import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useCallback, useEffect, useState } from 'react';
import type { FieldType } from '../properties/components/field-table';
import {
  buildTaskListener,
  detectListenerType,
  extractFields,
} from '../util/listener';
import { generateId } from '../util/random-char';
import { useModelerUpdate } from './useModelerUpdate';

export interface TaskListenerItem {
  id: string;
  event: string;
  type: 'class' | 'expression' | 'delegateExpression' | 'script';
  className: string;
  expression: string;
  delegateExpression: string;
  scriptType: 'inline' | 'external';
  script: string;
  scriptResource: string;
  fields: FieldType[];
}

interface UseTaskListenersProps {
  modeler: Modeler;
  element: ModdleElement;
}

export function useTaskListeners({ modeler, element }: UseTaskListenersProps) {
  const { findExtensionElementsByType, syncExtensionElementsByType } =
    useModelerUpdate({
      modeler,
    });

  const [listeners, setListeners] = useState<TaskListenerItem[]>([]);
  const [editingItem, setEditingItem] = useState<TaskListenerItem>();

  useEffect(() => {
    if (!element || !modeler) {
      setListeners([]);
      return;
    }

    const rawListeners =
      findExtensionElementsByType(
        getBusinessObject(element),
        'flowable:TaskListener',
      ) || [];

    const items = rawListeners.map((listener: any) => ({
      id: listener.id || '',
      event: listener.event || '',
      type: detectListenerType(listener) as TaskListenerItem['type'],
      className: listener.class || '',
      expression: listener.expression || '',
      delegateExpression: listener.delegateExpression || '',
      scriptType: (listener.scriptResource
        ? 'external'
        : 'inline') as TaskListenerItem['scriptType'],
      script: listener.script || '',
      scriptResource: listener.scriptResource || '',
      fields: extractFields(listener),
    }));

    setListeners(items);
  }, [element, modeler, findExtensionElementsByType]);

  const doSync = useCallback(
    (items: TaskListenerItem[]) => {
      if (!element) return;
      syncExtensionElementsByType(
        element,
        getBusinessObject(element),
        items,
        'flowable:TaskListener',
        buildTaskListener,
      );
    },
    [element, syncExtensionElementsByType],
  );

  const updateAndNotify = useCallback(
    (newListeners: TaskListenerItem[]) => {
      setListeners(newListeners);
      doSync(newListeners);
    },
    [doSync],
  );

  const handleEdit = useCallback((item: TaskListenerItem) => {
    setEditingItem(item);
  }, []);

  const handleDelete = useCallback(
    (index: number) => updateAndNotify(listeners.filter((_, i) => i !== index)),
    [listeners, updateAndNotify],
  );

  const handleSave = useCallback(
    (values: TaskListenerItem) => {
      const newListeners = editingItem
        ? listeners.map((item) =>
            item.id === editingItem.id
              ? { ...values, id: editingItem.id }
              : item,
          )
        : [...listeners, { ...values, id: generateId('TaskListener') }];
      updateAndNotify(newListeners);
      setEditingItem(undefined);
    },
    [listeners, editingItem, updateAndNotify],
  );

  return {
    listeners,
    editingItem,
    handleEdit,
    handleDelete,
    handleSave,
  };
}

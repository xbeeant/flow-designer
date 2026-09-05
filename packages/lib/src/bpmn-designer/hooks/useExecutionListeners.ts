import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useCallback, useEffect, useState } from 'react';
import type { ExecutionListenerItem } from '../properties/components/execution-listener-modal';
import {
  buildExecutionListener,
  detectListenerType,
  extractFields,
} from '../util/listener';
import { generateId } from '../util/random-char';
import { useModelerUpdate } from './useModelerUpdate';

interface UseExecutionListenersProps {
  modeler: Modeler;
  modelerVersion?: number;
  element: ModdleElement;
  onListenersChange?: (count: number) => void;
}

export function useExecutionListeners({
  modeler,
  modelerVersion,
  element,
  onListenersChange,
}: UseExecutionListenersProps) {
  const { findExtensionElementsByType, syncExtensionElementsByType } =
    useModelerUpdate({
      modeler,
      modelerVersion,
    });

  const [listeners, setListeners] = useState<ExecutionListenerItem[]>([]);
  const [editingItem, setEditingItem] = useState<ExecutionListenerItem>();

  useEffect(() => {
    if (!element || !modeler) {
      setListeners([]);
      return;
    }

    const rawListeners =
      findExtensionElementsByType(
        getBusinessObject(element),
        'flowable:ExecutionListener',
      ) || [];

    const items = rawListeners.map((listener: any) => ({
      id: listener.id || '',
      event: listener.event || '',
      type: detectListenerType(listener) as ExecutionListenerItem['type'],
      className: listener.class || '',
      expression: listener.expression || '',
      delegateExpression: listener.delegateExpression || '',
      scriptType: (listener.scriptResource
        ? 'external'
        : 'inline') as ExecutionListenerItem['scriptType'],
      script: listener.script || '',
      scriptResource: listener.scriptResource || '',
      transaction: listener.transaction || '',
      fields: extractFields(listener),
    }));

    setListeners(items);
    onListenersChange?.(items.length);
  }, [
    element,
    modeler,
    modelerVersion,
    onListenersChange,
    findExtensionElementsByType,
  ]);

  const doSync = useCallback(
    (items: ExecutionListenerItem[]) => {
      if (!element) return;
      syncExtensionElementsByType(
        element,
        getBusinessObject(element),
        items,
        'flowable:ExecutionListener',
        buildExecutionListener,
      );
    },
    [element, syncExtensionElementsByType],
  );

  const updateAndNotify = useCallback(
    (newListeners: ExecutionListenerItem[]) => {
      setListeners(newListeners);
      doSync(newListeners);
      onListenersChange?.(newListeners.length);
    },
    [doSync, onListenersChange],
  );

  const handleEdit = useCallback((item: ExecutionListenerItem) => {
    setEditingItem(item);
  }, []);

  const handleDelete = useCallback(
    (index: number) => updateAndNotify(listeners.filter((_, i) => i !== index)),
    [listeners, updateAndNotify],
  );

  const handleSave = useCallback(
    (values: ExecutionListenerItem) => {
      const newListeners = editingItem
        ? listeners.map((item) =>
            item.id === editingItem.id
              ? { ...values, id: editingItem.id }
              : item,
          )
        : [...listeners, { ...values, id: generateId('ExecutionListener') }];
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

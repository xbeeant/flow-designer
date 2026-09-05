import type Modeler from 'bpmn-js/lib/Modeler';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  extractDefinitionItems,
  syncEventDefinitions,
} from '../components/GlobalEventsPanel.config';
import { EVENT_TYPE_CONFIGS } from '../components/GlobalEventsPanel.tsx';
import { generateId } from '../util/random-char';
import { useModelerUpdate } from './useModelerUpdate';

type EventType = 'message' | 'error' | 'signal' | 'escalation';

const EMPTY_DATA: Record<EventType, any[]> = {
  message: [],
  error: [],
  signal: [],
  escalation: [],
};

interface UseGlobalEventsProps {
  modeler: Modeler;
  modelerVersion?: number;
  onEventsChange?: (totalCount: number) => void;
  eventType?: EventType;
}

export const useGlobalEvents = ({
  modeler,
  modelerVersion,
  onEventsChange,
  eventType = 'message',
}: UseGlobalEventsProps) => {
  const { moddle, createModdleElement, fire, getRootElement, getDefinitions } =
    useModelerUpdate({ modeler, modelerVersion });

  const [eventData, setEventData] =
    useState<Record<EventType, any[]>>(EMPTY_DATA);

  const [editingItem, setEditingItem] = useState<any>(null);

  const totalCount = useMemo(
    () => Object.values(eventData).reduce((sum, arr) => sum + arr.length, 0),
    [eventData],
  );

  // 从 modeler 加载数据
  useEffect(() => {
    if (!modeler) {
      setEventData(EMPTY_DATA);
      return;
    }

    const definitions = getDefinitions();
    const rootElements = definitions?.rootElements || [];

    const newData = {} as Record<EventType, any[]>;
    for (const config of EVENT_TYPE_CONFIGS) {
      newData[config.type] = extractDefinitionItems(
        rootElements,
        config.bpmnType,
      );
    }
    setEventData(newData);
    onEventsChange?.(
      Object.values(newData).reduce((sum, arr) => sum + arr.length, 0),
    );
  }, [modeler, modelerVersion, onEventsChange, getRootElement]);

  /** 将指定类型的事件数据写回 modeler */
  const updateEventDefinitions = useCallback(
    (type: EventType, items: any[]) => {
      const definitions = getDefinitions();
      const config = EVENT_TYPE_CONFIGS.find((c) => c.type === type);
      if (!definitions || !moddle || !config) return;

      syncEventDefinitions(
        definitions,
        config.bpmnType,
        items,
        createModdleElement,
      );
      fire('elements.changed', { elements: [getRootElement] });
    },
    [getRootElement, moddle, createModdleElement, fire, getDefinitions],
  );

  const updateTypeData = useCallback(
    (type: EventType, newData: any[]) => {
      setEventData((prev) => ({ ...prev, [type]: newData }));
      updateEventDefinitions(type, newData);
    },
    [updateEventDefinitions],
  );

  const handleEdit = useCallback((item: any) => {
    setEditingItem(item);
  }, []);

  const handleDelete = useCallback(
    (type: EventType, index: number) => {
      const newData = eventData[type].filter((_, i) => i !== index);
      updateTypeData(type, newData);
      onEventsChange?.(totalCount - 1);
    },
    [eventData, totalCount, updateTypeData, onEventsChange],
  );

  const handleSave = useCallback(
    (values: Record<string, any>) => {
      const currentData = eventData[eventType];
      const newData = editingItem
        ? currentData.map((item) =>
            item.id === editingItem.id
              ? { ...values, id: editingItem.id }
              : item,
          )
        : [...currentData, { ...values, id: generateId(eventType) }];

      updateTypeData(eventType, newData);
      onEventsChange?.(totalCount + (editingItem ? 0 : 1));

      setEditingItem(null);
    },
    [
      eventData,
      eventType,
      editingItem,
      totalCount,
      updateTypeData,
      onEventsChange,
    ],
  );

  return {
    eventData,
    totalCount,
    editingItem,
    handleEdit,
    handleDelete,
    handleSave,
  };
};

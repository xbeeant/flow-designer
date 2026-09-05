import type Modeler from 'bpmn-js/lib/Modeler';
import { useCallback, useEffect, useState } from 'react';
import { generateId } from '../util/random-char';

export interface CollectionItem {
  id: string;
}

export interface UseCollectionProps<T extends CollectionItem> {
  modeler: Modeler | null | undefined;
  modelerVersion?: number;
  extractItems: (element: any) => T[];
  syncItems: (items: T[]) => void;
  element?: any;
  onCountChange?: (count: number) => void;
}

export interface UseCollectionResult<T extends CollectionItem> {
  items: T[];
  editingItem: T | null;
  handleEdit: (item: T) => void;
  handleDelete: (index: number) => void;
  handleSave: (values: Omit<T, 'id'>) => void;
}

export function useCollection<T extends CollectionItem>({
  modeler,
  modelerVersion,
  extractItems,
  syncItems,
  element,
  onCountChange,
}: UseCollectionProps<T>): UseCollectionResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  useEffect(() => {
    if (!element || !modeler) {
      setItems([]);
      return;
    }
    const extractedItems = extractItems(element);
    setItems(extractedItems);
    onCountChange?.(extractedItems.length);
  }, [element, modeler, modelerVersion, extractItems, onCountChange]);

  const updateAndNotify = useCallback(
    (newItems: T[]) => {
      setItems(newItems);
      syncItems(newItems);
      onCountChange?.(newItems.length);
    },
    [syncItems, onCountChange],
  );

  const handleEdit = useCallback((item: T) => {
    setEditingItem(item);
  }, []);

  const handleDelete = useCallback(
    (index: number) => updateAndNotify(items.filter((_, i) => i !== index)),
    [items, updateAndNotify],
  );

  const handleSave = useCallback(
    (values: Omit<T, 'id'>) => {
      const newItem: T = {
        ...(values as T),
        id: editingItem?.id || generateId('Item'),
      };

      const newItems = editingItem
        ? items.map((item) => (item.id === editingItem.id ? newItem : item))
        : [...items, newItem];

      updateAndNotify(newItems);
      setEditingItem(null);
    },
    [items, editingItem, updateAndNotify],
  );

  return {
    items,
    editingItem,
    handleEdit,
    handleDelete,
    handleSave,
  };
}
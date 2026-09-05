import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useCallback, useEffect, useState } from 'react';
import { generateId } from '../util/random-char';
import { useModelerUpdate } from './useModelerUpdate';

export interface TimerDurationValue {
  timeDuration: string;
  timeDurationType?: string;
  businessType?: string;
  durationBusinessCalendar?: string;
}

export interface ExtensionPropertyItem {
  id?: string;
  name: string;
  value: string | TimerDurationValue;
  type: 'normal' | 'standardDuration' | 'timerDuration';
}

interface UseExtensionsProps {
  modeler: Modeler;
  modelerVersion?: number;
  element: ModdleElement;
  onPropertiesChange?: (count: number) => void;
}

function buildModdleProperty(moddle: any, item: ExtensionPropertyItem): any {
  let value: string;
  if (item.type === 'timerDuration') {
    value = JSON.stringify(item.value);
  } else {
    value = String(item.value);
  }

  return moddle.create('flowable:Property', {
    id: item.id,
    name: item.name,
    value: value,
  });
}

export function useExtensions({
  modeler,
  modelerVersion,
  element,
  onPropertiesChange,
}: UseExtensionsProps) {
  const {
    moddle,
    findExtensionElementsByType,
    createModdleElement,
    updateModdleProperties,
    getExtensionElements,
  } = useModelerUpdate({ modeler, modelerVersion });

  const [properties, setProperties] = useState<ExtensionPropertyItem[]>([]);
  const [editingItem, setEditingItem] = useState<ExtensionPropertyItem | null>(
    null,
  );

  useEffect(() => {
    if (!element || !modeler) {
      setProperties([]);
      return;
    }

    const flowablePropertiesList = findExtensionElementsByType(
      getBusinessObject(element),
      'flowable:Properties',
    );

    const propsArray: ExtensionPropertyItem[] = [];
    flowablePropertiesList.forEach((props: any) => {
      const values = props.values || [];
      values.forEach((prop: any) => {
        let value: string | TimerDurationValue = prop.value || '';
        let type: 'normal' | 'standardDuration' | 'timerDuration' = 'normal';

        if (prop.name === 'standardDuration') {
          type = 'standardDuration';
        } else if (prop.name === 'timerDurationJob') {
          type = 'timerDuration';
          try {
            value = JSON.parse(prop.value);
          } catch {
            value = { timeDuration: prop.value || '' };
          }
        }

        propsArray.push({
          id: prop.id || '',
          name: prop.name || '',
          value,
          type,
        });
      });
    });

    setProperties(propsArray);
    onPropertiesChange?.(propsArray.length);
  }, [
    element,
    modeler,
    modelerVersion,
    onPropertiesChange,
    findExtensionElementsByType,
  ]);

  const doSync = useCallback(
    (items: ExtensionPropertyItem[]) => {
      if (
        !element ||
        !moddle ||
        !createModdleElement ||
        !updateModdleProperties
      )
        return;

      let extensionElements = getExtensionElements(getBusinessObject(element));
      if (!extensionElements) {
        extensionElements = createModdleElement('bpmn:ExtensionElements');
      }

      const existingValues = extensionElements.values || [];
      const otherElements = existingValues.filter(
        (el: any) => el.$type !== 'flowable:Properties',
      );

      if (items.length === 0) {
        extensionElements.values = otherElements;
        if (otherElements.length === 0) {
          updateModdleProperties(element, getBusinessObject(element), {
            extensionElements: undefined,
          });
        } else {
          updateModdleProperties(element, getBusinessObject(element), {
            extensionElements,
          });
        }
        return;
      }

      const propertiesArray = items.map((item) =>
        buildModdleProperty(moddle, item),
      );
      const flowableProperties = createModdleElement('flowable:Properties', {
        values: propertiesArray,
      });

      extensionElements.values = [...otherElements, flowableProperties];
      updateModdleProperties(element, getBusinessObject(element), {
        extensionElements,
      });
    },
    [
      element,
      moddle,
      createModdleElement,
      updateModdleProperties,
      getExtensionElements,
    ],
  );

  const updateAndNotify = useCallback(
    (newProperties: ExtensionPropertyItem[]) => {
      setProperties(newProperties);
      doSync(newProperties);
      onPropertiesChange?.(newProperties.length);
    },
    [doSync, onPropertiesChange],
  );

  const handleEdit = useCallback((item: ExtensionPropertyItem) => {
    setEditingItem(item);
  }, []);

  const handleDelete = useCallback(
    (index: number) =>
      updateAndNotify(properties.filter((_, i) => i !== index)),
    [properties, updateAndNotify],
  );

  const handleSave = useCallback(
    (value: ExtensionPropertyItem, uniqueKey?: boolean) => {
      let processedValues = { ...value };
      if (value.type === 'standardDuration') {
        processedValues = { ...value, name: 'standardDuration' };
      } else if (value.type === 'timerDuration') {
        processedValues = { ...value, name: 'timerDurationJob' };
      }

      const newItem: ExtensionPropertyItem = {
        id: editingItem?.id || generateId('Property'),
        name: processedValues.name,
        value: processedValues.value,
        type: processedValues.type,
      };
      if (uniqueKey || editingItem?.id === '') {
        const newProperties = properties.filter(
          (item) => item.name !== value.name,
        );
        newProperties.push(processedValues);
        updateAndNotify(newProperties);
      } else {
        const newProperties = editingItem
          ? properties.map((item) => {
              return item.id === editingItem.id ? newItem : item;
            })
          : [...properties, newItem];

        updateAndNotify(newProperties);
      }
      setEditingItem(null);
    },
    [properties, editingItem, updateAndNotify],
  );

  return {
    properties,
    editingItem,
    handleEdit,
    handleDelete,
    handleSave,
  };
}

import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { useCallback, useEffect, useState } from 'react';
import type { DataObjectItem } from '../properties/components/data-object-modal';
import { generateId } from '../util/random-char';
import { useModelerUpdate } from './useModelerUpdate';

interface UseDataObjectsProps {
  modeler: Modeler;
  modelerVersion?: number;
  processElement: ModdleElement;
  onDataChange?: (count: number) => void;
}

export const useDataObjects = ({
  modeler,
  modelerVersion,
  processElement,
  onDataChange,
}: UseDataObjectsProps) => {
  const [dataObjects, setDataObjects] = useState<DataObjectItem[]>([]);

  const {
    updateModdleProperties,
    createModdleElement,
    createShape,
    removeElements,
    findElements,
    getElementById,
  } = useModelerUpdate({ modeler, modelerVersion });

  const loadDataObjects = useCallback(() => {
    if (!processElement || !modeler) {
      setDataObjects([]);
      return;
    }
    const objects = findElements((el: any) => {
      const bo = getBusinessObject(el);
      return (
        (bo?.$type === 'bpmn:DataObject' ||
          bo?.$type === 'flowable:DataObject') &&
        bo.$parent?.id === processElement.id
      );
    }).map((el: any) => {
      const bo = getBusinessObject(el) as ModdleElement;
      const extensionElements = bo.extensionElements as ModdleElement;
      const itemValue = (extensionElements?.values || [{ text: '' }])[0] || {
        text: '',
      };

      return {
        id: el.id || '',
        name: bo.name || '',
        itemSubjectRef: bo.itemSubjectRef || '',
        value: itemValue?.text || '',
      };
    });

    setDataObjects(objects);
    if (onDataChange) {
      onDataChange(objects.length);
    }
  }, [processElement, modeler, modelerVersion, onDataChange]);

  useEffect(() => {
    loadDataObjects();
  }, [loadDataObjects]);

  useEffect(() => {
    if (!modeler) return;

    const eventBus = modeler.get('eventBus') as any;
    const handler = () => {
      loadDataObjects();
    };

    eventBus.on('elements.changed', handler);
    eventBus.on('shape.added', handler);
    eventBus.on('shape.removed', handler);

    return () => {
      eventBus.off('elements.changed', handler);
      eventBus.off('shape.added', handler);
      eventBus.off('shape.removed', handler);
    };
  }, [modeler, loadDataObjects]);

  const updateDataObject = useCallback(
    (item: DataObjectItem, isNew: boolean) => {
      if (!processElement) return;
      console.log(item, isNew);
      if (!isNew) {
        const existingElement = getElementById(item.id);
        if (existingElement) {
          const props: Record<string, any> = {
            name: item.name,
            itemSubjectRef: item.itemSubjectRef || '',
          };
          updateModdleProperties(
            existingElement,
            getBusinessObject(existingElement),
            props,
          );

          const bo = getBusinessObject(existingElement) as ModdleElement;
          const extensionElements = bo.extensionElements as ModdleElement;
          const valueElements = extensionElements?.values || [];

          if (item.value) {
            if (valueElements.length > 0) {
              updateModdleProperties(existingElement, valueElements[0], {
                text: item.value,
              });
            } else {
              const newExtElements =
                extensionElements ||
                createModdleElement('bpmn:ExtensionElements');
              const newValue = createModdleElement('flowable:Value', {
                text: item.value,
              });

              if (newExtElements && newValue) {
                newExtElements.values = [
                  ...(newExtElements.values || []),
                  newValue,
                ];
                updateModdleProperties(
                  existingElement,
                  getBusinessObject(existingElement),
                  { extensionElements: newExtElements },
                );
              }
            }
          } else if (valueElements.length > 0 && extensionElements) {
            extensionElements.values = (extensionElements.values || []).filter(
              (el: any) => el.$type !== 'flowable:Value',
            );
            updateModdleProperties(
              existingElement,
              getBusinessObject(existingElement),
              { extensionElements },
            );
          }
        }
      } else {
        const props: Record<string, any> = {
          id: item.id,
          name: item.name,
          itemSubjectRef: item.itemSubjectRef || '',
        };

        const moddleItem = createModdleElement('flowable:DataObject', props);

        if (moddleItem) {
          if (item.value) {
            const valueElement = createModdleElement('flowable:Value');
            if (valueElement) {
              valueElement.text = item.value;
            }

            const extElements = createModdleElement('bpmn:ExtensionElements');
            if (valueElement && extElements) {
              extElements.values = [valueElement];
              moddleItem.extensionElements = extElements;
            }
          }

          createShape(
            { type: 'bpmn:DataObject', businessObject: moddleItem },
            { x: 100, y: 100 },
            processElement,
          );
        }
      }
    },
    [
      processElement,
      modeler,
      updateModdleProperties,
      createModdleElement,
      createShape,
    ],
  );

  const addDataObject = useCallback(
    (item: Omit<DataObjectItem, 'id'>) => {
      updateDataObject({ ...item, id: generateId('DataObject') }, true);
    },
    [updateDataObject],
  );

  const editDataObject = useCallback(
    (item: DataObjectItem) => {
      updateDataObject(item, false);
    },
    [updateDataObject],
  );

  const deleteDataObject = useCallback(
    (id: string) => {
      const element = (modeler.get('elementRegistry') as any).get(id);
      if (element) {
        removeElements([element]);
      }
    },
    [modeler, removeElements],
  );

  return {
    dataObjects,
    addDataObject,
    editDataObject,
    deleteDataObject,
  };
};

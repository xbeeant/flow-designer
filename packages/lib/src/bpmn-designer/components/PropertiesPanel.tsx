import { Collapse, Tag } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Settings2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';
import type { BpmnForm } from '../types.ts';
import { getElementTypeColor, getElementTypeLabel } from '../util/element-type';
import {
  buildElementBasicItems,
  buildProcessPanelItems,
  type PanelItem,
} from './panel-items';

function getConnections(selectedElement: ModdleElement) {
  if (!selectedElement) {
    return { incoming: [], outgoing: [] };
  }

  return {
    incoming: selectedElement.incoming || [],
    outgoing: selectedElement.outgoing || [],
  };
}

const DIRECT_PROPS = new Set(['id', 'name', 'isExecutable']);
const MODDLE_PROPS = new Set([
  'candidateStarterUsers',
  'candidateStarterGroups',
]);

interface PropertiesPanelProps {
  modeler: Modeler;
  selectedElement: ModdleElement;
  processElement: ModdleElement;
  modelerVersion?: number;
  forms: BpmnForm;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  modeler,
  selectedElement,
  processElement,
  modelerVersion,
  forms,
}) => {
  const { updateProperties, updateModdleProperties, createModdleElement } =
    useModelerUpdate({ modeler, modelerVersion });

  const [currentItem, setCurrentItem] = useState({
    id: '',
    color: '',
    type: '',
    businessObject: {},
  });

  const [displayItems, setDisplayItems] = useState<PanelItem[]>([]);

  const updateProperty = useCallback(
    (property: string, value: string | boolean) => {
      const targetElement = selectedElement || processElement;
      if (!targetElement) return;
      const businessObject = getBusinessObject(targetElement);

      if (property === 'documentation') {
        const newDocumentation = createModdleElement('bpmn:Documentation', {
          text: value as string,
        });
        if (newDocumentation) {
          updateModdleProperties(targetElement, businessObject, {
            documentation: [newDocumentation],
          });
        }
        return;
      }

      if (DIRECT_PROPS.has(property)) {
        updateProperties(targetElement, { [property]: value });
        return;
      }

      if (MODDLE_PROPS.has(property)) {
        updateModdleProperties(targetElement, businessObject, {
          [property]: value,
        });
      }
    },
    [
      updateProperties,
      updateModdleProperties,
      createModdleElement,
      selectedElement,
      processElement,
    ],
  );

  useEffect(() => {
    if (!selectedElement && !processElement) {
      setCurrentItem({ id: '', color: '', type: '', businessObject: {} });
      setDisplayItems([]);
      return;
    }

    const { incoming, outgoing } = getConnections(selectedElement);
    const isProcessSelected = !selectedElement && processElement;

    const panelCtx = {
      modeler,
      modelerVersion,
      selectedElement,
      processElement,
      onPropertyChange: updateProperty,
      forms,
    };

    const elPropertiesPanels = isProcessSelected
      ? buildProcessPanelItems(panelCtx)
      : selectedElement
        ? buildElementBasicItems(panelCtx, incoming, outgoing)
        : [];
    const processBo = getBusinessObject(processElement);
    const selectedBo = getBusinessObject(selectedElement);

    const currentId = isProcessSelected ? processBo?.id : selectedBo?.id;
    const currentType = isProcessSelected
      ? 'bpmn:Process'
      : (selectedBo.$type ?? '');
    const currentBusinessObject = isProcessSelected ? processBo : selectedBo;
    const currentColor = getElementTypeColor(
      currentType,
      currentBusinessObject,
    );

    setCurrentItem({
      id: currentId,
      type: currentType,
      color: currentColor,
      businessObject: currentBusinessObject,
    });

    setDisplayItems(elPropertiesPanels || []);
  }, [
    selectedElement,
    processElement,
    updateProperty,
    modeler,
    modelerVersion,
    forms,
  ]);

  return (
    <div className='flex flex-col h-full flow-properties-panel'>
      <div
        className='px-4 py-3 border-b border-gray-100 bg-linear-to-r from-sl;
ae-50 to-gray-50 flex items-center justify-between shrink-0'
      >
        <div className='flex items-center gap-2 min-w-0'>
          {selectedElement || processElement ? (
            <>
              <span
                className='w-2 h-2 rounded-full shrink-0'
                style={{ backgroundColor: currentItem.color }}
              />
              <Tag
                color={currentItem.color}
                className='text-xs px-2 py-0.5 shrink-0 font-medium'
              >
                {getElementTypeLabel(
                  currentItem.type,
                  currentItem.businessObject,
                )}
              </Tag>
              <span className='text-xs text-gray-500 truncate font-medium'>
                {currentItem.id}
              </span>
            </>
          ) : (
            <span className='flex items-center gap-2 text-xs text-gray-400'>
              <Settings2 className='flow-icon-panel' />
              属性面板
            </span>
          )}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto flow-designer-scrollbar'>
        <Collapse
          items={displayItems}
          defaultActiveKey={['process-basic']}
          bordered={false}
          size='small'
          className='p-3'
          ghost
        />
      </div>
    </div>
  );
};

export default PropertiesPanel;

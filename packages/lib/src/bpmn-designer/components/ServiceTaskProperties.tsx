import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Settings2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';
import {
  CamelTaskConfig,
  DmnTaskConfig,
  EmailTaskConfig,
  ExternalWorkerTaskConfig,
  HttpTaskConfig,
  MuleTaskConfig,
  ServiceTaskBasic,
  ServiceTaskExecution,
  ServiceTaskFields,
  ShellTaskConfig,
  TaskTypeConfig,
} from './service-task';

interface ServiceTaskPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const ServiceTaskProperties: React.FC<ServiceTaskPropertiesProps> = ({
  modeler,
  element,
}) => {
  const [taskType, setTaskType] = useState('');
  const { updateModdleProperties, createModdleElement } = useModelerUpdate({
    modeler,
  });

  useEffect(() => {
    if (element) {
      const businessObject = getBusinessObject(element);
      const taskType =
        businessObject.type ||
        businessObject.get?.('flowable:type') ||
        'normal';
      console.log(
        '[service task]',
        element,
        businessObject.type,
        businessObject.get?.('type'),
      );
      setTaskType(taskType);
    } else {
      setTaskType('normal');
    }
  }, [element]);

  const handleValue = (key: string, value: boolean | string) => {
    if (!element) return;
    console.log(key, value);
    const businessObject = getBusinessObject(element);
    updateModdleProperties(element, businessObject, { [key]: value });
  };

  const handleTaskSpecificUpdate = (key: string, value: any) => {
    if (!element) return;
    const businessObject = getBusinessObject(element);

    let extensionElements = businessObject.extensionElements;
    if (!extensionElements) {
      extensionElements = createModdleElement('bpmn:ExtensionElements');
    }

    const existingElements = extensionElements.values || [];
    const fieldValue = typeof value === 'boolean' ? String(value) : value;

    const filteredElements = existingElements.filter(
      (el: any) => !(el.$type === 'flowable:Field' && el.name === key),
    );

    if (fieldValue !== '' && fieldValue !== undefined) {
      const newField = createModdleElement('flowable:Field', {
        name: key,
        string: fieldValue,
      });
      filteredElements.push(newField);
    }

    extensionElements.values = filteredElements;
    updateModdleProperties(element, businessObject, { extensionElements });
  };

  console.log('[service task]', taskType, element);

  const renderTaskConfig = () => {
    switch (taskType) {
      case 'http':
        return (
          <HttpTaskConfig
            key={`http-${element?.id}`}
            element={element}
            onUpdate={handleTaskSpecificUpdate}
          />
        );
      case 'email':
        return (
          <EmailTaskConfig
            key={`email-${element?.id}`}
            element={element}
            onUpdate={handleTaskSpecificUpdate}
          />
        );
      case 'shell':
        return (
          <ShellTaskConfig
            key={`shell-${element?.id}`}
            element={element}
            onUpdate={handleTaskSpecificUpdate}
          />
        );
      case 'external-worker':
        return (
          <ExternalWorkerTaskConfig
            key={`external-worker-${element?.id}`}
            element={element}
            onUpdate={handleTaskSpecificUpdate}
          />
        );
      case 'camel':
        return (
          <CamelTaskConfig
            key={`camel-${element?.id}`}
            element={element}
            onUpdate={handleTaskSpecificUpdate}
          />
        );
      case 'dmn':
        return (
          <DmnTaskConfig
            key={`dmn-${element?.id}`}
            element={element}
            onUpdate={handleTaskSpecificUpdate}
          />
        );
      case 'mule':
        return (
          <MuleTaskConfig
            key={`mule-${element?.id}`}
            element={element}
            onUpdate={handleTaskSpecificUpdate}
          />
        );
      default:
        return <ServiceTaskBasic element={element} onUpdate={handleValue} />;
    }
  };

  return (
    <div className='space-y-4'>
      <ServiceTaskExecution element={element} onUpdate={handleValue} />

      <TaskTypeConfig
        element={element}
        onUpdate={handleValue}
        onChange={setTaskType}
      />

      {renderTaskConfig()}

      <ServiceTaskFields
        element={element}
        moddle={modeler?.get('moddle') || null}
        createModdleElement={createModdleElement}
        updateModdleProperties={updateModdleProperties}
      />
    </div>
  );
};

export const ServiceTaskPropertiesPanel = {
  key: 'serviceTask',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <Settings2 className='flow-icon-panel' />
      服务任务配置
    </span>
  ),
};

export default ServiceTaskProperties;

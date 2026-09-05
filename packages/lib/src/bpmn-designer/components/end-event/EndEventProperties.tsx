import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getEventDefinition } from '../../util/bpmn-helper.ts';
import {
  CompensateEndEventConfig,
  ErrorEndEventConfig,
  EscalationEndEventConfig,
  MessageEndEventConfig,
  SignalEndEventConfig,
  TerminateEndEventConfig,
} from '.';

interface EndEventPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

export const EndEventPropertiesPanel = {
  id: 'endEvent',
  label: '结束事件配置',
  icon: AlertTriangle,
};

const EndEventProperties: React.FC<EndEventPropertiesProps> = ({
  modeler,
  element,
}) => {
  const [definitionType, setDefinitionType] = useState<string>('');
  const [eventDefinition, setEventDefinition] = useState<any>(null);

  useEffect(() => {
    if (!element) {
      setDefinitionType('');
      setEventDefinition(null);
      return;
    }

    const eventDefinition = getEventDefinition(element);

    if (eventDefinition) {
      setEventDefinition(eventDefinition);
      setDefinitionType(eventDefinition.$type);
    } else {
      setEventDefinition(null);
      setDefinitionType('');
    }
  }, [element]);

  const renderEventConfig = () => {
    console.log('[endEvent]', definitionType);

    switch (definitionType) {
      case 'bpmn:MessageEventDefinition':
        return (
          <MessageEndEventConfig
            key={`message-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:SignalEventDefinition':
        return (
          <SignalEndEventConfig
            key={`signal-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:ErrorEventDefinition':
        return (
          <ErrorEndEventConfig
            key={`error-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:EscalationEventDefinition':
        return (
          <EscalationEndEventConfig
            key={`escalation-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:CompensateEventDefinition':
        return (
          <CompensateEndEventConfig
            key={`compensate-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:TerminateEventDefinition':
        return (
          <TerminateEndEventConfig
            key={`terminate-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      default:
        return null;
    }
  };

  if (!definitionType) {
    return <div className='text-xs text-gray-400 py-2'>未配置结束事件定义</div>;
  }

  return <div className='py-2 space-y-3'>{renderEventConfig()}</div>;
};

export default EndEventProperties;

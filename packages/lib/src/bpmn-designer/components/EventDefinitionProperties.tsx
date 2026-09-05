import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { FileText, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getEventDefinition } from '../util/bpmn-helper.ts';
import {
  CompensateEventConfig,
  ConditionalEventConfig,
  ErrorEventConfig,
  EscalationEventConfig,
  MessageEventConfig,
  SignalEventConfig,
  TerminateEventConfig,
  TimerEventConfig,
  VariableListenerEventConfig,
} from './event-definition';

interface EventDefinitionPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

export const EventDefinitionPropertiesPanel = {
  id: 'eventDefinition',
  label: (
    <span className='flex items-center gap-2 text-gray-600 font-medium'>
      <FileText className='flow-icon-panel' />
      事件定义
    </span>
  ),
  icon: MessageSquare,
};

const EventDefinitionProperties: React.FC<EventDefinitionPropertiesProps> = ({
  modeler,
  element,
}) => {
  const [definitionType, setDefinitionType] = useState<string>('');
  const [eventDefinition, setEventDefinition] = useState<any>(null);
  console.log('[event definition]', element, definitionType);

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
    switch (definitionType) {
      case 'bpmn:SignalEventDefinition':
        return (
          <SignalEventConfig
            key={`signal-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:MessageEventDefinition':
        return (
          <MessageEventConfig
            key={`message-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:TimerEventDefinition':
        return (
          <TimerEventConfig
            key={`timer-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:ErrorEventDefinition':
        return (
          <ErrorEventConfig
            key={`error-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:ConditionalEventDefinition':
        return (
          <ConditionalEventConfig
            key={`conditional-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:CompensateEventDefinition':
        return (
          <CompensateEventConfig
            key={`compensate-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:EscalationEventDefinition':
        return (
          <EscalationEventConfig
            key={`escalation-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'bpmn:TerminateEventDefinition':
        return (
          <TerminateEventConfig
            key={`terminate-${element?.id}`}
            modeler={modeler}
            eventDefinition={eventDefinition}
            element={element}
          />
        );
      case 'flowable:VariableListenerEventDefinition':
        return (
          <VariableListenerEventConfig
            key={`variable-${element?.id}`}
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
    return <div className='text-xs text-gray-400 py-2'>未配置事件定义</div>;
  }

  return <div className='py-2 space-y-3'>{renderEventConfig()}</div>;
};

export default EventDefinitionProperties;

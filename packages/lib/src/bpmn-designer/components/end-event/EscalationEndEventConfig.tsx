import { ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { ArrowUp } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface EscalationEndEventConfigProps {
  modeler: Modeler;
  eventDefinition: ModdleElement;
  element: ModdleElement;
}

const EscalationEndEventConfig: React.FC<EscalationEndEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties, getDefinitions } = useModelerUpdate({
    modeler,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({ escalationRef: '' });
      return;
    }
    form.setFieldsValue({
      escalationRef: eventDefinition.get('escalationRef')?.id || '',
    });
  }, [eventDefinition, form]);

  useEffect(() => {
    const definitions = getDefinitions();
    if (!definitions) return;

    const rootElements = definitions.rootElements || [];
    const escalations = rootElements
      .filter((el: any) => el.$type === 'bpmn:Escalation')
      .map((el: any) => ({
        value: el.id || '',
        label: el.name || el.id || '',
      }));

    form.setFieldsValue({ escalationOptions: escalations });
  }, [getDefinitions, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;

    if (changedValues.escalationRef !== undefined) {
      const escalationId = changedValues.escalationRef;
      let escalationRef = null;
      if (escalationId) {
        const definitions = getDefinitions();
        const rootElements = definitions?.rootElements || [];
        escalationRef = rootElements.find(
          (el: any) => el.$type === 'bpmn:Escalation' && el.id === escalationId,
        );
      }
      updateModdleProperties(element, eventDefinition, { escalationRef });
    }
  };

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
      <ProFormText
        name='escalationRef'
        label='升级引用'
        placeholder='升级ID'
        fieldProps={{
          prefix: <ArrowUp className='flow-icon-button-sm text-gray-400' />,
        }}
      />
    </Form>
  );
};

export default EscalationEndEventConfig;

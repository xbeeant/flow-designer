import { ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import { ArrowUp } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface EscalationEventConfigProps {
  modeler: Modeler;
  eventDefinition: any;
  element: any;
}

const EscalationEventConfig: React.FC<EscalationEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({ escalationRef: '', escalationCodeVariable: '' });
      return;
    }
    form.setFieldsValue({
      escalationRef: eventDefinition.get('escalationRef')?.id || '',
      escalationCodeVariable:
        eventDefinition.get('escalationCodeVariable') || '',
    });
  }, [eventDefinition, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;
    updateModdleProperties(element, eventDefinition, changedValues);
  };

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
      <ProFormText
        name='escalationRef'
        label='升级引用'
        placeholder='升级ID'
        fieldProps={{
          prefix: <ArrowUp className='flow-icon-button-sm text-gray-400' />,
        }}
      />
      <ProFormText
        name='escalationCodeVariable'
        label='升级码变量'
        placeholder='变量名'
        fieldProps={{
          prefix: <ArrowUp className='flow-icon-button-sm text-gray-400' />,
        }}
      />
    </Form>
  );
};

export default EscalationEventConfig;

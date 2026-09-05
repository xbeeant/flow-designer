import { ProFormSwitch } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface TerminateEventConfigProps {
  modeler: Modeler;
  eventDefinition: any;
  element: any;
}

const TerminateEventConfig: React.FC<TerminateEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({ terminateAll: false });
      return;
    }
    form.setFieldsValue({
      terminateAll: eventDefinition.get('terminateAll') || false,
    });
  }, [eventDefinition, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;
    updateModdleProperties(element, eventDefinition, changedValues);
  };

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
      <ProFormSwitch name='terminateAll' label='终止全部' />
    </Form>
  );
};

export default TerminateEventConfig;

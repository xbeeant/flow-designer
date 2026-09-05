import { ProFormSwitch } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface TerminateEndEventConfigProps {
  modeler: Modeler;
  eventDefinition: ModdleElement;
  element: ModdleElement;
}

const TerminateEndEventConfig: React.FC<TerminateEndEventConfigProps> = ({
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
    <Form form={form} onValuesChange={handleValuesChange}>
      <ProFormSwitch name='terminateAll' label='终止全部' />
    </Form>
  );
};

export default TerminateEndEventConfig;

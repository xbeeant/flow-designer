import { ProFormTextArea } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface ConditionalEventConfigProps {
  modeler: Modeler;
  eventDefinition: any;
  element: any;
}

const ConditionalEventConfig: React.FC<ConditionalEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties, createModdleElement } = useModelerUpdate({
    modeler,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({ condition: '' });
      return;
    }
    form.setFieldsValue({
      condition: eventDefinition.get('condition')?.body || '',
    });
  }, [eventDefinition, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;

    if (changedValues.condition !== undefined) {
      let conditionExpression: any;
      if (changedValues.condition && changedValues.condition.trim() !== '') {
        conditionExpression = createModdleElement('bpmn:FormalExpression', {
          body: changedValues.condition,
        });
      }
      updateModdleProperties(element, eventDefinition, {
        condition: conditionExpression,
      });
    }
  };

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
      <ProFormTextArea
        name='condition'
        label='条件表达式'
        placeholder='如: ${variable > 100}'
        fieldProps={{ rows: 3 }}
      />
    </Form>
  );
};

export default ConditionalEventConfig;

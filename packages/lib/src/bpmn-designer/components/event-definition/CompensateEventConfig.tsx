import { ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface CompensateEventConfigProps {
  modeler: Modeler;
  eventDefinition: any;
  element: any;
}

const CompensateEventConfig: React.FC<CompensateEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateDesignElement, getDesignElement } = useModelerUpdate({
    modeler,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({ waitforcompletion: false, activityref: '' });
      return;
    }
    form.setFieldsValue({
      waitforcompletion: getDesignElement(eventDefinition, 'waitforcompletion'),
      activityref: getDesignElement(eventDefinition, 'activityref') || '',
    });
  }, [eventDefinition, form, getDesignElement]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;

    Object.keys(changedValues).forEach((key) => {
      updateDesignElement(element, eventDefinition, key, changedValues[key]);
    });
  };

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
      <ProFormSwitch name='waitforcompletion' label='等待完成' />
      <ProFormText
        name='activityref'
        label='活动引用'
        placeholder='活动ID'
        fieldProps={{
          prefix: <RefreshCw className='flow-icon-button-sm text-gray-400' />,
        }}
      />
    </Form>
  );
};

export default CompensateEventConfig;

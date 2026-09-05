import { ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import { Clock, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface TimerEventConfigProps {
  modeler: Modeler;
  eventDefinition: any;
  element: any;
}

const TimerEventConfig: React.FC<TimerEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({ timeDate: '', timeDuration: '', timeCycle: '' });
      return;
    }
    form.setFieldsValue({
      timeDate: eventDefinition.get('timeDate') || '',
      timeDuration: eventDefinition.get('timeDuration') || '',
      timeCycle: eventDefinition.get('timeCycle') || '',
    });
  }, [eventDefinition, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;
    updateModdleProperties(element, eventDefinition, changedValues);
  };

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
      <ProFormText
        name='timeDate'
        label='时间日期'
        placeholder='如: 2024-01-01T00:00:00'
        fieldProps={{
          prefix: <Clock className='flow-icon-button-sm text-gray-400' />,
        }}
      />
      <ProFormText
        name='timeDuration'
        label='持续时间'
        placeholder='如: PT1H (1小时)'
        fieldProps={{
          prefix: <Clock className='flow-icon-button-sm text-gray-400' />,
        }}
      />
      <ProFormText
        name='timeCycle'
        label='循环周期'
        placeholder='如: R5/PT1M (5次，每次1分钟)'
        fieldProps={{
          prefix: <RefreshCw className='flow-icon-button-sm text-gray-400' />,
        }}
      />
    </Form>
  );
};

export default TimerEventConfig;

import { ProFormSwitch } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Clock } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';

interface AsyncConfigProps {
  modeler: Modeler;
  element: ModdleElement;
}

const AsyncConfig: React.FC<AsyncConfigProps> = ({ modeler, element }) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        asyncBefore: false,
        asyncAfter: false,
        exclusive: true,
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    form.setFieldsValue({
      asyncBefore: !!businessObject.asyncBefore,
      asyncAfter: !!businessObject.asyncAfter,
      exclusive: businessObject.exclusive !== false,
    });
  }, [element, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element) return;
    const businessObject = getBusinessObject(element);
    updateModdleProperties(element, businessObject, changedValues);
  };

  return (
    <Form form={form} layout='inline' onValuesChange={handleValuesChange}>
      <ProFormSwitch
        name='asyncBefore'
        label='异步执行前'
        tooltip='在任务执行前异步处理'
      />
      <ProFormSwitch
        name='asyncAfter'
        label='异步执行后'
        tooltip='在任务执行后异步处理'
      />
      <ProFormSwitch
        name='exclusive'
        label='排他执行'
        tooltip='同一流程实例的任务串行执行'
      />
    </Form>
  );
};

export const AsyncConfigPanel = {
  key: 'async',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <Clock className='flow-icon-panel' />
      异步配置
    </span>
  ),
};

export default AsyncConfig;

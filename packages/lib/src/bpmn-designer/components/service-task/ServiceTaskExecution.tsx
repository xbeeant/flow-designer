import { ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import type React from 'react';
import { useEffect } from 'react';

interface ServiceTaskExecutionProps {
  element: ModdleElement;
  onUpdate: (key: string, value: boolean | string) => void;
}

const ServiceTaskExecution: React.FC<ServiceTaskExecutionProps> = ({
  element,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        async: false,
        triggerable: false,
        skipExpression: '',
        resultVariableName: '',
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    form.setFieldsValue({
      async: !!businessObject.async,
      triggerable: !!businessObject.triggerable,
      skipExpression: businessObject.skipExpression || '',
      resultVariableName: businessObject.resultVariableName || '',
    });
  }, [element, form]);

  return (
    <Form
      form={form}
      onValuesChange={(changedValues) => {
        Object.keys(changedValues).forEach((key) => {
          onUpdate(key, changedValues[key]);
        });
      }}
    >
      <ProFormSwitch label='异步' name='async' />
      <ProFormSwitch
        label='可触发'
        name='triggerable'
        tooltip='flowable:triggerable - 支持通过 trigger API 触发执行'
      />
      <ProFormText
        label='跳过表达式'
        name='skipExpression'
        placeholder='如: ${initiator == "admin"}'
        tooltip='flowable:skipExpression - 为 true 时跳过该任务'
      />
      <ProFormText
        label='结果变量'
        name='resultVariableName'
        placeholder='存储执行结果的变量名'
        tooltip='flowable:resultVariableName'
      />
    </Form>
  );
};

export default ServiceTaskExecution;

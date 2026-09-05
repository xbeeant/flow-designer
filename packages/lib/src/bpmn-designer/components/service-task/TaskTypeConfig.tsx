import { ProFormSelect } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import type React from 'react';
import { useEffect } from 'react';

interface TaskTypeConfigProps {
  element: ModdleElement;
  onUpdate: (key: string, value: string) => void;
  onChange: (value: string) => void;
}

const SERVICE_TASK_TYPES = [
  { value: 'normal', label: '普通服务任务' },
  { value: 'http', label: 'HTTP任务' },
  { value: 'email', label: '邮件任务' },
  { value: 'shell', label: 'Shell任务' },
  { value: 'external-worker', label: '外部任务' },
  { value: 'camel', label: 'Camel任务' },
  { value: 'dmn', label: '决策任务' },
  { value: 'mule', label: 'Mule任务' },
];

const TaskTypeConfig: React.FC<TaskTypeConfigProps> = ({
  element,
  onUpdate,
  onChange,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({ taskType: 'normal' });
      return;
    }

    const businessObject = getBusinessObject(element);
    const taskType =
      businessObject.type || businessObject.get?.('flowable:type') || 'normal';

    form.setFieldsValue({ taskType: taskType });
  }, [element, form.setFieldsValue]);

  return (
    <Form
      form={form}
      onValuesChange={(changedValues) => {
        const value = changedValues.taskType;
        onChange(value);
        onUpdate('type', value);
      }}
    >
      <ProFormSelect
        label={'任务类型'}
        name='taskType'
        options={SERVICE_TASK_TYPES}
        placeholder='选择任务类型'
        fieldProps={{
          size: 'small',
        }}
      />
    </Form>
  );
};

export default TaskTypeConfig;

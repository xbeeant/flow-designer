import { ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Users } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { getFieldMap } from '../../util/extension-elements';

interface ExternalWorkerTaskConfigProps {
  element: ModdleElement;
  onUpdate: (key: string, value: string) => void;
}

const ExternalWorkerTaskConfig: React.FC<ExternalWorkerTaskConfigProps> = ({
  element,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        topic: '',
        lockDuration: '',
        retries: '',
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    const extensionElements = businessObject.extensionElements;

    if (extensionElements && typeof extensionElements.get === 'function') {
      const fieldMap = getFieldMap(extensionElements);

      form.setFieldsValue({
        topic: fieldMap.topic || '',
        lockDuration: fieldMap.lockDuration || '',
        retries: fieldMap.retries || '',
      });
    }
  }, [element]);

  return (
    <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
      <div className='flex items-center px-4 py-2.5 bg-linear-to-r from-indigo-50 to-purple-50 border-b border-gray-100'>
        <div className='w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center text-white mr-2'>
          <Users className='flow-icon-panel' />
        </div>
        <span className='text-sm font-semibold text-gray-700'>
          外部任务配置
        </span>
      </div>
      <div className='p-1'>
        <Form
          labelCol={{ span: 6 }}
          onValuesChange={(changedValues) => {
            Object.keys(changedValues).forEach((key) => {
              onUpdate(key, changedValues[key]);
            });
          }}
        >
          <ProFormText label='Topic' name='topic' placeholder='任务主题' />
          <ProFormText
            label='锁定时长'
            name='lockDuration'
            placeholder='毫秒，如: 5000'
          />
          <ProFormText
            label='重试次数'
            name='retries'
            placeholder='重试次数，如: 3'
          />
        </Form>
      </div>
    </div>
  );
};

export default ExternalWorkerTaskConfig;

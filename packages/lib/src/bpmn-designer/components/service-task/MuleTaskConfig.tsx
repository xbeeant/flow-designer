import { ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Cloud } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { getFieldMap } from '../../util/extension-elements';

interface MuleTaskConfigProps {
  element: ModdleElement;
  onUpdate: (key: string, value: string) => void;
}

const MuleTaskConfig: React.FC<MuleTaskConfigProps> = ({
  element,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      return;
    }

    const businessObject = getBusinessObject(element);
    const extensionElements = businessObject.extensionElements;

    if (extensionElements && typeof extensionElements.get === 'function') {
      const fieldMap: Record<string, string> = getFieldMap(extensionElements);

      form.setFieldsValue(fieldMap);
    }
  }, [element]);

  return (
    <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
      <div className='flex items-center px-4 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100'>
        <div className='w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white mr-2'>
          <Cloud className='flow-icon-panel' />
        </div>
        <span className='text-sm font-semibold text-gray-700'>Mule配置</span>
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
          <ProFormText label='端点URL' name='endpointUrl' />
          <ProFormText label='语言' name='language' />
          <ProFormText label='表达式' name='payloadExpression' />
          <ProFormTextArea label='输出参数' name='resultVariable' />
        </Form>
      </div>
    </div>
  );
};

export default MuleTaskConfig;

import { ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Zap } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { getFieldMap } from '../../util/extension-elements';

interface CamelTaskConfigProps {
  element: ModdleElement;
  onUpdate: (key: string, value: string) => void;
}

const CamelTaskConfig: React.FC<CamelTaskConfigProps> = ({
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
      const fieldMap = getFieldMap(extensionElements);
      form.setFieldsValue(fieldMap);
    }
  }, [element]);

  return (
    <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
      <div className='flex items-center px-4 py-2.5 bg-linear-to-r from-orange-50 to-amber-50 border-b border-gray-100'>
        <div className='w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white mr-2'>
          <Zap className='flow-icon-panel' />
        </div>
        <span className='text-sm font-semibold text-gray-700'>Camel配置</span>
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
          <ProFormText label='类名' name='camelBehaviorClass' />
          <ProFormTextArea
            label='Body'
            name='camelContext'
            placeholder='消息体'
          />
        </Form>
      </div>
    </div>
  );
};

export default CamelTaskConfig;

import { ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Mail } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { getFieldMap } from '../../util/extension-elements';

interface EmailTaskConfigProps {
  element: ModdleElement;
  onUpdate: (key: string, value: string) => void;
}

const EmailTaskConfig: React.FC<EmailTaskConfigProps> = ({
  element,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        to: '',
        from: '',
        cc: '',
        subject: '',
        html: '',
      });
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
      <div className='flex items-center px-4 py-2.5 bg-linear-to-r from-blue-50 to-cyan-50 border-b border-gray-100'>
        <div className='w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white mr-2'>
          <Mail className='flow-icon-panel' />
        </div>
        <span className='text-sm font-semibold text-gray-700'>邮件配置</span>
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
          <ProFormText
            label='收件人'
            name='to'
            placeholder='user@example.com'
          />
          <ProFormText
            label='发件人'
            name='from'
            placeholder='noreply@example.com'
          />
          <ProFormText label='抄送人' name='cc' />
          <ProFormText label='主题' name='subject' placeholder='邮件主题' />
          <ProFormTextArea label='正文内容' name='html' />
        </Form>
      </div>
    </div>
  );
};

export default EmailTaskConfig;

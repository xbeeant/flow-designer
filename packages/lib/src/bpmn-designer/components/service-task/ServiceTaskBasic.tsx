import {
  ProFormDependency,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Code } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';

interface ServiceTaskBasicProps {
  element: ModdleElement;
  onUpdate: (key: string, value: string) => void;
}

const ServiceTaskBasic: React.FC<ServiceTaskBasicProps> = ({
  element,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      return;
    }

    const businessObject = getBusinessObject(element);

    if (businessObject.class) {
      form.setFieldsValue({ clasz: 'class' });
    } else if (businessObject.expression) {
      form.setFieldsValue({ clasz: 'expression' });
    } else if (businessObject.delegateExpression) {
      form.setFieldsValue({ clasz: 'delegateExpression' });
    }
  }, [element]);

  return (
    <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
      <div className='flex items-center px-4 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100'>
        <div className='w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white mr-2'>
          <Code className='flow-icon-panel' />
        </div>
        <span className='text-sm font-semibold text-gray-700'>执行配置</span>
      </div>
      <div className='p-4 space-y-3'>
        <Form
          form={form}
          layout={'horizontal'}
          labelCol={{ span: 4 }}
          onValuesChange={(changedValues) => {
            Object.keys(changedValues).forEach((key) => {
              onUpdate(key, changedValues[key]);
            });
          }}
        >
          <ProFormRadio.Group
            label='类型'
            name={'clasz'}
            rules={[{ required: true }]}
            options={[
              { label: 'Java类', value: 'class' },
              { label: '表达式', value: 'expression' },
              { label: '代理表达式', value: 'delegateExpression' },
            ]}
          />
          <ProFormDependency name={['clasz']}>
            {({ clasz }) => {
              switch (clasz) {
                case 'class':
                  return (
                    <ProFormText
                      label='类名'
                      rules={[{ required: true }]}
                      name='className'
                      placeholder='Java类全限定名'
                    />
                  );
                case 'expression': {
                  return (
                    <>
                      <ProFormText
                        label='表达式'
                        rules={[{ required: true }]}
                        name='expression'
                        placeholder='如: ${myBean.method()}'
                      />
                      <ProFormText
                        label='结果变量'
                        rules={[{ required: true }]}
                        name='resultVariable'
                        placeholder='存储结果的变量名'
                      />
                    </>
                  );
                }
                case 'delegateExpression':
                  return (
                    <ProFormText
                      label='代理表达式'
                      rules={[{ required: true }]}
                      name='delegateExpression'
                      placeholder='如: ${myDelegateBean}'
                    />
                  );
              }
            }}
          </ProFormDependency>
        </Form>
      </div>
    </div>
  );
};

export default ServiceTaskBasic;

import { ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Terminal } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { getFieldMap } from '../../util/extension-elements';
import ArgumentsList from './ArgumentsList';

interface ShellTaskConfigProps {
  element: ModdleElement;
  onUpdate: (key: string, value: string) => void;
}

interface ArgumentItem {
  name: string;
  value: string;
}

const ShellTaskConfig: React.FC<ShellTaskConfigProps> = ({
  element,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        command: '',
        arguments: [{ name: '', value: '' }],
        directory: '',
        errorCodeVariable: '',
        outputVariable: '',
        wait: false,
        cleanEnv: false,
        redirectError: false,
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    const extensionElements = businessObject.extensionElements;

    if (extensionElements && typeof extensionElements.get === 'function') {
      const fieldMap = getFieldMap(extensionElements);
      const args: ArgumentItem[] = [];
      Object.keys(fieldMap).forEach((key) => {
        if (key.startsWith('arg_')) {
          args.push({ name: key.replace('arg_', ''), value: fieldMap[key] });
        }
      });
      if (args.length === 0) {
        args.push({ name: '', value: '' });
      }

      form.setFieldsValue({
        command: fieldMap.command || '',
        arguments: args,
        directory: fieldMap.directory || '',
        errorCodeVariable: fieldMap.errorCodeVariable || '',
        outputVariable: fieldMap.outputVariable || '',
        wait: fieldMap.wait === 'true',
        cleanEnv: fieldMap.cleanEnv === 'true',
        redirectError: fieldMap.redirectError === 'true',
      });
    }
  }, [element]);

  return (
    <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
      <div className='flex items-center px-4 py-2.5 bg-linear-to-r from-blue-50 to-cyan-50 border-b border-gray-100'>
        <div className='w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white mr-2'>
          <Terminal className='flow-icon-panel' />
        </div>
        <span className='text-sm font-semibold text-gray-700'>Shell配置</span>
      </div>
      <div className='p-1'>
        <Form
          form={form}
          labelCol={{ span: 6 }}
          onValuesChange={(changedValues) => {
            Object.keys(changedValues).forEach((key) => {
              if (key !== 'arguments') {
                onUpdate(key, changedValues[key]);
              }
            });
          }}
        >
          <ProFormText
            label='命令'
            name='command'
            placeholder='bash, python, etc.'
          />
          <ArgumentsList name='arguments' label='参数' onUpdate={onUpdate} />
          <ProFormText label='异常变量' name='errorCodeVariable' />
          <ProFormText label='输出变量' name='outputVariable' />
          <ProFormText
            label='工作目录'
            name='directory'
            placeholder='/path/to/directory'
          />
          <ProFormCheckbox label='等待终端执行完成' name='wait' />
          <ProFormCheckbox label='清除环境变量' name='cleanEnv' />
          <ProFormCheckbox label='遇错返回' name='redirectError' />
        </Form>
      </div>
    </div>
  );
};

export default ShellTaskConfig;

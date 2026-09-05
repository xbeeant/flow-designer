import {
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Code2, Database, FileCode } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';

interface ScriptTaskPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const SCRIPT_FORMATS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'groovy', label: 'Groovy' },
  { value: 'python', label: 'Python' },
  { value: 'ruby', label: 'Ruby' },
];

const ScriptTaskProperties: React.FC<ScriptTaskPropertiesProps> = ({
  modeler,
  element,
}) => {
  const { updateModdleProperties, createModdleElement } = useModelerUpdate({
    modeler,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element || !modeler) {
      form.setFieldsValue({
        scriptFormat: 'javascript',
        script: '',
        resultVariable: '',
        autoStoreVariables: false,
        resource: '',
        skipExpression: '',
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    const scriptElements = businessObject.script || [];
    let scriptText = '';
    if (Array.isArray(scriptElements) && scriptElements.length > 0) {
      scriptText = scriptElements[0].text || '';
    } else if (typeof scriptElements === 'object' && scriptElements.text) {
      scriptText = scriptElements.text || '';
    }

    form.setFieldsValue({
      scriptFormat: businessObject.scriptFormat || 'javascript',
      script: scriptText,
      resultVariable: businessObject.resultVariable || '',
      autoStoreVariables: !!businessObject.autoStoreVariables,
      resource: businessObject.resource || '',
      skipExpression: businessObject.skipExpression || '',
    });
  }, [element, modeler, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !modeler) return;

    const businessObject = getBusinessObject(element);

    const propsToUpdate: Record<string, any> = {};

    if (changedValues.script !== undefined) {
      const scriptElement = createModdleElement('bpmn:Script', {
        text: changedValues.script,
      });
      updateModdleProperties(element, businessObject, {
        script: [scriptElement],
      });
    }

    if (changedValues.scriptFormat !== undefined) {
      propsToUpdate.scriptFormat = changedValues.scriptFormat;
    }
    if (changedValues.resultVariable !== undefined) {
      propsToUpdate.resultVariable = changedValues.resultVariable;
    }
    if (changedValues.autoStoreVariables !== undefined) {
      propsToUpdate.autoStoreVariables = changedValues.autoStoreVariables;
    }
    if (changedValues.resource !== undefined) {
      propsToUpdate.resource = changedValues.resource;
    }
    if (changedValues.skipExpression !== undefined) {
      propsToUpdate.skipExpression = changedValues.skipExpression;
    }

    if (Object.keys(propsToUpdate).length > 0) {
      updateModdleProperties(element, businessObject, propsToUpdate);
    }
  };

  return (
    <div className='space-y-3'>
      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100'>
          <Code2 className='flow-icon-panel text-blue-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>脚本配置</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormSelect
              name='scriptFormat'
              label='脚本语言'
              options={SCRIPT_FORMATS}
            />
            <ProFormTextArea
              name='script'
              label='脚本内容'
              placeholder="// 在此编写脚本\nconsole.log('Hello World');"
              fieldProps={{
                rows: 6,
                className: 'font-mono text-sm resize-none',
              }}
            />
          </Form>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-green-50 to-emerald-50 border-b border-gray-100'>
          <Database className='flow-icon-panel text-green-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>变量配置</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormText
              name='resultVariable'
              label='结果变量 (flowable:resultVariable)'
              placeholder='存储脚本执行结果的变量名'
            />
            <ProFormSwitch
              name='autoStoreVariables'
              label='自动存储变量 (autoStoreVariables)'
            />
            <ProFormText
              name='skipExpression'
              label='跳过表达式 (skipExpression)'
              placeholder='如: ${initiator == "admin"}'
            />
          </Form>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-orange-50 to-amber-50 border-b border-gray-100'>
          <FileCode className='flow-icon-panel text-orange-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>资源配置</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormText
              name='resource'
              label='外部资源'
              placeholder='脚本文件路径（classpath）'
            />
          </Form>
        </div>
      </div>
    </div>
  );
};

export const ScriptTaskPropertiesPanel = {
  key: 'scriptTask',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <Code2 className='flow-icon-panel' />
      脚本任务配置
    </span>
  ),
};

export default ScriptTaskProperties;

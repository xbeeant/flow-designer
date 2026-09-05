import {
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Database, Key, Link2, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useCallActivityParams } from '../hooks/useCallActivityParams';
import { useModelerUpdate } from '../hooks/useModelerUpdate';
import InOutParamsEditor from './service-task/InOutParamsEditor';

interface CallActivityPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const CALLED_ELEMENT_TYPES = [
  { value: 'key', label: '流程Key' },
  { value: 'id', label: '流程ID' },
];

const CallActivityProperties: React.FC<CallActivityPropertiesProps> = ({
  modeler,
  element,
}) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const { inParams, outParams, updateIn, updateOut } = useCallActivityParams({
    modeler,
    element,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element || !modeler) {
      form.setFieldsValue({
        calledElementType: 'key',
        calledElement: '',
        inheritVariables: false,
        inheritBusinessKey: false,
        sameDeployment: false,
        processInstanceName: '',
        idVariableName: '',
        businessKey: '',
        useLocalScopeForOutParameters: false,
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    form.setFieldsValue({
      calledElementType: businessObject.calledElementType || 'key',
      calledElement: businessObject.calledElement || '',
      inheritVariables: !!businessObject.inheritVariables,
      inheritBusinessKey: !!businessObject.inheritBusinessKey,
      sameDeployment: !!businessObject.sameDeployment,
      processInstanceName: businessObject.processInstanceName || '',
      idVariableName: businessObject.idVariableName || '',
      businessKey: businessObject.businessKey || '',
      useLocalScopeForOutParameters:
        !!businessObject.useLocalScopeForOutParameters,
    });
  }, [element, modeler, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element) return;
    const businessObject = getBusinessObject(element);
    updateModdleProperties(element, businessObject, changedValues);
  };

  return (
    <div className='space-y-3'>
      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100'>
          <Link2 className='flow-icon-panel text-blue-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>调用配置</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormText
              name='calledElement'
              label='被调用元素'
              placeholder='流程Key或ID'
            />
            <ProFormSelect
              name='calledElementType'
              label='元素类型'
              options={CALLED_ELEMENT_TYPES}
            />
          </Form>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-green-50 to-emerald-50 border-b border-gray-100'>
          <RefreshCw className='flow-icon-panel text-green-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>继承配置</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormSwitch name='inheritVariables' label='继承变量' />
            <ProFormSwitch name='inheritBusinessKey' label='继承业务Key' />
            <ProFormSwitch name='sameDeployment' label='相同部署' />
          </Form>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-orange-50 to-amber-50 border-b border-gray-100'>
          <Key className='flow-icon-panel text-orange-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>变量配置</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormText
              name='processInstanceName'
              label='流程实例名'
              placeholder='子流程实例名称'
            />
            <ProFormText
              name='idVariableName'
              label='ID变量'
              placeholder='存储子流程ID的变量名'
            />
            <ProFormText
              name='businessKey'
              label='业务Key'
              placeholder='子流程业务Key'
            />
          </Form>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-purple-50 to-violet-50 border-b border-gray-100'>
          <Database className='flow-icon-panel text-purple-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>参数配置</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormSwitch
              name='useLocalScopeForOutParameters'
              label='输出参数使用本地作用域'
            />
          </Form>
        </div>
      </div>

      <InOutParamsEditor
        title='入参映射'
        params={inParams}
        onChange={updateIn}
      />
      <InOutParamsEditor
        title='出参映射'
        params={outParams}
        onChange={updateOut}
      />
    </div>
  );
};

export const CallActivityPropertiesPanel = {
  key: 'callActivity',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <Link2 className='flow-icon-panel' />
      调用活动配置
    </span>
  ),
};

export default CallActivityProperties;

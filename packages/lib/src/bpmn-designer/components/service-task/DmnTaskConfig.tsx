import { ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Database } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { getFieldMap } from '../../util/extension-elements';

interface DmnTaskConfigProps {
  element: ModdleElement;
  onUpdate: (key: string, value: string) => void;
}

const DmnTaskConfig: React.FC<DmnTaskConfigProps> = ({ element, onUpdate }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        decisionRef: '',
        decisionRefBinding: '',
        mapDecisionResult: '',
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    const extensionElements = businessObject.extensionElements;

    if (extensionElements && typeof extensionElements.get === 'function') {
      const fieldMap = getFieldMap(extensionElements);
      form.setFieldsValue({
        decisionRef: fieldMap.decisionRef || '',
        decisionRefBinding: fieldMap.decisionRefBinding || '',
        mapDecisionResult: fieldMap.mapDecisionResult || '',
      });
    }
  }, [element]);

  return (
    <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
      <div className='flex items-center px-4 py-2.5 bg-linear-to-r from-green-50 to-emerald-50 border-b border-gray-100'>
        <div className='w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white mr-2'>
          <Database className='flow-icon-panel' />
        </div>
        <span className='text-sm font-semibold text-gray-700'>
          决策任务配置
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
          <ProFormText label='决策表ID' name='decisionTableReferenceKey' />
          <ProFormText label='输出变量名' name='outputVariableName' />
          <ProFormCheckbox label='sameDeployment' name='sameDeployment' />
          <ProFormCheckbox
            label='fallbackToDefaultTenant'
            name='fallbackToDefaultTenant'
          />
          <ProFormCheckbox
            label='decisionTaskThrowErrorOnNoHits'
            name='decisionTaskThrowErrorOnNoHits'
          />
        </Form>
      </div>
    </div>
  );
};

export default DmnTaskConfig;

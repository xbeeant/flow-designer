import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { GitBranch, Layers, Tag } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';

interface BusinessRuleTaskPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const DECISION_BINDINGS = [
  { value: 'latest', label: '最新版本' },
  { value: 'deployed', label: '已部署版本' },
  { value: 'version', label: '指定版本' },
];

const DECISION_RESULTS = [
  { value: '', label: '默认' },
  { value: 'singleEntry', label: '单条记录' },
  { value: 'singleResult', label: '单条结果' },
  { value: 'collectEntries', label: '收集记录' },
  { value: 'collectResults', label: '收集结果' },
];

const BusinessRuleTaskProperties: React.FC<BusinessRuleTaskPropertiesProps> = ({
  modeler,
  element,
}) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        decisionRef: '',
        decisionRefBinding: 'latest',
        decisionRefVersion: '',
        mapDecisionResult: '',
        decisionRefTenantId: '',
        resultVariableName: '',
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    form.setFieldsValue({
      decisionRef: businessObject.decisionRef || '',
      decisionRefBinding: businessObject.decisionRefBinding || 'latest',
      decisionRefVersion: businessObject.decisionRefVersion || '',
      mapDecisionResult: businessObject.mapDecisionResult || '',
      decisionRefTenantId: businessObject.decisionRefTenantId || '',
      resultVariableName: businessObject.resultVariableName || '',
    });
  }, [element, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element) return;
    const businessObject = getBusinessObject(element);
    updateModdleProperties(element, businessObject, changedValues);
  };

  const decisionRefBinding = form.getFieldValue('decisionRefBinding');

  return (
    <div className='space-y-3'>
      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100'>
          <GitBranch className='flow-icon-panel text-blue-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>决策引用</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormText
              name='decisionRef'
              label='决策Key'
              placeholder='决策表的Key'
            />
            <ProFormSelect
              name='decisionRefBinding'
              label='绑定方式'
              options={DECISION_BINDINGS}
            />
            {decisionRefBinding === 'version' && (
              <ProFormText
                name='decisionRefVersion'
                label='版本号'
                placeholder='指定版本号'
              />
            )}
          </Form>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-green-50 to-emerald-50 border-b border-gray-100'>
          <Layers className='flow-icon-panel text-green-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>结果映射</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormSelect
              name='mapDecisionResult'
              label='结果映射'
              options={DECISION_RESULTS}
              placeholder='选择结果映射方式'
            />
            <ProFormText
              name='resultVariableName'
              label='结果变量'
              placeholder='存储决策结果的变量名'
            />
          </Form>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
        <div className='flex items-center px-3 py-2 bg-linear-to-r from-purple-50 to-violet-50 border-b border-gray-100'>
          <Tag className='flow-icon-panel text-purple-500 mr-1.5' />
          <span className='text-sm font-medium text-gray-700'>租户配置</span>
        </div>
        <div className='p-3'>
          <Form
            form={form}
            layout='vertical'
            onValuesChange={handleValuesChange}
          >
            <ProFormText
              name='decisionRefTenantId'
              label='租户ID'
              placeholder='多租户环境下的租户标识'
            />
          </Form>
        </div>
      </div>
    </div>
  );
};

export const BusinessRuleTaskPropertiesPanel = {
  key: 'businessRuleTask',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <GitBranch className='flow-icon-panel' />
      业务规则配置
    </span>
  ),
};

export default BusinessRuleTaskProperties;

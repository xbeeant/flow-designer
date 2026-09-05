import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import { Database } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface VariableListenerEventConfigProps {
  modeler: Modeler;
  eventDefinition: any;
  element: any;
}

const VARIABLE_CHANGE_OPTIONS = [
  { value: '', label: '任意变化' },
  { value: 'create', label: '创建' },
  { value: 'update', label: '更新' },
  { value: 'delete', label: '删除' },
];

const VariableListenerEventConfig: React.FC<
  VariableListenerEventConfigProps
> = ({ modeler, eventDefinition, element }) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({ variableName: '', variableChangeType: '' });
      return;
    }
    form.setFieldsValue({
      variableName: eventDefinition.get('variableName') || '',
      variableChangeType: eventDefinition.get('variableChangeType') || '',
    });
  }, [eventDefinition, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;
    updateModdleProperties(element, eventDefinition, changedValues);
  };

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
      <ProFormText
        name='variableName'
        label='变量名'
        placeholder='变量名'
        fieldProps={{
          prefix: <Database className='flow-icon-button-sm text-gray-400' />,
        }}
      />
      <ProFormSelect
        name='variableChangeType'
        label='变量变化类型'
        options={VARIABLE_CHANGE_OPTIONS}
        placeholder='选择变化类型'
      />
    </Form>
  );
};

export default VariableListenerEventConfig;

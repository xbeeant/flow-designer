import { ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import { AlertTriangle, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface ErrorEventConfigProps {
  modeler: Modeler;
  eventDefinition: any;
  element: any;
}

const ErrorEventConfig: React.FC<ErrorEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({
        errorRef: '',
        errorCodeVariable: '',
        errorMessageVariable: '',
      });
      return;
    }
    form.setFieldsValue({
      errorRef: eventDefinition.get('errorRef')?.id || '',
      errorCodeVariable: eventDefinition.get('errorCodeVariable') || '',
      errorMessageVariable: eventDefinition.get('errorMessageVariable') || '',
    });
  }, [eventDefinition, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;
    updateModdleProperties(element, eventDefinition, changedValues);
  };

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
      <ProFormText
        name='errorRef'
        label='错误引用'
        placeholder='错误ID'
        fieldProps={{
          prefix: <XCircle className='flow-icon-button-sm text-gray-400' />,
        }}
      />
      <ProFormText
        name='errorCodeVariable'
        label='错误码变量'
        placeholder='变量名'
        fieldProps={{
          prefix: (
            <AlertTriangle className='flow-icon-button-sm text-gray-400' />
          ),
        }}
      />
      <ProFormText
        name='errorMessageVariable'
        label='错误消息变量'
        placeholder='变量名'
        fieldProps={{
          prefix: (
            <AlertTriangle className='flow-icon-button-sm text-gray-400' />
          ),
        }}
      />
    </Form>
  );
};

export default ErrorEventConfig;

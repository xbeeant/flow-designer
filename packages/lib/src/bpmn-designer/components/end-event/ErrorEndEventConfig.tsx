import { ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface ErrorEndEventConfigProps {
  modeler: Modeler;
  eventDefinition: ModdleElement;
  element: ModdleElement;
}

const ErrorEndEventConfig: React.FC<ErrorEndEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties, getDefinitions } = useModelerUpdate({
    modeler,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({ errorRef: '' });
      return;
    }
    form.setFieldsValue({
      errorRef: eventDefinition.get('errorRef')?.id || '',
    });
  }, [eventDefinition, form]);

  useEffect(() => {
    const definitions = getDefinitions();
    if (!definitions) return;

    const rootElements = definitions.rootElements || [];
    const errors = rootElements
      .filter((el: any) => el.$type === 'bpmn:Error')
      .map((el: any) => ({
        value: el.id || '',
        label: el.name || el.id || '',
      }));

    form.setFieldsValue({ errorOptions: errors });
  }, [getDefinitions, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;

    if (changedValues.errorRef !== undefined) {
      const errorId = changedValues.errorRef;
      let errorRef = null;
      if (errorId) {
        const definitions = getDefinitions();
        const rootElements = definitions?.rootElements || [];
        errorRef = rootElements.find(
          (el: any) => el.$type === 'bpmn:Error' && el.id === errorId,
        );
      }
      updateModdleProperties(element, eventDefinition, { errorRef });
    }
  };

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
      <ProFormText
        name='errorRef'
        label='错误引用'
        placeholder='错误ID'
        fieldProps={{
          prefix: <XCircle className='flow-icon-button-sm text-gray-400' />,
        }}
      />
    </Form>
  );
};

export default ErrorEndEventConfig;

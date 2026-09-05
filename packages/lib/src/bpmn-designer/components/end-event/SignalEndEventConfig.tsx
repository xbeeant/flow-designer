import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { Radio } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface SignalEndEventConfigProps {
  modeler: Modeler;
  eventDefinition: ModdleElement;
  element: ModdleElement;
}

const SignalEndEventConfig: React.FC<SignalEndEventConfigProps> = ({
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
      form.setFieldsValue({ signalRef: '', signalExpression: '' });
      return;
    }
    form.setFieldsValue({
      signalRef: eventDefinition.get('signalRef')?.id || '',
      signalExpression: eventDefinition.get('signalExpression') || '',
    });
  }, [eventDefinition, form]);

  useEffect(() => {
    const definitions = getDefinitions();
    if (!definitions) return;

    const rootElements = definitions.rootElements || [];
    const signals = rootElements
      .filter((el: any) => el.$type === 'bpmn:Signal')
      .map((el: any) => ({
        value: el.id || '',
        label: el.name || el.id || '',
      }));

    form.setFieldsValue({ signalOptions: signals });
  }, [getDefinitions, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;

    if (changedValues.signalRef !== undefined) {
      const signalId = changedValues.signalRef;
      let signalRef = null;
      if (signalId) {
        const definitions = getDefinitions();
        const rootElements = definitions?.rootElements || [];
        signalRef = rootElements.find(
          (el: any) => el.$type === 'bpmn:Signal' && el.id === signalId,
        );
      }
      updateModdleProperties(element, eventDefinition, { signalRef });
    }

    if (changedValues.signalExpression !== undefined) {
      updateModdleProperties(element, eventDefinition, {
        signalExpression: changedValues.signalExpression,
      });
    }
  };

  const signalOptions =
    (form.getFieldValue('signalOptions') as {
      value: string;
      label: string;
    }[]) || [];

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
      <ProFormSelect
        name='signalRef'
        label='信号引用'
        placeholder='请选择信号'
        options={signalOptions}
        fieldProps={{
          prefix: <Radio className='flow-icon-button-sm text-gray-400' />,
        }}
        allowClear
      />
      <ProFormText
        name='signalExpression'
        label='信号表达式'
        placeholder='如: ${signalName}'
        fieldProps={{
          prefix: <Radio className='flow-icon-button-sm text-gray-400' />,
        }}
      />
    </Form>
  );
};

export default SignalEndEventConfig;

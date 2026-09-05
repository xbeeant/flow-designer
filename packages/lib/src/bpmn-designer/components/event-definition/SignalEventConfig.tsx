import {
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface SignalEventConfigProps {
  modeler: Modeler;
  eventDefinition: any;
  element: ModdleElement;
}

const SIGNAL_SCOPE_OPTIONS = [
  { value: '', label: '默认（当前实例）' },
  { value: 'global', label: '全局' },
  { value: 'processInstance', label: '流程实例' },
];

const SignalEventConfig: React.FC<SignalEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties, getRootElements, getRootElementById } =
    useModelerUpdate({
      modeler,
    });
  const [form] = Form.useForm();

  const [signalOptions, setSignalOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({
        signalRef: '',
        signalExpression: '',
        signalScope: '',
        async: false,
      });
      return;
    }
    form.setFieldsValue({
      signalRef: eventDefinition.get('signalRef')?.id || '',
      signalExpression: eventDefinition.get('signalExpression') || '',
      signalScope:
        eventDefinition.get('signalRef')?.scope ||
        eventDefinition.get('scope') ||
        '',
      async: !!eventDefinition.get('async'),
    });
  }, [eventDefinition, form]);

  useEffect(() => {
    const signals = getRootElements('bpmn:Signal').map((el: any) => ({
      value: el.id || '',
      label: el.name || el.id || '',
    }));

    setSignalOptions(signals);
  }, [getRootElements]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    Object.keys(changedValues).forEach((key) => {
      switch (key) {
        case 'signalRef': {
          const refId = changedValues[key];
          if (refId) {
            const refElement = getRootElementById(refId);
            updateModdleProperties(element, eventDefinition, {
              signalRef: refElement,
            });
          }
          break;
        }
        case 'signalScope': {
          const refId = form.getFieldValue('signalRef');
          if (refId) {
            const refElement = getRootElementById(refId);
            if (refElement) {
              updateModdleProperties(element, refElement, {
                scope: changedValues[key] || undefined,
              });
            }
          }
          break;
        }
        default:
          updateModdleProperties(element, eventDefinition, changedValues);
      }
    });
  };

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
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
      <ProFormSelect
        name='signalScope'
        label='信号作用域'
        options={SIGNAL_SCOPE_OPTIONS}
        tooltip='flowable:Scope - 设置信号的作用域'
      />
      <ProFormSwitch
        name='async'
        label='异步'
        tooltip='flowable:async - 信号事件异步执行'
      />
    </Form>
  );
};

export default SignalEventConfig;

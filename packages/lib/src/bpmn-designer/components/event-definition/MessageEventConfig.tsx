import {
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { MessageSquare, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface MessageEventConfigProps {
  modeler: Modeler;
  eventDefinition: any;
  element: ModdleElement;
}

const MessageEventConfig: React.FC<MessageEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties, getRootElements, getRootElementById } =
    useModelerUpdate({
      modeler,
    });
  const [form] = Form.useForm();

  const [messageOptions, setMessageOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({
        messageRef: '',
        messageExpression: '',
        async: false,
      });
      return;
    }
    form.setFieldsValue({
      messageRef: eventDefinition.get('messageRef')?.id || '',
      messageExpression: eventDefinition.get('messageExpression') || '',
      async: !!eventDefinition.get('async'),
    });
  }, [eventDefinition, form]);

  useEffect(() => {
    const messages = getRootElements('bpmn:Message').map((el: any) => ({
      value: el.id || '',
      label: el.name || el.id || '',
    }));

    setMessageOptions(messages);
  }, [getRootElements]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    Object.keys(changedValues).forEach((key) => {
      switch (key) {
        case 'messageRef': {
          const refId = changedValues[key];
          if (refId) {
            const refElement = getRootElementById(refId);
            updateModdleProperties(element, eventDefinition, {
              messageRef: refElement,
            });
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
        name='messageRef'
        label='消息引用'
        placeholder='请选择消息'
        options={messageOptions}
        fieldProps={{
          prefix: (
            <MessageSquare className='flow-icon-button-sm text-gray-400' />
          ),
        }}
        allowClear
      />
      <ProFormText
        name='messageExpression'
        label='消息表达式'
        placeholder='如: ${messageName}'
        fieldProps={{
          prefix: <Radio className='flow-icon-button-sm text-gray-400' />,
        }}
      />
      <ProFormSwitch
        name='async'
        label='异步'
        tooltip='flowable:async - 消息事件异步执行'
      />
    </Form>
  );
};

export default MessageEventConfig;

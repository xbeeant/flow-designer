import { ProFormSelect } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface MessageEndEventConfigProps {
  modeler: Modeler;
  eventDefinition: ModdleElement;
  element: ModdleElement;
}

const MessageEndEventConfig: React.FC<MessageEndEventConfigProps> = ({
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
      form.setFieldsValue({ messageRef: '' });
      return;
    }
    form.setFieldsValue({
      messageRef: eventDefinition.get('messageRef')?.id || '',
    });
  }, [eventDefinition, form]);

  useEffect(() => {
    const definitions = getDefinitions();
    if (!definitions) return;

    const rootElements = definitions.rootElements || [];
    const messages = rootElements
      .filter((el: any) => el.$type === 'bpmn:Message')
      .map((el: any) => ({
        value: el.id || '',
        label: el.name || el.id || '',
      }));

    form.setFieldsValue({ messageOptions: messages });
  }, [getDefinitions, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;

    if (changedValues.messageRef !== undefined) {
      const messageId = changedValues.messageRef;
      let messageRef = null;
      if (messageId) {
        const definitions = getDefinitions();
        const rootElements = definitions?.rootElements || [];
        messageRef = rootElements.find(
          (el: any) => el.$type === 'bpmn:Message' && el.id === messageId,
        );
      }
      updateModdleProperties(element, eventDefinition, { messageRef });
    }
  };

  const messageOptions =
    (form.getFieldValue('messageOptions') as {
      value: string;
      label: string;
    }[]) || [];

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
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
    </Form>
  );
};

export default MessageEndEventConfig;

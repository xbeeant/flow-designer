import { ModalForm, ProFormText } from '@ant-design/pro-components';

const MessageEventDefineModal = ({
  visible,
  onSave,
  onCancel,
  value,
}: {
  value: Record<string, any>;
  visible: boolean;
  onSave: (values: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}) => {
  return (
    <ModalForm
      title={'消息定义'}
      open={visible}
      initialValues={value}
      modalProps={{
        onCancel: onCancel,
        destroyOnHidden: true,
      }}
      onFinish={async (values) => {
        await onSave(values);
      }}
      width={400}
      layout={'vertical'}
    >
      <ProFormText name='name' label='名称' rules={[{ required: true }]} />
      <ProFormText name='itemRef' label='Item Definition ID' placeholder='ItemDefinition的ID' />
    </ModalForm>
  );
};

export default MessageEventDefineModal;
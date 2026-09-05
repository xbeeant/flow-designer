import { ModalForm, ProFormText } from '@ant-design/pro-components';

const EscalationEventDefineModal = ({
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
      title={'升级定义'}
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
      <ProFormText
        name='escalationCode'
        label='升级码'
        rules={[{ required: true }]}
      />
    </ModalForm>
  );
};

export default EscalationEventDefineModal;
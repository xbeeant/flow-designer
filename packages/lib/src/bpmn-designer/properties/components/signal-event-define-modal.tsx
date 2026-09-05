import {
  ModalForm,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-components';

const SignalEventDefineModal = ({
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
      title={'信号定义'}
      open={visible}
      initialValues={{ scope: 'global', ...value }}
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
      <ProFormRadio.Group
        name='scope'
        label='作用域'
        rules={[{ required: true }]}
        options={[
          { value: 'global', label: '全局' },
          { value: 'processInstance', label: '当前实例' },
        ]}
      />
    </ModalForm>
  );
};

export default SignalEventDefineModal;
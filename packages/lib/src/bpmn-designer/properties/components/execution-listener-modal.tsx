import {
  ModalForm,
  ProForm,
  ProFormDependency,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import FieldTable from './field-table.tsx';

export interface InjectedField {
  name: string;
  fieldType: 'string' | 'expression';
  value: string;
  id?: string;
}

export interface ExecutionListenerItem {
  id: string;
  event: string;
  type: 'class' | 'expression' | 'delegateExpression' | 'script';
  className: string;
  expression: string;
  delegateExpression: string;
  scriptType: 'inline' | 'external';
  script: string;
  scriptResource: string;
  transaction: string;
  fields: InjectedField[];
}

export const EXECUTION_EVENTS = [
  { value: 'start', label: '启动' },
  { value: 'end', label: '结束' },
  { value: 'take', label: '流转' },
];

export const EXECUTION_LISTENER_TYPES = [
  { value: 'class', label: 'Java类' },
  { value: 'expression', label: '表达式' },
  { value: 'delegateExpression', label: '代理表达式' },
  { value: 'script', label: '脚本' },
];

export const TRANSACTION_TYPES = [
  { value: 'before-commit', label: '提交前' },
  { value: 'committed', label: '提交后' },
  { value: 'rolled-back', label: '回滚' },
];

const ExecutionListenerModal = ({
  value,
  visible,
  onCancel,
  onSave,
}: {
  value?: ExecutionListenerItem;
  visible: boolean;
  onCancel: () => void;
  onSave: (values: ExecutionListenerItem) => Promise<void>;
}) => {
  const [form] = Form.useForm();

  return (
    <ModalForm
      form={form}
      layout='vertical'
      classNames={{
        content: 'space-y-4',
      }}
      initialValues={
        value || {
          event: 'start',
          type: 'class',
          transaction: 'before-commit',
        }
      }
      title={value ? '编辑执行监听器' : '添加执行监听器'}
      open={visible}
      modalProps={{
        onCancel: () => {
          onCancel();
        },
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        await onSave(values);
      }}
    >
      <ProFormRadio.Group
        name='event'
        label='事件类型'
        rules={[{ required: true }]}
        options={EXECUTION_EVENTS}
      />
      <ProFormRadio.Group
        name='type'
        label='监听器类型'
        rules={[{ required: true }]}
        options={EXECUTION_LISTENER_TYPES}
      />
      <ProFormRadio.Group
        name='transaction'
        label='事务类型'
        rules={[{ required: true }]}
        options={TRANSACTION_TYPES}
      />
      <ProFormDependency name={['type']}>
        {({ type }) => {
          switch (type) {
            case 'class':
              return (
                <ProFormText
                  name='className'
                  label='完整类名'
                  rules={[{ required: true }]}
                />
              );
            case 'expression':
              return (
                <ProFormText
                  name='expression'
                  label='表达式'
                  rules={[{ required: true }]}
                />
              );
            case 'delegateExpression':
              return (
                <ProFormText
                  name='delegateExpression'
                  label='代理表达式'
                  rules={[{ required: true }]}
                />
              );
            case 'script':
              return (
                <>
                  <ProFormRadio.Group
                    name='scriptType'
                    label='脚本类型'
                    rules={[{ required: true }]}
                    options={[
                      { value: 'inline', label: '内部脚本' },
                      { value: 'external', label: '外部脚本' },
                    ]}
                  />
                  <ProFormDependency name={['scriptType']}>
                    {({ scriptType }) => {
                      if (scriptType === 'inline') {
                        return (
                          <ProFormTextArea
                            name='script'
                            label='脚本'
                            rules={[{ required: true }]}
                          />
                        );
                      }

                      return (
                        <ProFormText
                          name='scriptResource'
                          label='脚本地址'
                          rules={[{ required: true }]}
                        />
                      );
                    }}
                  </ProFormDependency>
                </>
              );
          }
        }}
      </ProFormDependency>
      <ProForm.Item
        label='注入字段'
        name='fields'
        initialValue={value?.fields || []}
        trigger='onValuesChange'
      >
        <FieldTable />
      </ProForm.Item>
    </ModalForm>
  );
};

export default ExecutionListenerModal;

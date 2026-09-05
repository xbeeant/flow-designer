import {
  ModalForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import type { CallActivityParam } from '../../hooks/useCallActivityParams';

const InOutParamModal = ({
  value,
  visible,
  onCancel,
  onSave,
}: {
  value?: CallActivityParam;
  visible: boolean;
  onCancel: () => void;
  onSave: (values: Omit<CallActivityParam, 'id'>) => void;
}) => (
  <ModalForm<Omit<CallActivityParam, 'id'>>
    initialValues={
      value || {
        source: '',
        sourceExpression: '',
        target: '',
        variables: '',
        local: false,
      }
    }
    title={value ? '编辑参数映射' : '添加参数映射'}
    open={visible}
    modalProps={{ onCancel, destroyOnClose: true }}
    onFinish={async (values) => {
      onSave(values);
      return true;
    }}
    layout='vertical'
  >
    <ProFormText
      name='source'
      label='来源变量'
      placeholder='变量名，如: orderInfo'
      tooltip='来源变量（flowable:source）'
    />
    <ProFormText
      name='sourceExpression'
      label='来源表达式'
      placeholder='如: ${order.id}'
      tooltip='来源表达式（flowable:sourceExpression）'
    />
    <ProFormText
      name='target'
      label='目标变量'
      placeholder='子流程中的变量名'
      tooltip='目标变量（flowable:target）'
    />
    <ProFormText
      name='variables'
      label='变量列表'
      placeholder='逗号分隔的变量名，如: a,b,c'
      tooltip='flowable:variables'
    />
    <ProFormCheckbox name='local' label='局部作用域' tooltip='flowable:local' />
  </ModalForm>
);

export default InOutParamModal;

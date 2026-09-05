import {
  ModalForm,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import type { EventListenerItem } from '../../hooks/useEventListeners';

export const EVENT_TYPES = [
  { value: 'ENTITY_CREATED', label: '实体创建' },
  { value: 'ENTITY_INITIALIZED', label: '实体初始化' },
  { value: 'ENTITY_UPDATED', label: '实体更新' },
  { value: 'ENTITY_DELETED', label: '实体删除' },
  { value: 'TASK_ASSIGNED', label: '任务分配' },
  { value: 'TASK_COMPLETED', label: '任务完成' },
  { value: 'TASK_CREATED', label: '任务创建' },
  { value: 'PROCESS_STARTED', label: '流程启动' },
  { value: 'PROCESS_COMPLETED', label: '流程完成' },
  { value: 'PROCESS_CANCELLED', label: '流程取消' },
  { value: 'ACTIVITY_COMPENSATE', label: '活动补偿' },
];

const ENTITY_TYPES = [
  { value: 'attachment', label: '附件' },
  { value: 'comment', label: '评论' },
  { value: 'execution', label: '执行' },
  { value: 'identity-link', label: '身份链接' },
  { value: 'job', label: '作业' },
  { value: 'process-instance', label: '流程实例' },
  { value: 'process-definition', label: '流程定义' },
  { value: 'task', label: '任务' },
];

export const LISTENER_TYPES = [
  { value: 'class', label: 'Java类' },
  { value: 'expression', label: '表达式' },
  { value: 'delegateExpression', label: '代理表达式' },
];

const EventListenerModal = ({
  value,
  visible,
  onCancel,
  onSave,
}: {
  value?: EventListenerItem;
  visible: boolean;
  onCancel: () => void;
  onSave: (values: EventListenerItem) => Promise<void>;
}) => {
  return (
    <ModalForm
      layout='vertical'
      classNames={{
        content: 'space-y-4',
      }}
      initialValues={value}
      title={value ? '编辑事件监听器' : '添加事件监听器'}
      open={visible}
      modalProps={{
        onCancel: () => {
          onCancel();
        },
        destroyOnClose: true,
        width: 450,
      }}
      onFinish={async (values: EventListenerItem) => {
        await onSave(values);
      }}
    >
      <ProFormSelect
        name='events'
        label='事件类型'
        rules={[{ required: true, message: '请选择事件类型' }]}
        mode='multiple'
        options={EVENT_TYPES}
        placeholder='选择事件类型'
      />
      <ProFormRadio.Group
        name='throwEvent'
        label='抛出事件'
        options={[
          { value: 'true', label: '是' },
          { value: 'false', label: '否' },
        ]}
        initialValue='false'
      />
      <ProFormRadio.Group
        name='listenerType'
        label='监听器类型'
        rules={[{ required: true, message: '请选择监听器类型' }]}
        options={LISTENER_TYPES}
      />
      <ProFormDependency name={['listenerType']}>
        {({ listenerType }) => {
          switch (listenerType) {
            case 'class':
              return (
                <ProFormText
                  name='className'
                  label='监听器'
                  rules={[{ required: true, message: '请输入完整类名' }]}
                  placeholder='完整类名'
                />
              );
            case 'expression':
              return (
                <ProFormText
                  name='expression'
                  label='监听器'
                  rules={[{ required: true, message: '请输入表达式' }]}
                  placeholder='表达式'
                />
              );
            case 'delegateExpression':
              return (
                <ProFormText
                  name='delegateExpression'
                  label='监听器'
                  rules={[{ required: true, message: '请输入代理表达式' }]}
                  placeholder='代理表达式'
                />
              );
            default:
              return null;
          }
        }}
      </ProFormDependency>
      <ProFormSelect
        name='entityType'
        label='实体类型'
        options={ENTITY_TYPES}
        placeholder='选择实体类型'
      />
    </ModalForm>
  );
};

export default EventListenerModal;

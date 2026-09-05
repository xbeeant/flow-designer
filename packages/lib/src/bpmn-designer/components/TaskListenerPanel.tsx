import {
  ModalForm,
  ProFormDependency,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, Popconfirm, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { Delete, Edit, Headphones, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEmitter } from '../hooks/useEmitter.ts';
import { useTaskListeners } from '../hooks/useTaskListeners';
import FieldTable from '../properties/components/field-table.tsx';
import emitter from '../util/emitter.ts';
import type { PanelConfigProps } from './panel-items.tsx';

const EVENT_KEY = 'taskListener';

interface TaskListenerPanelProps {
  modeler: Modeler;
  element: ModdleElement;
}

const TASK_EVENTS = [
  { value: 'create', label: '创建' },
  { value: 'assignment', label: '分配' },
  { value: 'complete', label: '完成' },
  { value: 'delete', label: '删除' },
  { value: 'all', label: '全部' },
];

const TASK_LISTENER_TYPES = [
  { value: 'class', label: 'Java类' },
  { value: 'expression', label: '表达式' },
  { value: 'delegateExpression', label: '代理表达式' },
  { value: 'script', label: '脚本' },
];

const TYPE_COLOR_MAP: Record<string, string> = {
  class: 'purple',
  expression: 'orange',
  delegateExpression: 'cyan',
  script: 'red',
};

const EVENT_COLOR_MAP: Record<string, string> = {
  create: 'green',
  assignment: 'blue',
  complete: 'cyan',
  delete: 'red',
  all: 'geekblue',
};

function renderEventCell(event: string): React.ReactNode {
  const label = TASK_EVENTS.find((e) => e.value === event);
  if (!label) return event;
  return (
    <Tag
      color={EVENT_COLOR_MAP[label.value] ?? 'blue'}
      className='text-xs px-2 py-0.5'
    >
      {label.label}
    </Tag>
  );
}

function renderTypeCell(type: string): React.ReactNode {
  const label = TASK_LISTENER_TYPES.find((t) => t.value === type);
  if (!label) return type;
  return (
    <Tag color={TYPE_COLOR_MAP[type]} className='text-xs px-2 py-0.5'>
      {label.label}
    </Tag>
  );
}

function renderValueCell(record: any): string {
  const map: Record<string, string> = {
    class: record.className,
    expression: record.expression,
    delegateExpression: record.delegateExpression,
  };
  if (map[record.type]) return map[record.type];
  if (record.type === 'script') {
    return record.scriptType === 'inline' ? '内部脚本' : record.scriptResource;
  }
  return '-';
}

function buildColumns(
  listeners: any[],
  onEdit: (item: any) => void,
  onDelete: (index: number) => void,
): ColumnsType<any> {
  return [
    {
      title: '事件',
      dataIndex: 'event',
      key: 'event',
      className: 'text-gray-500',
      render: renderEventCell,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      className: 'text-gray-500',
      render: renderTypeCell,
    },
    {
      title: '值',
      key: 'value',
      className: 'text-gray-600',
      ellipsis: true,
      render: (_, record) => renderValueCell(record),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, __, index) => (
        <div className='flex items-center gap-1'>
          <Button
            type='text'
            size='small'
            icon={<Edit className='flow-icon-button-sm text-blue-500' />}
            onClick={() => onEdit(listeners[index])}
            className='hover:bg-blue-50 rounded-md px-1'
          />
          <Popconfirm
            title='确定删除？'
            onConfirm={() => onDelete(index)}
            okText='确定'
            cancelText='取消'
          >
            <Button
              type='text'
              size='small'
              danger
              icon={<Delete className='flow-icon-button-sm' />}
              className='hover:bg-red-50 rounded-md px-1'
            />
          </Popconfirm>
        </div>
      ),
    },
  ];
}

function TaskListenerModal({
  value,
  visible,
  onCancel,
  onSave,
}: {
  value?: any;
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
}) {
  const [form] = Form.useForm();

  return (
    <ModalForm
      form={form}
      layout='vertical'
      classNames={{ content: 'space-y-4' }}
      initialValues={value || { event: 'create', type: 'class' }}
      title={value ? '编辑任务监听器' : '添加任务监听器'}
      open={visible}
      modalProps={{
        onCancel,
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        onSave(values);
      }}
    >
      <ProFormRadio.Group
        name='event'
        label='事件类型'
        rules={[{ required: true }]}
        options={TASK_EVENTS}
      />
      <ProFormRadio.Group
        name='type'
        label='监听器类型'
        rules={[{ required: true }]}
        options={TASK_LISTENER_TYPES}
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
                    initialValue='inline'
                    options={[
                      { value: 'inline', label: '内部脚本' },
                      { value: 'external', label: '外部脚本' },
                    ]}
                  />
                  <ProFormDependency name={['scriptType']}>
                    {({ scriptType }) =>
                      scriptType === 'inline' ? (
                        <ProFormTextArea
                          name='script'
                          label='脚本'
                          rules={[{ required: true }]}
                          fieldProps={{ rows: 3 }}
                        />
                      ) : (
                        <ProFormText
                          name='scriptResource'
                          label='脚本地址'
                          rules={[{ required: true }]}
                        />
                      )
                    }
                  </ProFormDependency>
                </>
              );
            default:
              return null;
          }
        }}
      </ProFormDependency>
      <Form.Item
        label='注入字段'
        name='fields'
        initialValue={value?.fields || []}
        trigger='onValuesChange'
      >
        <FieldTable />
      </Form.Item>
    </ModalForm>
  );
}

const TaskListenerPanel: React.FC<TaskListenerPanelProps> = (props) => {
  const { listeners, handleSave, editingItem, handleDelete, handleEdit } =
    useTaskListeners(props);

  const columns = useMemo(
    () => buildColumns(listeners, handleEdit, handleDelete),
    [listeners],
  );

  const [modalVisible, setModalVisible] = useState(false);

  useEmitter(EVENT_KEY, () => {
    setModalVisible(true);
  });

  return (
    <div className='space-y-3'>
      <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
        <div className='p-3'>
          <Table
            dataSource={listeners}
            columns={columns}
            pagination={false}
            size='small'
            rowKey='id'
            bordered={false}
            className='text-xs'
          />
        </div>
      </div>

      <TaskListenerModal
        value={editingItem}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSave={(values) => {
          handleSave(values);
          setModalVisible(false);
        }}
      />
    </div>
  );
};

export const TaskListenerPanelConfig = ({
  listenerCount = 0,
}: PanelConfigProps) => ({
  key: 'taskListeners',
  label: (
    <span className='flex items-center justify-between w-full'>
      <span className='flex items-center gap-2 text-gray-600 font-medium'>
        <Headphones className='flow-icon-panel' />
        任务监听器
      </span>
      <span className='flex items-center gap-2'>
        <span className='px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full font-medium'>
          {listenerCount}个
        </span>
        <Button
          type='text'
          size='small'
          icon={<Plus className='flow-icon-button-sm text-green-500' />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            emitter.emit(EVENT_KEY);
          }}
          className='text-green-600 hover:text-green-700 hover:bg-green-50 font-medium rounded-lg px-2 py-0.5'
        >
          添加
        </Button>
      </span>
    </span>
  ),
});

export default TaskListenerPanel;
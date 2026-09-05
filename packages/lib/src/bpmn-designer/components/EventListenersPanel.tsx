import { Button, Popconfirm, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { Delete, Edit, Plus, Radio } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEmitter } from '../hooks/useEmitter';
import { useEventListeners } from '../hooks/useEventListeners.ts';
import EventListenerModal, {
  EVENT_TYPES,
  LISTENER_TYPES,
} from '../properties/components/event-listener-modal.tsx';
import emitter from '../util/emitter';
import type { PanelConfigProps } from './panel-items.tsx';

const EVENT_KEY = 'eventListener';

interface EventListenersPanelProps {
  modeler: Modeler;
  modelerVersion?: number;
  element: ModdleElement;
  onListenersChange?: (count: number) => void;
}

export interface EventListenerField {
  id: string;
  name: string;
  string: string;
  expression: string;
}

export interface EventListenerItem extends Record<string, any> {
  id: string;
  events: string[];
  throwEvent: string;
  listenerType: string;
  className: string;
  expression: string;
  delegateExpression: string;
  entityType: string;
  fields: EventListenerField[];
}

const LISTENER_TYPE_MAP: Record<string, string> = Object.fromEntries(
  LISTENER_TYPES.map((t) => [t.value, t.label]),
);

function getListenerValue(item: EventListenerItem): string {
  return item.className || item.expression || item.delegateExpression || '';
}

function renderEventCell(record: EventListenerItem): React.ReactNode {
  return record.events
    .map((e) => EVENT_TYPES.find((evt) => evt.value === e)?.label || e)
    .join(',');
}

function renderTypeCell(record: EventListenerItem): React.ReactNode {
  return LISTENER_TYPE_MAP[record.listenerType] ?? record.listenerType;
}

function buildColumns(
  listeners: EventListenerItem[],
  onEdit: (item: EventListenerItem) => void,
  onDelete: (index: number) => void,
): ColumnsType<EventListenerItem> {
  return [
    {
      title: '事件类型',
      key: 'events',
      className: 'text-xs',
      render: (_, record) => renderEventCell(record),
    },
    {
      title: '监听器类型',
      key: 'listenerType',
      className: 'text-xs',
      render: (_, record) => renderTypeCell(record),
    },
    {
      title: '监听器',
      key: 'listener',
      className: 'text-xs',
      ellipsis: true,
      render: (_, record) => getListenerValue(record),
    },
    {
      title: '操作',
      key: 'action',
      className: 'text-xs',
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

const EventListenersPanel: React.FC<EventListenersPanelProps> = ({
  modeler,
  modelerVersion,
  element,
  onListenersChange,
}) => {
  const { listeners, editingItem, handleEdit, handleDelete, handleSave } =
    useEventListeners({
      modeler,
      modelerVersion,
      element,
      onListenersChange,
    });

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

      {modalVisible && (
        <EventListenerModal
          value={editingItem || undefined}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSave={async (values) => {
            handleSave(values);
            setModalVisible(false);
          }}
        />
      )}
    </div>
  );
};

export const EventListenersPanelConfig = ({
  listenerCount = 0,
}: PanelConfigProps) => ({
  key: 'event-listeners',
  label: (
    <span className='flex items-center justify-between w-full'>
      <span className='flex items-center gap-2 text-gray-600 font-medium'>
        <Radio className='flow-icon-panel' />
        事件监听器
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

export default EventListenersPanel;

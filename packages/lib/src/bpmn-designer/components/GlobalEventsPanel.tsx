import { Button, Popconfirm, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type Modeler from 'bpmn-js/lib/Modeler';
import {
  AlertTriangle,
  ArrowUpCircle,
  Delete,
  Edit,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEmitter } from '../hooks/useEmitter.ts';
import { useGlobalEvents } from '../hooks/useGlobalEvents';
import ErrorEventDefineModal from '../properties/components/error-event-define-modal.tsx';
import MessageEventDefineModal from '../properties/components/message-event-define-modal.tsx';
import SignalEventDefineModal from '../properties/components/signal-event-define-modal.tsx';
import EscalationEventDefineModal from '../properties/components/upgrade-event-define-modal.tsx';
import emitter from '../util/emitter.ts';
import type {
  ColumnConfig,
  EventType,
  EventTypeConfig,
} from './GlobalEventsPanel.config';

interface GlobalEventsPanelProps {
  modeler: Modeler;
  modelerVersion?: number;
  onEventsChange?: (totalCount: number) => void;
  addType?: EventType;
}

const EVENT_KEY = 'globalEvent';

/** 事件表格区块组件 */
const EventTableSection = ({
  config,
  data,
  onEdit,
  onDelete,
}: {
  config: EventTypeConfig;
  data: any[];
  onAdd?: () => void;
  onEdit: (item: any) => void;
  onDelete: (type: EventType, index: number) => void;
}) => {
  const Icon = config.icon;

  const columns: ColumnsType<Record<string, any>> = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id', className: 'text-xs' },
      { title: '名称', dataIndex: 'name', key: 'name', className: 'text-xs' },
      ...config.extraColumns.map((col: ColumnConfig) => ({
        title: col.title,
        dataIndex: col.dataIndex,
        key: col.key,
        className: 'text-xs',
        render: col.render,
      })),
      {
        title: '操作',
        key: 'action',
        className: 'text-xs',
        render: (_, record, index: number) => (
          <div className='flex items-center gap-1'>
            <Button
              type='text'
              size='small'
              icon={<Edit className='flow-icon-button-sm text-blue-500' />}
              onClick={() => onEdit(record)}
            />
            <Popconfirm
              title='确定删除？'
              onConfirm={() => onDelete(config.type, index)}
              okText='确定'
              cancelText='取消'
            >
              <Button
                type='text'
                size='small'
                danger
                icon={<Delete className='flow-icon-button-sm' />}
              />
            </Popconfirm>
          </div>
        ),
      },
    ],
    [config, data, onEdit, onDelete],
  );

  return (
    <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
      <div className='flex items-center justify-between px-3 py-2 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100'>
        <span className='flex items-center gap-1.5 text-sm font-medium text-gray-700'>
          <Icon className='flow-icon-panel text-blue-500' />
          {config.label}
        </span>
        <div className='flex items-center gap-2'>
          <span className='px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full'>
            {data.length}个
          </span>
          <Button
            type='text'
            size='small'
            icon={<Plus className='flow-icon-button-sm text-green-500' />}
            onClick={() => {
              emitter.emit(EVENT_KEY, {
                type: config,
              });
            }}
            className='text-green-600 hover:text-green-700 hover:bg-green-50 font-medium rounded-lg px-2 py-0.5'
          >
            添加
          </Button>
        </div>
      </div>
      <div className='p-2'>
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size='small'
          rowKey='id'
          bordered={false}
        />
      </div>
    </div>
  );
};

export const EVENT_TYPE_CONFIGS: EventTypeConfig[] = [
  {
    type: 'message',
    label: '消息定义',
    icon: MessageSquare,
    bpmnType: 'bpmn:Message',
    extraColumns: [
      { title: 'Item Definition', dataIndex: 'itemRef', key: 'itemRef' },
    ],
    ModalComponent: MessageEventDefineModal,
  },
  {
    type: 'error',
    label: '错误定义',
    icon: AlertTriangle,
    bpmnType: 'bpmn:Error',
    extraColumns: [
      { title: '错误码', dataIndex: 'errorCode', key: 'errorCode' },
    ],
    ModalComponent: ErrorEventDefineModal,
  },
  {
    type: 'signal',
    label: '信号定义',
    icon: AlertTriangle,
    bpmnType: 'bpmn:Signal',
    extraColumns: [
      {
        title: '作用域',
        dataIndex: 'scope',
        key: 'scope',
        render: (scope: string) => (
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              scope === 'global'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            {scope === 'global' ? '全局' : '当前实例'}
          </span>
        ),
      },
    ],
    ModalComponent: SignalEventDefineModal,
  },
  {
    type: 'escalation',
    label: '升级定义',
    icon: ArrowUpCircle,
    bpmnType: 'bpmn:Escalation',
    extraColumns: [
      { title: '升级码', dataIndex: 'escalationCode', key: 'escalationCode' },
    ],
    ModalComponent: EscalationEventDefineModal,
  },
];

const GlobalEventsPanel: React.FC<GlobalEventsPanelProps> = (props) => {
  const { modeler, modelerVersion } = props;
  const [type, setType] = useState<EventTypeConfig | undefined>(undefined);

  const { eventData, editingItem, handleEdit, handleDelete, handleSave } =
    useGlobalEvents({
      modeler,
      modelerVersion,
      eventType: type?.type,
    });

  const [modalVisible, setModalVisible] = useState(false);

  useEmitter(EVENT_KEY, (payload) => {
    setModalVisible(true);
    if (payload) {
      setType(payload.type as unknown as EventTypeConfig);
    }
  });

  const ModalComponent = type?.ModalComponent;

  return (
    <div className='space-y-3'>
      {EVENT_TYPE_CONFIGS.map((config) => (
        <EventTableSection
          key={config.type}
          config={config}
          data={eventData[config.type]}
          onEdit={(value) => {
            emitter.emit(EVENT_KEY, { type: type, data: value });
            handleEdit(value);
          }}
          onDelete={handleDelete}
        />
      ))}

      {modalVisible && (
        // @ts-expect-error
        <ModalComponent
          visible={true}
          value={editingItem || {}}
          // @ts-expect-error
          onSave={async (values) => {
            handleSave(values);
            setModalVisible(false);
          }}
          onCancel={() => {
            setModalVisible(false);
          }}
        />
      )}
    </div>
  );
};

interface GlobalEventsPanelConfigProps {
  eventCount?: number;
}

export const GlobalEventsPanelConfig = ({
  eventCount = 0,
}: GlobalEventsPanelConfigProps) => ({
  key: 'global-events',
  label: (
    <span className='flex items-center justify-between w-full'>
      <span className='flex items-center gap-2 text-gray-600 font-medium'>
        <MessageSquare className='flow-icon-panel' />
        全局事件定义
      </span>
      <span className='px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full'>
        {eventCount}个
      </span>
    </span>
  ),
});

export default GlobalEventsPanel;

import { Button, Popconfirm, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { Delete, Edit, Plus, Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEmitter } from '../hooks/useEmitter';
import {
  type ExtensionPropertyItem,
  type TimerDurationValue,
  useExtensions,
} from '../hooks/useExtensions';
import ExtensionModal from '../properties/components/extension-modal.tsx';
import emitter from '../util/emitter';
import type { PanelConfigProps } from './panel-items.tsx';

const EVENT_KEY = 'extension';

interface ExtensionsPanelProps {
  modeler: Modeler;
  modelerVersion?: number;
  element: ModdleElement;
  onPropertiesChange?: (count: number) => void;
}

function buildColumns(
  properties: ExtensionPropertyItem[],
  onEdit: (item: ExtensionPropertyItem) => void,
  onDelete: (index: number) => void,
): ColumnsType<ExtensionPropertyItem> {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      className: 'text-gray-500',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      className: 'text-gray-600 font-medium',
      render: (name: string, record: ExtensionPropertyItem) => (
        <span>
          {record.type === 'standardDuration' && (
            <span className='ml-2 px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-500 rounded'>
              标准时长
            </span>
          )}
          {record.type === 'timerDuration' && (
            <span className='ml-2 px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-500 rounded'>
              时间规则
            </span>
          )}
          {name}
        </span>
      ),
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      className: 'text-gray-600',
      render: (
        value: string | TimerDurationValue,
        record: ExtensionPropertyItem,
      ) => {
        if (record.type === 'timerDuration' && typeof value === 'object') {
          const timeUnitMap: Record<string, string> = {
            D: '天',
            H: '小时',
            M: '分钟',
          };
          const timeDuration = value.timeDuration || '0';
          const unit = value.timeDurationType || 'D';
          const unitLabel = timeUnitMap[unit] || unit;
          return `⏱ ${timeDuration} ${unitLabel}`;
        }
        if (record.type === 'standardDuration') {
          return `${value} 工作日`;
        }
        return String(value);
      },
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
            onClick={() => {
              onEdit(properties[index]);
              emitter.emit(EVENT_KEY);
            }}
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

const ExtensionsPanel: React.FC<ExtensionsPanelProps> = (props) => {
  const { properties, handleSave, editingItem, handleDelete, handleEdit } =
    useExtensions(props);

  const columns = useMemo(
    () => buildColumns(properties, handleEdit, handleDelete),
    [properties],
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
            dataSource={properties}
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
        <ExtensionModal
          value={editingItem || undefined}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSave={(values) => {
            handleSave(values);
            setModalVisible(false);
          }}
        />
      )}
    </div>
  );
};

export const ExtensionsPanelConfig = ({
  propertyCount = 0,
}: PanelConfigProps) => ({
  key: 'extensions',
  label: (
    <span className='flex items-center justify-between w-full'>
      <span className='flex items-center gap-2 text-gray-600 font-medium'>
        <Settings2 className='flow-icon-panel' />
        扩展属性
      </span>
      <span className='flex items-center gap-2'>
        <span className='px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full font-medium'>
          {propertyCount}个
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

export default ExtensionsPanel;

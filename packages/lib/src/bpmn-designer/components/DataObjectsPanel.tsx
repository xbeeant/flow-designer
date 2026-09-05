import { Button, Popconfirm, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types';
import { Database, Delete, Edit, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useDataObjects } from '../hooks/useDataObjects.ts';
import { useEmitter } from '../hooks/useEmitter';
import DataObjectModal, {
  DATA_TYPES,
  type DataObjectItem,
} from '../properties/components/data-object-modal.tsx';
import emitter from '../util/emitter';
import type { PanelConfigProps } from './panel-items.tsx';

const EVENT_KEY = 'dataObject';

interface DataObjectsPanelProps {
  modeler: Modeler;
  modelerVersion?: number;
  processElement: ModdleElement;
  onDataChange?: (dataObjectCount: number) => void;
}

const DataObjectsPanel: React.FC<DataObjectsPanelProps> = (props) => {
  const { dataObjects, addDataObject, editDataObject, deleteDataObject } =
    useDataObjects(props);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DataObjectItem | undefined>(
    undefined,
  );

  useEmitter(EVENT_KEY, () => {
    setEditingItem(undefined);
    setModalVisible(true);
  });

  const handleEdit = useCallback((item: DataObjectItem) => {
    setEditingItem(item);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback(
    (record: DataObjectItem) => {
      deleteDataObject(record.id);
    },
    [deleteDataObject],
  );

  const handleSave = useCallback(
    (values: DataObjectItem) => {
      if (editingItem) {
        editDataObject({ ...values, id: editingItem.id });
      } else {
        addDataObject(values);
      }
      setModalVisible(false);
      setEditingItem(undefined);
    },
    [editingItem, addDataObject, editDataObject],
  );

  const columns: ColumnsType<DataObjectItem> = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        className: 'text-xs',
      },
      {
        title: '名称',
        dataIndex: 'name',
        className: 'text-xs',
        ellipsis: true,
      },
      {
        title: '类型',
        dataIndex: 'itemSubjectRef',
        className: 'text-xs',
        render: (_, record) => {
          const typeLabel = DATA_TYPES.find(
            (t) => t.value === record.itemSubjectRef,
          );
          return typeLabel ? typeLabel.label : record.itemSubjectRef;
        },
      },
      {
        title: '值',
        dataIndex: 'value',
      },
      {
        title: '操作',
        key: 'action',
        className: 'text-xs',
        render: (_, record) => (
          <div className='flex items-center gap-1'>
            <Button
              type='text'
              size='small'
              icon={<Edit className='flow-icon-button-sm text-blue-500' />}
              onClick={() => handleEdit(record)}
              className='hover:bg-blue-50 rounded-md px-1'
            />
            <Popconfirm
              title='确定删除？'
              onConfirm={() => handleDelete(record)}
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
    ],
    [handleEdit, handleDelete],
  );

  return (
    <div className='space-y-3'>
      <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
        <div className='p-3'>
          <Table
            dataSource={dataObjects}
            pagination={false}
            size='small'
            columns={columns}
            rowKey='id'
            bordered={false}
            className='text-xs'
          />
        </div>
      </div>
      {modalVisible && (
        <DataObjectModal
          visible={modalVisible}
          value={editingItem}
          onCancel={() => setModalVisible(false)}
          onOk={handleSave}
        />
      )}
    </div>
  );
};

export const DataObjectsPanelConfig = ({
  dataObjectCount = 0,
}: PanelConfigProps) => ({
  key: 'data-objects',
  label: (
    <span className='flex items-center justify-between w-full'>
      <span className='flex items-center gap-2 text-gray-600 font-medium'>
        <Database className='flow-icon-panel' />
        数据对象
      </span>
      <span className='flex items-center gap-2'>
        <span className='px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full font-medium'>
          {dataObjectCount}个
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

export default DataObjectsPanel;

import { Button, Popconfirm, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Delete,
  Edit,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import type { CallActivityParam } from '../../hooks/useCallActivityParams';
import InOutParamModal from '../../properties/components/inout-param-modal.tsx';
import { generateId } from '../../util/random-char';

interface InOutParamsEditorProps {
  title: string;
  params: CallActivityParam[];
  onChange: (items: CallActivityParam[]) => void;
}

const InOutParamsEditor: React.FC<InOutParamsEditorProps> = ({
  title,
  params,
  onChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CallActivityParam | undefined>(
    undefined,
  );

  const columns: ColumnsType<CallActivityParam> = [
    {
      title: '来源',
      dataIndex: 'source',
      className: 'text-xs',
      render: (_, record) => record.source || record.sourceExpression || '-',
    },
    {
      title: '目标',
      dataIndex: 'target',
      className: 'text-xs',
    },
    {
      title: '变量列表',
      dataIndex: 'variables',
      className: 'text-xs',
      ellipsis: true,
      render: (variables: string) => variables || '-',
    },
    {
      title: '本地',
      dataIndex: 'local',
      className: 'text-xs',
      render: (local: boolean) => (local ? '是' : '否'),
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
            onClick={() => {
              setEditingItem(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title='确定删除？'
            onConfirm={() =>
              onChange(params.filter((item) => item.id !== record.id))
            }
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
  ];

  return (
    <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
      <div className='flex items-center justify-between px-3 py-2 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100'>
        <span className='flex items-center gap-1.5 text-sm font-medium text-gray-700'>
          {title === '入参映射' ? (
            <ArrowDownToLine className='flow-icon-panel text-blue-500' />
          ) : (
            <ArrowUpFromLine className='flow-icon-panel text-blue-500' />
          )}
          {title}
        </span>
        <div className='flex items-center gap-2'>
          <span className='px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full'>
            {params.length}个
          </span>
          <Button
            type='text'
            size='small'
            icon={<Plus className='flow-icon-button-sm text-green-500' />}
            onClick={() => {
              setEditingItem(undefined);
              setModalVisible(true);
            }}
            className='text-green-600 hover:text-green-700 hover:bg-green-50 font-medium rounded-lg px-2 py-0.5'
          >
            添加
          </Button>
        </div>
      </div>
      <div className='p-2'>
        <Table
          dataSource={params}
          columns={columns}
          size='small'
          pagination={false}
          rowKey='id'
          bordered={false}
        />
      </div>

      {modalVisible && (
        <InOutParamModal
          value={editingItem}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSave={(values) => {
            const newItem: CallActivityParam = {
              ...values,
              id: editingItem?.id || generateId('InOut'),
            };
            if (editingItem) {
              onChange(
                params.map((item) =>
                  item.id === editingItem.id ? newItem : item,
                ),
              );
            } else {
              onChange([...params, newItem]);
            }
            setModalVisible(false);
            setEditingItem(undefined);
          }}
        />
      )}
    </div>
  );
};

export default InOutParamsEditor;

import type { ProColumns } from '@ant-design/pro-components';
import { EditableProTable } from '@ant-design/pro-components';
import { ConfigProvider } from 'antd';
import type React from 'react';
import { useState } from 'react';
import EmptyTable from './empty-table.tsx';

export interface FieldType {
  name: string;
  fieldType: 'string' | 'expression';
  value: string;
  id?: string;
}

const FIELD_TYPE_OPTIONS = [
  { value: 'string', label: '字符串' },
  { value: 'expression', label: '表达式' },
];

let editableRowIdCounter = 1000000;
export function createEditableRowId(): string {
  editableRowIdCounter += 1;
  return String(editableRowIdCounter);
}

const FieldTable = ({
  onValuesChange,
  value = [],
}: {
  onValuesChange?: (value: readonly FieldType[]) => void;
  value?: FieldType[];
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly FieldType[]>(
    value.map((item) => {
      return {
        ...item,
        id: item.id ? item.id : createEditableRowId(),
      };
    }),
  );

  const columns: ProColumns<FieldType>[] = [
    {
      title: '字段名',
      className: 'text-xs',
      dataIndex: 'name',
      width: '25%',
    },
    {
      title: '字段类型',
      className: 'text-xs',
      dataIndex: 'fieldType',
      valueType: 'select',
      fieldProps: {
        options: FIELD_TYPE_OPTIONS,
      },
    },
    {
      title: '字段值',
      className: 'text-xs',
      dataIndex: 'value',
    },
    {
      title: '操作',
      className: 'text-xs',
      valueType: 'option',
      width: 150,
      render: (_text, record, _, action) => [
        <a key='editable' onClick={() => action?.startEditable?.(record.id!)}>
          编辑
        </a>,
        <a
          key='delete'
          onClick={() =>
            setDataSource(dataSource.filter((item) => item.id !== record.id))
          }
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <ConfigProvider renderEmpty={() => <EmptyTable />}>
      <EditableProTable<FieldType>
        rowKey='id'
        headerTitle='编辑模式切换'
        columns={columns}
        request={async () => ({
          data: value.map((item) => {
            return {
              ...item,
              id: item.id ? item.id : createEditableRowId(),
            };
          }),
          total: (value || []).length,
          success: true,
        })}
        value={dataSource}
        onChange={(newValue) => {
          const valueWithId = newValue.map((item) => {
            return {
              ...item,
              id: item.id ? item.id : createEditableRowId(),
            };
          });
          setDataSource(valueWithId);
          if (onValuesChange) {
            onValuesChange(valueWithId);
          }
        }}
        recordCreatorProps={{
          position: 'bottom',
          record: () => ({
            id: createEditableRowId(),
            name: '',
            fieldType: 'string',
            value: '',
          }),
          newRecordType: 'dataSource',
        }}
        editable={{
          type: 'multiple',
          editableKeys,
          onChange: setEditableRowKeys,
        }}
      />
    </ConfigProvider>
  );
};

export default FieldTable;

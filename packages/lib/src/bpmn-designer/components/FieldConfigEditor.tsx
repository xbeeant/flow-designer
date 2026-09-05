import { type ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Empty, Tooltip } from 'antd';
import { FolderOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import ToggleManualRule from '../properties/components/toggle-manual-rule.tsx';
import type { FieldPropertyConfig, XRenderFormField } from '../types';

interface FieldConfigEditorProps {
  fields: XRenderFormField[];
  onFieldConfigChange: (fieldKey: string, property: string, value: any) => void;
  onSave: () => Promise<void>;
  onCopy: () => void;
}

interface TableRecord extends XRenderFormField {}

function buildFieldTree(fields: XRenderFormField[]): XRenderFormField[] {
  const fieldMap = new Map<
    string,
    XRenderFormField & { children: XRenderFormField[] }
  >();

  for (const field of fields) {
    fieldMap.set(field.key, { ...field, children: [] });
  }

  for (const field of fields) {
    const fieldWithChildren = fieldMap.get(field.key);
    if (!fieldWithChildren) continue;

    if (field.parentKey) {
      const parent = fieldMap.get(field.parentKey);
      if (parent) {
        parent.children.push(fieldWithChildren);
      }
    }
  }

  return Array.from(fieldMap.values()).filter((field) => !field.parentKey);
}

const FieldConfigEditor: React.FC<FieldConfigEditorProps> = ({
  fields,
  onFieldConfigChange,
  onSave,
  onCopy,
}) => {
  const [saving, setSaving] = useState<boolean>(false);

  const fieldTree = useMemo(() => buildFieldTree(fields), [fields]);

  const tableData = useMemo((): TableRecord[] => {
    const buildRecords = (nodes: XRenderFormField[]): TableRecord[] => {
      return nodes.map((node) => ({
        ...node,
        key: node.key,
        children:
          node.children && node.children.length > 0
            ? buildRecords(node.children)
            : undefined,
      }));
    };
    return buildRecords(fieldTree);
  }, [fieldTree]);

  const handlePropertyChange = (
    fieldKey: string,
    property: keyof FieldPropertyConfig,
    value: boolean | string,
  ) => {
    onFieldConfigChange(fieldKey, property, value);
  };

  const columns: ProColumns<TableRecord>[] = [
    {
      title: '字段',
      dataIndex: 'title',
      ellipsis: true,
      key: 'title',
      render: (title, record) => (
        <div className='flex items-center gap-2'>
          {record.type === 'object' || record.type === 'array' ? (
            <FolderOpen className='w-4 h-4 text-blue-500' />
          ) : null}
          {title}
        </div>
      ),
    },
    {
      title: '隐藏',
      dataIndex: 'hidden',
      key: 'hidden',
      align: 'center',
      render: (_, record) => (
        <Tooltip title='隐藏'>
          <ToggleManualRule
            label='隐藏'
            value={record.hidden}
            onChange={(value) => {
              handlePropertyChange(record.key, 'hidden', value);
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: '只读',
      dataIndex: 'readOnly',
      key: 'readOnly',
      align: 'center',
      render: (_, record) => (
        <Tooltip title='只读'>
          <ToggleManualRule
            label='只读'
            value={record.readOnly}
            onChange={(value) => {
              handlePropertyChange(record.key, 'readOnly', value);
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      align: 'center',
      render: (_, record) => (
        <Tooltip title='必填'>
          <ToggleManualRule
            label='必填'
            value={record.required}
            onChange={(value) => {
              handlePropertyChange(record.key, 'required', value);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  if (fields.length === 0) {
    return (
      <Empty
        description={
          <span className='text-xs text-gray-400'>
            请在设计器中传入 表单设计器 属性以解析表单字段
          </span>
        }
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div>
      <ProTable
        expandable={{
          defaultExpandAllRows: true,
        }}
        classNames={{
          body: {
            cell: 'flow-field',
          },
        }}
        search={false}
        options={false}
        toolBarRender={() => {
          return [
            <Button
              key='import'
              loading={saving}
              onClick={() => {
                onCopy();
              }}
            >
              复制
            </Button>,
            onSave && (
              <Button
                key='save'
                loading={saving}
                onClick={() => {
                  setSaving(true);
                  onSave().then(() => setSaving(false));
                }}
              >
                保存
              </Button>
            ),
          ];
        }}
        dataSource={tableData}
        columns={columns}
        pagination={false}
        bordered
        size='small'
        rowKey='key'
        className='flow-field-config-table'
      />
    </div>
  );
};

export default FieldConfigEditor;

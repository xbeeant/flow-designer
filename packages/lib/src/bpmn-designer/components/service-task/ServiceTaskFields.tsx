import {
  ModalForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, Popconfirm, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Delete, Edit, Plus, Settings2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { generateId } from '../../util/random-char';

interface FieldItem {
  id: string;
  name: string;
  type: string;
  value: string;
}

interface ServiceTaskFieldsProps {
  element: ModdleElement;
  moddle: any;
  createModdleElement: (type: string, properties?: Record<string, any>) => any;
  updateModdleProperties: (
    element: ModdleElement,
    businessObject: any,
    properties: Record<string, any>,
  ) => void;
}

const FIELD_TYPES = [
  { value: 'string', label: 'String (stringValue)' },
  { value: 'expression', label: 'Expression' },
];

const ServiceTaskFields: React.FC<ServiceTaskFieldsProps> = ({
  element,
  moddle,
  createModdleElement,
  updateModdleProperties,
}) => {
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FieldItem | null>(null);
  const [form] = Form.useForm<FieldItem>();

  useEffect(() => {
    if (!element) {
      setFields([]);
      return;
    }

    const businessObject = getBusinessObject(element);
    const extensionElements = businessObject.extensionElements;
    const fieldItems: FieldItem[] = [];

    if (extensionElements && typeof extensionElements.get === 'function') {
      const flowableFields = extensionElements.get('flowable:field') || [];
      flowableFields.forEach((field: any) => {
        let type = '';
        let value = '';
        if (field.stringValue !== undefined) {
          type = 'string';
          value = field.stringValue;
        } else if (field.expression !== undefined) {
          type = 'expression';
          value = field.expression;
        } else if (field.string !== undefined) {
          type = 'string';
          value = field.string;
        } else if (field.value !== undefined) {
          type = 'string';
          value = field.value;
        }
        fieldItems.push({
          id: field.id || '',
          name: field.name || '',
          type,
          value,
        });
      });
    }
    setFields(fieldItems);
  }, [element]);

  const updateFields = (items: FieldItem[]) => {
    if (!element || !moddle) return;

    const businessObject = getBusinessObject(element);

    const moddleItems = items.map((item) => {
      const moddleItem = createModdleElement('flowable:Field', {
        id: item.id,
        name: item.name,
      })!;
      if (item.type === 'string') {
        moddleItem.stringValue = item.value;
      } else if (item.type === 'expression') {
        moddleItem.expression = item.value;
      }
      return moddleItem;
    });

    let extensionElements = businessObject.extensionElements;
    if (!extensionElements) {
      extensionElements = createModdleElement('bpmn:ExtensionElements')!;
    }

    const existingElements = extensionElements.values || [];
    const newElements = existingElements.filter(
      (el: any) => el.$type !== 'flowable:Field',
    );
    newElements.push(...moddleItems);

    extensionElements.values = newElements;

    updateModdleProperties(element, businessObject, {
      extensionElements,
    });
  };

  const handleAddField = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'string',
    });
    setModalVisible(true);
  };

  const handleEditField = (item: FieldItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleDeleteField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    updateFields(newFields);
  };

  const handleSubmitField = async (values: FieldItem) => {
    let newFields: FieldItem[];
    if (editingItem) {
      newFields = fields.map((item) =>
        item.id === editingItem.id ? values : item,
      );
    } else {
      newFields = [...fields, { ...values, id: generateId('Field') }];
    }

    setFields(newFields);
    updateFields(newFields);
    setModalVisible(false);
    setEditingItem(null);
    return true;
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  const columns: ColumnsType<FieldItem> = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
      className: 'text-gray-600 font-medium',
    },
    {
      title: '字段类型',
      dataIndex: 'type',
      key: 'type',
      className: 'text-gray-500',
      render: (type) => (type === 'expression' ? 'Expression' : 'String'),
    },
    {
      title: '字段值',
      dataIndex: 'value',
      key: 'value',
      className: 'text-gray-500',
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
            onClick={() => handleEditField(fields[index])}
          />
          <Popconfirm
            title='确定删除？'
            onConfirm={() => handleDeleteField(index)}
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
    <>
      <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
        <div className='flex items-center justify-between px-4 py-2.5 bg-linear-to-r from-orange-50 to-amber-50 border-b border-gray-100'>
          <div className='flex items-center'>
            <div className='w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white mr-2'>
              <Settings2 className='flow-icon-panel' />
            </div>
            <span className='text-sm font-semibold text-gray-700'>
              注入字段
            </span>
          </div>
          <Button
            type='primary'
            size='small'
            icon={<Plus className='flow-icon-button-sm text-white' />}
            onClick={handleAddField}
            className='bg-blue-500 hover:bg-blue-600 rounded-lg px-3'
          >
            创建字段
          </Button>
        </div>
        <div className='p-4'>
          <Table
            dataSource={fields}
            columns={columns}
            pagination={false}
            size='small'
            rowKey='id'
            bordered
            className='text-xs'
            locale={{ emptyText: '暂无数据' }}
          />
        </div>
      </div>

      <ModalForm<FieldItem>
        title={editingItem ? '编辑字段' : '创建字段'}
        open={modalVisible}
        form={form}
        onFinish={handleSubmitField}
        modalProps={{
          onCancel: handleModalClose,
          destroyOnClose: true,
          width: 450,
        }}
        layout='horizontal'
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <ProFormText
          name='name'
          label='字段名'
          placeholder='请输入字段名'
          rules={[{ required: true, message: '请输入字段名' }]}
          fieldProps={{
            size: 'small',
            className: 'rounded-lg border-gray-200',
          }}
        />

        <ProFormSelect
          name='type'
          label='字段类型'
          placeholder='选择字段类型'
          initialValue='string'
          options={FIELD_TYPES}
          fieldProps={{
            size: 'small',
            className: 'rounded-lg border-gray-200',
          }}
        />

        <ProFormDependency name={['type']}>
          {({ type }) => {
            const isExpression = type === 'expression';
            return (
              <ProFormText
                name='value'
                label='字段值'
                placeholder={isExpression ? '请输入表达式' : '请输入字段值'}
                rules={[{ required: true, message: '请输入字段值' }]}
                fieldProps={{
                  size: 'small',
                  className: 'rounded-lg border-gray-200',
                }}
              />
            );
          }}
        </ProFormDependency>
      </ModalForm>
    </>
  );
};

export default ServiceTaskFields;

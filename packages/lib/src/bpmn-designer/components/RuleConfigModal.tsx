import { Button, Form, Input, Modal, Select, Space, TreeSelect } from 'antd';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type {
  FieldRule,
  RuleAction,
  RuleOperator,
  XRenderFormField,
} from '../types';

interface RuleConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: FieldRule) => void;
  rule: FieldRule | null;
  fields: XRenderFormField[];
  currentFieldKey: string;
}

const OPERATORS: { value: RuleOperator; label: string }[] = [
  { value: '==', label: '等于' },
  { value: '!=', label: '不等于' },
  { value: '>', label: '大于' },
  { value: '<', label: '小于' },
  { value: '>=', label: '大于等于' },
  { value: '<=', label: '小于等于' },
  { value: 'contains', label: '包含' },
  { value: 'notContains', label: '不包含' },
  { value: 'isEmpty', label: '为空' },
  { value: 'isNotEmpty', label: '不为空' },
];

const ACTIONS: { value: RuleAction; label: string }[] = [
  { value: 'show', label: '显示字段' },
  { value: 'hide', label: '隐藏字段' },
  { value: 'enable', label: '启用编辑' },
  { value: 'disable', label: '禁用编辑' },
  { value: 'required', label: '设为必填' },
  { value: 'optional', label: '设为选填' },
];

interface TreeSelectNode {
  title: React.ReactNode;
  value: string;
  key: string;
  children?: TreeSelectNode[];
}

function buildTreeSelectData(
  fields: XRenderFormField[],
  excludeKey?: string,
): TreeSelectNode[] {
  const fieldMap = new Map<
    string,
    XRenderFormField & { children: XRenderFormField[] }
  >();

  for (const field of fields) {
    if (field.key === excludeKey) continue;
    fieldMap.set(field.key, { ...field, children: [] });
  }

  for (const field of fields) {
    if (field.key === excludeKey) continue;

    const fieldWithChildren = fieldMap.get(field.key);
    if (!fieldWithChildren) continue;

    if (field.parentKey) {
      const parent = fieldMap.get(field.parentKey);
      if (parent) {
        parent.children.push(fieldWithChildren);
      }
    }
  }

  const rootFields = Array.from(fieldMap.values()).filter(
    (field) => !field.parentKey,
  );

  const buildNodes = (nodes: XRenderFormField[]): TreeSelectNode[] => {
    return nodes.map((node) => {
      const childField = fieldMap.get(node.key);
      const typeLabel =
        node.type === 'object'
          ? '对象'
          : node.type === 'array'
            ? '数组'
            : node.type;
      return {
        title: (
          <span className='flex items-center gap-2'>
            {node.title}
            <span className='text-xs text-gray-400'>{typeLabel}</span>
          </span>
        ),
        value: node.key,
        key: node.key,
        children:
          childField?.children && childField.children.length > 0
            ? buildNodes(childField.children)
            : undefined,
      };
    });
  };

  return buildNodes(rootFields);
}

const RuleConfigModal: React.FC<RuleConfigModalProps> = ({
  open,
  onClose,
  onSave,
  rule,
  fields,
  currentFieldKey,
}) => {
  const [form] = Form.useForm<FieldRule>();
  const [operator, setOperator] = useState<RuleOperator>('==');

  const treeData = useMemo(() => {
    return buildTreeSelectData(fields, currentFieldKey);
  }, [fields, currentFieldKey]);

  useEffect(() => {
    if (open) {
      if (rule) {
        form.setFieldsValue(rule);
        setOperator(rule.operator);
      } else {
        form.setFieldsValue({
          id: `rule_${Date.now()}`,
          name: '',
          conditionField: '',
          operator: '==',
          conditionValue: '',
          action: 'show',
        });
        setOperator('==');
      }
    }
  }, [open, rule, form]);

  const handleOperatorChange = (value: RuleOperator) => {
    setOperator(value);
    form.setFieldsValue({ operator: value });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSave(values);
    });
  };

  return (
    <Modal
      open={open}
      title={rule ? '编辑联动规则' : '添加联动规则'}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type='primary' onClick={handleSubmit}>
            确定
          </Button>
        </Space>
      }
      width={520}
    >
      <Form form={form} layout='vertical' size='small'>
        <Form.Item
          name='name'
          label='规则名称'
          rules={[{ required: true, message: '请输入规则名称' }]}
        >
          <Input placeholder='如：当性别为男时显示' />
        </Form.Item>

        <Form.Item
          name='conditionField'
          label='触发字段'
          rules={[{ required: true, message: '请选择触发字段' }]}
        >
          <TreeSelect
            showSearch
            allowClear
            placeholder='选择触发条件的字段'
            treeDefaultExpandAll
            treeData={treeData}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name='operator'
          label='比较运算符'
          rules={[{ required: true, message: '请选择运算符' }]}
        >
          <Select
            value={operator}
            onChange={handleOperatorChange}
            placeholder='选择运算符'
          >
            {OPERATORS.map((op) => (
              <Select.Option key={op.value} value={op.value}>
                {op.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {operator !== 'isEmpty' && operator !== 'isNotEmpty' && (
          <Form.Item
            name='conditionValue'
            label='条件值'
            rules={[{ required: true, message: '请输入条件值' }]}
          >
            <Input placeholder='输入条件值' />
          </Form.Item>
        )}

        <Form.Item
          name='action'
          label='执行动作'
          rules={[{ required: true, message: '请选择执行动作' }]}
        >
          <Select placeholder='选择执行动作'>
            {ACTIONS.map((action) => (
              <Select.Option key={action.value} value={action.value}>
                {action.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RuleConfigModal;

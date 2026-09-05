import { ProFormText } from '@ant-design/pro-components';
import { Button, Form, Space } from 'antd';
import type React from 'react';

interface ArgumentItem {
  name: string;
  value: string;
}

interface ArgumentsListProps {
  name: string;
  label?: string;
  onUpdate: (key: string, value: string) => void;
}

const ArgumentsList: React.FC<ArgumentsListProps> = ({
  name,
  label = '参数',
  onUpdate,
}) => {
  const form = Form.useFormInstance();

  const handleArgumentsChange = (args: ArgumentItem[]) => {
    form.setFieldsValue({ [name]: args });
    args.forEach((arg) => {
      if (arg.name) {
        onUpdate(`arg_${arg.name}`, arg.value);
      }
    });
  };

  const addArgument = () => {
    const args = form.getFieldValue(name) || [];
    handleArgumentsChange([...args, { name: '', value: '' }]);
  };

  const removeArgument = (index: number) => {
    const args = form.getFieldValue(name) || [];
    const removedArg = args[index];
    if (removedArg.name) {
      onUpdate(`arg_${removedArg.name}`, '');
    }
    // @ts-expect-error
    handleArgumentsChange(args.filter((_, i) => i !== index));
  };

  const updateArgument = (
    index: number,
    field: 'name' | 'value',
    value: string,
  ) => {
    const args = form.getFieldValue(name) || [];
    const newArgs = [...args];
    const oldName = newArgs[index].name;
    newArgs[index][field] = value;
    handleArgumentsChange(newArgs);
    if (oldName && field === 'name' && oldName !== value) {
      onUpdate(`arg_${oldName}`, '');
    }
  };

  return (
    <Form.Item label={label}>
      <Form.List name={name}>
        {(fields, { remove }) => (
          <div>
            {fields && fields.length === 0 && (
              <Button size='small' onClick={addArgument}>
                添加
              </Button>
            )}
            {fields.map((field, index) => (
              <Space
                key={field.key}
                style={{ display: 'flex', marginBottom: 8 }}
                align='baseline'
              >
                <ProFormText
                  placeholder='参数名称'
                  {...field}
                  name={[field.name, 'name']}
                  label=''
                  fieldProps={{
                    onChange: (e) =>
                      updateArgument(index, 'name', e.target.value),
                  }}
                  style={{ marginBottom: 0, width: '200px' }}
                />
                <ProFormText
                  placeholder='参数值'
                  {...field}
                  name={[field.name, 'value']}
                  label=''
                  style={{ marginBottom: 0, width: '200px' }}
                  fieldProps={{
                    onChange: (e) =>
                      updateArgument(index, 'value', e.target.value),
                  }}
                />
                <Button.Group>
                  <Button size='small' onClick={addArgument}>
                    添加
                  </Button>
                  <Button
                    size='small'
                    danger
                    onClick={() => {
                      remove(index);
                      removeArgument(index);
                    }}
                  >
                    删除
                  </Button>
                </Button.Group>
              </Space>
            ))}
          </div>
        )}
      </Form.List>
    </Form.Item>
  );
};

export default ArgumentsList;

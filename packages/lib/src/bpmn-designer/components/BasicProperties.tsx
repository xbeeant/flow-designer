import { Empty, Form, Input } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Settings2 } from 'lucide-react';
import { useEffect } from 'react';

const { TextArea } = Input;

interface BasicPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
  onPropertyChange: (property: string, value: string) => void;
  labelPrefix?: string;
}

const BasicProperties: React.FC<BasicPropertiesProps> = ({
  element,
  onPropertyChange,
  labelPrefix = '',
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (element) {
      const obj = getBusinessObject(element);
      const documentationElements = obj.documentation || [];
      const docText =
        documentationElements.length > 0 ? documentationElements[0].text : '';
      form.setFieldsValue({
        id: obj.id || '',
        name: obj.name || '',
        documentation: docText,
      });
    }
  }, [element]);

  if (!element) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span className='text-xs text-gray-400'>请选择一个元素</span>
        }
      />
    );
  }

  return (
    <div className='space-y-3'>
      <Form
        form={form}
        labelCol={{
          span: 3,
        }}
        onValuesChange={(changedValues) => {
          Object.keys(changedValues).forEach((key) => {
            onPropertyChange(key, changedValues[key]);
          });
        }}
      >
        <Form.Item name='id' label='编号' rules={[{ required: true }]}>
          <Input size='small' placeholder='元素编号' />
        </Form.Item>
        <Form.Item
          name='name'
          label={`${labelPrefix}名称`}
          rules={[{ required: true }]}
        >
          <Input size='small' placeholder='元素名称' />
        </Form.Item>
        <Form.Item name='documentation' label='描述'>
          <TextArea size='small' rows={3} placeholder='描述信息' />
        </Form.Item>
      </Form>
    </div>
  );
};

export const BasicPropertiesPanel = {
  key: 'basic',
  label: (
    <span className='flex items-center gap-2 text-gray-600 font-medium'>
      <Settings2 className='flow-icon-panel text-blue-500' />
      基本属性
    </span>
  ),
};

export default BasicProperties;

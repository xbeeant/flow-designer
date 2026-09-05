import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';

export const DATA_TYPES = [
  { value: 'xsd:string', label: 'String' },
  { value: 'xsd:long', label: 'Long' },
  { value: 'xsd:integer', label: 'Integer' },
  { value: 'xsd:boolean', label: 'Boolean' },
  { value: 'xsd:date', label: 'Date' },
  { value: 'xsd:double', label: 'Double' },
];

export interface DataObjectItem {
  id: string;
  name: string;
  itemSubjectRef: string;
  value: string;
}

const DataObjectModal = ({
  visible,
  onCancel,
  onOk,
  value,
}: {
  visible: boolean;
  onCancel: () => void;
  value?: DataObjectItem;
  onOk: (values: DataObjectItem) => void;
}) => {
  const [form] = Form.useForm();

  return (
    <ModalForm
      initialValues={value || {}}
      form={form}
      title='数据对象'
      open={visible}
      modalProps={{
        onCancel: onCancel,
        destroyOnHidden: true,
      }}
      onFinish={async (values) => {
        onOk(values);
      }}
      layout={'horizontal'}
      labelCol={{
        span: 4,
      }}
      width={400}
    >
      <ProFormText name='name' label='名称' rules={[{ required: true }]} />
      <ProFormSelect
        name='itemSubjectRef'
        rules={[{ required: true }]}
        label='类型'
        options={DATA_TYPES}
      />
      <ProFormDependency name={['itemSubjectRef']}>
        {({ itemSubjectRef }) => {
          switch (itemSubjectRef) {
            case 'xsd:boolean':
              return (
                <ProFormRadio.Group
                  name='value'
                  label='值'
                  options={[
                    { value: 'true', label: 'True' },
                    { value: 'false', label: 'False' },
                  ]}
                />
              );
            case 'xsd:double':
              return <ProFormDigit name='value' label='值' />;
            case 'xsd:integer':
              return (
                <ProFormDigit
                  name='value'
                  label='值'
                  fieldProps={{ precision: 0 }}
                />
              );
            case 'xsd:long':
              return (
                <ProFormDigit
                  name='value'
                  label='值'
                  fieldProps={{ precision: 0 }}
                />
              );
            case 'xsd:date':
              return <ProFormDateTimePicker name='value' label='值' />;
            default:
              return <ProFormText name='value' label='值' />;
          }
        }}
      </ProFormDependency>
    </ModalForm>
  );
};

export default DataObjectModal;

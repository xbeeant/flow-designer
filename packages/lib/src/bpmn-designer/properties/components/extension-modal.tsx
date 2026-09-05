import {
  ModalForm,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ExtensionPropertyItem } from '../../hooks/useExtensions';

const ExtensionModal = ({
  value,
  visible,
  onCancel,
  onSave,
}: {
  value?: ExtensionPropertyItem;
  visible: boolean;
  onCancel: () => void;
  onSave: (values: ExtensionPropertyItem) => void;
}) => {
  const [form] = Form.useForm();

  return (
    <ModalForm<ExtensionPropertyItem>
      form={form}
      layout='vertical'
      classNames={{ content: 'space-y-4' }}
      initialValues={value || { type: 'normal', name: '', value: '' }}
      title={value ? '编辑扩展属性' : '添加扩展属性'}
      open={visible}
      modalProps={{
        onCancel,
        destroyOnClose: true,
        width: 500,
      }}
      onFinish={async (values) => {
        onSave(values as ExtensionPropertyItem);
      }}
    >
      <ProFormSelect
        name='type'
        label='属性类型'
        initialValue='normal'
        options={[
          { label: '常规', value: 'normal' },
          { label: '标准时长', value: 'standardDuration' },
          { label: '时间规则', value: 'timerDuration' },
        ]}
      />

      <ProFormDependency name={['type']}>
        {({ type }) => {
          switch (type) {
            case 'standardDuration': {
              return (
                <ProFormDigit
                  name='value'
                  label='时长（天）'
                  placeholder='请输入时长（天）'
                  fieldProps={{
                    min: 0,
                    step: 0.1,
                    precision: 1,
                    suffix: '工作日',
                  }}
                  rules={[{ required: true, message: '请输入时长' }]}
                />
              );
            }
            case 'timerDuration': {
              return (
                <>
                  <ProFormDigit
                    name={['value', 'timeDuration']}
                    label='限定时间'
                    rules={[{ required: true, message: '请输入限定时间' }]}
                  />
                  <ProFormSelect
                    name={['value', 'timeDurationType']}
                    label='时间单位'
                    options={[
                      { value: 'D', label: '天(24H)' },
                      { value: 'H', label: '小时' },
                      { value: 'M', label: '分钟' },
                    ]}
                    rules={[{ required: true, message: '请选择时间单位' }]}
                  />
                  <ProFormSelect
                    name={['value', 'businessType']}
                    label='处理方式'
                    rules={[{ required: true }]}
                    options={[
                      { value: 'notice_assignee', label: '自动提醒处理人' },
                      {
                        value: 'notice_start_user',
                        label: '自动提醒发起人',
                      },
                      { value: 'auto_agree', label: '自动同意' },
                      { value: 'auto_close', label: '自动结束' },
                    ]}
                  />
                  <ProFormSelect
                    name={['value', 'durationBusinessCalendar']}
                    label='工作日历'
                    rules={[{ required: true }]}
                    options={[
                      { value: 'default', label: '是' },
                      { value: '', label: '否' },
                    ]}
                  />
                </>
              );
            }
            default: {
              return (
                <>
                  <ProFormText
                    name='name'
                    label='名称'
                    placeholder='属性名称'
                    rules={[{ required: true, message: '请输入名称' }]}
                  />
                  <ProFormText
                    name='value'
                    label='值'
                    placeholder='属性值'
                    rules={[{ required: true, message: '请输入值' }]}
                  />
                </>
              );
            }
          }
        }}
      </ProFormDependency>
    </ModalForm>
  );
};

export default ExtensionModal;

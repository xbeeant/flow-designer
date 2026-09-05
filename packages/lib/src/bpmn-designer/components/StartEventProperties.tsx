import { ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { FileInput } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';

interface StartEventPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const StartEventProperties: React.FC<StartEventPropertiesProps> = ({
  modeler,
  element,
}) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        initiator: 'initiator',
        formKey: '',
        formHandlerClass: '',
      });
      return;
    }
    const bo = getBusinessObject(element);
    form.setFieldsValue({
      initiator: bo.initiator || 'initiator',
      formKey: bo.formKey || '',
      formHandlerClass: bo.formHandlerClass || '',
    });
  }, [element, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element) return;
    updateModdleProperties(element, getBusinessObject(element), changedValues);
  };

  return (
    <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
      <div className='flex items-center px-3 py-2 bg-linear-to-r from-green-50 to-emerald-50 border-b border-gray-100'>
        <FileInput className='flow-icon-panel text-green-500 mr-1.5' />
        <span className='text-sm font-medium text-gray-700'>开始事件配置</span>
      </div>
      <div className='p-3'>
        <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
          <ProFormText
            name='initiator'
            label='启动人变量'
            placeholder='存储启动用户ID的变量名'
            tooltip='flowable:initiator'
          />
          <ProFormText
            name='formKey'
            label='表单Key'
            placeholder='启动表单的 Key'
            tooltip='flowable:formKey'
          />
          <ProFormText
            name='formHandlerClass'
            label='表单处理类'
            placeholder='Java类全限定名'
            tooltip='flowable:formHandlerClass'
          />
        </Form>
      </div>
    </div>
  );
};

export const StartEventPropertiesPanel = {
  key: 'startEvent',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <FileInput className='flow-icon-panel' />
      开始事件配置
    </span>
  ),
};

export default StartEventProperties;

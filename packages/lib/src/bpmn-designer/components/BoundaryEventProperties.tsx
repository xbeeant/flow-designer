import { ProFormSwitch } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { OctagonX } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';

/** 边界事件：可中断性由取消活动（attachedToRef 上的 eventDefinitions 结构）控制未实现完整，这里提供 cancelActivity */
interface BoundaryEventPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const BoundaryEventProperties: React.FC<BoundaryEventPropertiesProps> = ({
  modeler,
  element,
}) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({ cancelActivity: true });
      return;
    }
    const bo = getBusinessObject(element);
    form.setFieldsValue({
      cancelActivity: bo.cancelActivity !== false,
    });
  }, [element, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element) return;
    updateModdleProperties(element, getBusinessObject(element), changedValues);
  };

  return (
    <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
      <div className='flex items-center px-3 py-2 bg-linear-to-r from-red-50 to-rose-50 border-b border-gray-100'>
        <OctagonX className='flow-icon-panel text-red-500 mr-1.5' />
        <span className='text-sm font-medium text-gray-700'>边界事件配置</span>
      </div>
      <div className='p-3'>
        <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
          <ProFormSwitch
            name='cancelActivity'
            label='取消活动（可中断）'
            tooltip='false 时表示非中断边界事件'
          />
        </Form>
      </div>
    </div>
  );
};

export const BoundaryEventPropertiesPanel = {
  key: 'boundaryEvent',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <OctagonX className='flow-icon-panel' />
      边界事件配置
    </span>
  ),
};

export default BoundaryEventProperties;

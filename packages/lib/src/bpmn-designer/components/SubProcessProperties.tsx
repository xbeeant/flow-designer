import { ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { GitFork, Layers, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';

interface SubProcessPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const SubProcessProperties: React.FC<SubProcessPropertiesProps> = ({
  modeler,
  element,
}) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  const isAdHoc = element?.businessObject?.$type === 'bpmn:AdHocSubProcess';

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        triggeredByEvent: false,
        cancelRemainingInstances: true,
        ordering: 'Parallel',
      });
      return;
    }

    const bo = getBusinessObject(element);
    form.setFieldsValue({
      triggeredByEvent: !!bo.triggeredByEvent,
      cancelRemainingInstances: bo.cancelRemainingInstances !== false,
      ordering: bo.ordering || 'Parallel',
    });
  }, [element, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element) return;
    const bo = getBusinessObject(element);
    updateModdleProperties(element, bo, changedValues);
  };

  return (
    <div className='space-y-3'>
      {!isAdHoc && (
        <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
          <div className='flex items-center px-3 py-2 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100'>
            <Layers className='flow-icon-panel text-blue-500 mr-1.5' />
            <span className='text-sm font-medium text-gray-700'>
              子流程配置
            </span>
          </div>
          <div className='p-3'>
            <Form
              form={form}
              layout='vertical'
              onValuesChange={handleValuesChange}
            >
              <ProFormSwitch
                name='triggeredByEvent'
                label='事件驱动'
                tooltip='flowable:triggeredByEvent - 作为事件子流程'
              />
            </Form>
          </div>
        </div>
      )}

      {isAdHoc && (
        <>
          <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
            <div className='flex items-center px-3 py-2 bg-linear-to-r from-orange-50 to-amber-50 border-b border-gray-100'>
              <GitFork className='flow-icon-panel text-orange-500 mr-1.5' />
              <span className='text-sm font-medium text-gray-700'>
                AdHoc 子流程
              </span>
            </div>
            <div className='p-3'>
              <Form
                form={form}
                layout='vertical'
                onValuesChange={handleValuesChange}
              >
                <ProFormSwitch
                  name='cancelRemainingInstances'
                  label='取消剩余实例'
                  tooltip='flowable:cancelRemainingInstances - 流程实例结束时取消其余活跃实例'
                />
                <ProFormSelect
                  name='ordering'
                  label='执行顺序'
                  options={[
                    { value: 'Parallel', label: '并行' },
                    { value: 'Sequential', label: '串行' },
                  ]}
                  tooltip='flowable:ordering'
                />
              </Form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const EventBasedGatewayProperties: React.FC<
  SubProcessPropertiesProps
> = ({ modeler, element }) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({ instantiate: false });
      return;
    }
    const bo = getBusinessObject(element);
    form.setFieldsValue({ instantiate: !!bo.instantiate });
  }, [element, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element) return;
    updateModdleProperties(element, getBusinessObject(element), changedValues);
  };

  return (
    <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
      <div className='flex items-center px-3 py-2 bg-linear-to-r from-emerald-50 to-teal-50 border-b border-gray-100'>
        <Zap className='flow-icon-panel text-emerald-500 mr-1.5' />
        <span className='text-sm font-medium text-gray-700'>事件网关</span>
      </div>
      <div className='p-3'>
        <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
          <ProFormSwitch
            name='instantiate'
            label='实例化'
            tooltip='flowable:instantiate - 事件网关启动新流程实例'
          />
        </Form>
      </div>
    </div>
  );
};

export const SubProcessPropertiesPanel = {
  key: 'subProcess',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <Layers className='flow-icon-panel' />
      子流程配置
    </span>
  ),
};

export const EventBasedGatewayPropertiesPanel = {
  key: 'eventBasedGateway',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <GitFork className='flow-icon-panel' />
      事件网关配置
    </span>
  ),
};

export default SubProcessProperties;

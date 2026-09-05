import { Checkbox, Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Puzzle } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';

interface FeatureItemsProps {
  modeler: Modeler;
  element: ModdleElement;
}

const FEATURE_ITEMS = [
  { value: 'approve', label: '审批' },
  { value: 'sign', label: '签收' },
  { value: 'transfer', label: '转办' },
  { value: 'save', label: '暂存' },
  { value: 'addSign', label: '加签' },
  { value: 'reject', label: '驳回' },
  { value: 'withdraw', label: '撤回' },
  { value: 'forward', label: '转阅' },
  { value: 'delegate', label: '委派' },
];

const FeatureItems: React.FC<FeatureItemsProps> = ({ modeler, element }) => {
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({ featureItems: [] });
      return;
    }

    const businessObject = getBusinessObject(element);
    const featureItemsStr = businessObject.featureItems || '';
    form.setFieldsValue({
      featureItems: featureItemsStr ? featureItemsStr.split(',') : [],
    });
  }, [element, form]);

  const handleValuesChange = (
    _: Record<string, any>,
    allValues: Record<string, any>,
  ) => {
    if (!element) return;
    const businessObject = getBusinessObject(element);
    const featureItems = allValues.featureItems || [];
    updateModdleProperties(element, businessObject, {
      featureItems: featureItems.join(','),
    });
  };

  const handleCheckboxChange = (checkedValues: string[]) => {
    form.setFieldsValue({ featureItems: checkedValues });
  };

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
      <Form.Item name='featureItems'>
        <div className='flex flex-wrap gap-x-6 gap-y-2 justify-items-start px-2 py-1'>
          {FEATURE_ITEMS.map((item) => {
            const fieldValue =
              (form.getFieldValue('featureItems') as string[]) || [];
            return (
              <span
                key={item.value}
                className='inline-flex items-center gap-1.5 cursor-pointer select-none'
              >
                <Checkbox
                  checked={fieldValue.includes(item.value)}
                  onChange={(e) => {
                    const currentValue =
                      (form.getFieldValue('featureItems') as string[]) || [];
                    const newValue = e.target.checked
                      ? [...currentValue, item.value]
                      : currentValue.filter((v) => v !== item.value);
                    handleCheckboxChange(newValue);
                  }}
                >
                  <span className='text-sm text-gray-600'>{item.label}</span>
                </Checkbox>
              </span>
            );
          })}
        </div>
      </Form.Item>
    </Form>
  );
};

export const FeatureItemsPanel = {
  key: 'feature-items',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <Puzzle className='flow-icon-panel' />
      功能项
    </span>
  ),
};

export default FeatureItems;

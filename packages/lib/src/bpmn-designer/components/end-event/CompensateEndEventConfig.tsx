import { ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../../hooks/useModelerUpdate';

interface CompensateEndEventConfigProps {
  modeler: Modeler;
  eventDefinition: ModdleElement;
  element: ModdleElement;
}

const CompensateEndEventConfig: React.FC<CompensateEndEventConfigProps> = ({
  modeler,
  eventDefinition,
  element,
}) => {
  const { updateModdleProperties, createModdleElement } = useModelerUpdate({
    modeler,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!eventDefinition) {
      form.setFieldsValue({ waitForCompletion: false, activityRef: '' });
      return;
    }
    form.setFieldsValue({
      waitForCompletion: getWaitForCompletionFromExtension(eventDefinition),
      activityRef: getActivityRefFromExtension(eventDefinition) || '',
    });
  }, [eventDefinition, form]);

  const getActivityRefFromExtension = (def: any): string => {
    const extensionElements = def.get('extensionElements');
    if (!extensionElements) return '';

    const values = extensionElements.get('values') || [];
    const activityRefEl = values.find(
      (el: any) => el.$type === 'design:ActivityRef',
    );
    return activityRefEl?.value || '';
  };

  const getWaitForCompletionFromExtension = (def: any): boolean => {
    const extensionElements = def.get('extensionElements');
    if (!extensionElements) return false;

    const values = extensionElements.get('values') || [];
    const waitForCompletionEl = values.find(
      (el: any) => el.$type === 'design:WaitForCompletion',
    );
    return waitForCompletionEl?.value === 'true';
  };

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element || !eventDefinition) return;

    let extensionElements = eventDefinition.get('extensionElements');
    if (!extensionElements) {
      extensionElements = createModdleElement('bpmn:ExtensionElements');
    }

    let values = extensionElements.get('values') || [];
    values = values.filter(
      (el: any) =>
        el.$type !== 'design:ActivityRef' &&
        el.$type !== 'design:WaitForCompletion',
    );

    if (changedValues.activityRef !== undefined) {
      const activityRef = changedValues.activityRef;
      if (activityRef && activityRef.trim() !== '') {
        const activityRefEl = createModdleElement('design:ActivityRef', {
          value: activityRef,
        });
        values.push(activityRefEl);
      }
    }

    if (changedValues.waitForCompletion !== undefined) {
      const waitForCompletionEl = createModdleElement(
        'design:WaitForCompletion',
        {
          value: changedValues.waitForCompletion ? 'true' : 'false',
        },
      );
      values.push(waitForCompletionEl);
    }

    extensionElements.set('values', values);
    updateModdleProperties(element, eventDefinition, { extensionElements });
  };

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
      <ProFormSwitch name='waitForCompletion' label='等待完成' />
      <ProFormText
        name='activityRef'
        label='活动引用'
        placeholder='活动ID'
        fieldProps={{
          prefix: <RefreshCw className='flow-icon-button-sm text-gray-400' />,
        }}
      />
    </Form>
  );
};

export default CompensateEndEventConfig;

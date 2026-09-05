import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Users } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';

interface MultiInstancePropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const INSTANCE_TYPES = [
  { value: 'none', label: '无' },
  { value: 'parallel', label: '并行' },
  { value: 'sequential', label: '串行' },
];

const COMPLETION_CONDITIONS = [
  { value: 'all', label: '全部完成' },
  { value: 'percentage', label: '完成百分比' },
  { value: 'count', label: '完成数' },
  { value: 'expression', label: '表达式' },
];

const MultiInstanceProperties: React.FC<MultiInstancePropertiesProps> = ({
  modeler,
  element,
}) => {
  const [form] = ProForm.useForm();
  const { updateProperties, updateModdleProperties, createModdleElement } =
    useModelerUpdate({ modeler });

  const loopCharacteristics = useMemo(() => {
    if (!element) return null;
    const businessObject = getBusinessObject(element);
    return businessObject.loopCharacteristics || null;
  }, [element]);

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        instanceType: 'none',
        loopCardinality: '',
        collection: '',
        elementVariable: '',
        noWaitStatesAsyncLeave: false,
        completionCondition: 'all',
        completionPercentage: undefined,
        completionCount: undefined,
        completionExpression: '',
      });
      return;
    }

    const lcProps = loopCharacteristics;
    let instanceType = 'none';
    let loopCardinality = '';
    let collection = '';
    let elementVariable = '';
    let completionCondition = 'all';
    let completionPercentage: number | undefined;
    let completionCount: number | undefined;
    let completionExpression = '';
    let noWaitStatesAsyncLeave = false;

    if (lcProps) {
      if (lcProps.$type === 'bpmn:StandardLoopCharacteristics') {
        instanceType = 'standard';
      } else if (lcProps.$type === 'bpmn:MultiInstanceLoopCharacteristics') {
        instanceType = lcProps.isSequential ? 'sequential' : 'parallel';
        noWaitStatesAsyncLeave = !!lcProps.noWaitStatesAsyncLeave;
        loopCardinality =
          lcProps.loopCardinality?.body ||
          lcProps.loopCardinality?.text ||
          lcProps.loopCardinality ||
          '';
        collection = lcProps.collection || '';
        elementVariable = lcProps.elementVariable || '';

        const condition = lcProps.completionCondition;
        if (condition) {
          const conditionText =
            typeof condition === 'string'
              ? condition
              : condition.text || condition.body || '';
          if (
            conditionText.includes('nrOfCompletedInstances / nrOfInstances')
          ) {
            const match = conditionText.match(/(\d+)/);
            completionCondition = 'percentage';
            completionPercentage = match ? parseInt(match[1], 10) : undefined;
          } else if (conditionText.includes('nrOfCompletedInstances >= ')) {
            const match = conditionText.match(
              /nrOfCompletedInstances >= (\d+)/,
            );
            completionCondition = 'count';
            completionCount = match ? parseInt(match[1], 10) : undefined;
          } else if (conditionText !== '') {
            completionCondition = 'expression';
            completionExpression = conditionText;
          }
        }
      }
    }

    form.setFieldsValue({
      instanceType,
      loopCardinality,
      collection,
      elementVariable,
      noWaitStatesAsyncLeave,
      completionCondition,
      completionPercentage,
      completionCount,
      completionExpression,
    });
  }, [element, form, loopCharacteristics]);

  const handleValuesChange = useCallback(
    (changedValues: Record<string, any>) => {
      if (!element) return;

      const businessObject = getBusinessObject(element);
      const lcProps = businessObject.loopCharacteristics;

      Object.keys(changedValues).forEach((key) => {
        const changedValue = changedValues[key];
        console.log('properties', key, changedValue);

        switch (key) {
          case 'instanceType':
            {
              if (changedValue === 'none') {
                updateProperties(element, {
                  loopCharacteristics: null,
                });
                return;
              }

              if (changedValue === 'standard') {
                const loopCharacteristicsObject = createModdleElement(
                  'bpmn:StandardLoopCharacteristics',
                  {},
                );
                if (loopCharacteristicsObject) {
                  updateProperties(element, {
                    loopCharacteristics: loopCharacteristicsObject,
                  });
                }
                return;
              }

              const newLcProps = createModdleElement(
                'bpmn:MultiInstanceLoopCharacteristics',
                {
                  isSequential: changedValue === 'sequential',
                },
              );
              if (newLcProps) {
                updateProperties(element, {
                  loopCharacteristics: newLcProps,
                });
              }
            }
            break;
          case 'loopCardinality': {
            let loopCardinality = null;
            if (changedValue?.length) {
              loopCardinality = createModdleElement('bpmn:FormalExpression', {
                body: changedValue,
              });
            }
            updateModdleProperties(element, lcProps, {
              loopCardinality,
            });
            break;
          }
          case 'collection':
          case 'elementVariable':
          case 'noWaitStatesAsyncLeave': {
            updateModdleProperties(element, lcProps, {
              [key]: changedValue || null,
            });
            break;
          }

          case 'completionCondition': {
            if (changedValue === 'all') {
              updateModdleProperties(element, lcProps, {
                completionCondition: null,
              });
            }
            break;
          }
          case 'completionPercentage': {
            const conditionText = `\${nrOfCompletedInstances / nrOfInstances >= ${changedValue} / 100}`;
            const completionCondition = createModdleElement(
              'bpmn:FormalExpression',
              {
                body: conditionText,
              },
            );
            updateModdleProperties(element, lcProps, {
              completionCondition,
            });
            break;
          }
          case 'completionCount': {
            const conditionText = `\${nrOfCompletedInstances >= ${changedValue}}`;
            const completionCondition = createModdleElement(
              'bpmn:FormalExpression',
              {
                body: conditionText,
              },
            );
            updateModdleProperties(element, lcProps, {
              completionCondition,
            });
            break;
          }
          case 'completionExpression': {
            let completionCondition = null;
            if (changedValue?.length) {
              completionCondition = createModdleElement(
                'bpmn:FormalExpression',
                {
                  body: changedValue,
                },
              );
            }
            updateModdleProperties(element, lcProps, {
              completionCondition,
            });
            break;
          }
          default:
            console.warn('unsupported key', key);
        }
      });
    },
    [element, updateProperties, updateModdleProperties, createModdleElement],
  );

  return (
    <ProForm
      form={form}
      layout='horizontal'
      labelCol={{ style: { width: 80, flexShrink: 0 } }}
      wrapperCol={{ flex: 1 }}
      onValuesChange={handleValuesChange}
      className='space-y-3'
      size='small'
      submitter={false}
    >
      <ProFormRadio.Group
        name='instanceType'
        label='多实例类型'
        options={INSTANCE_TYPES}
        className='w-full'
        fieldProps={{ buttonStyle: 'solid' }}
      />

      <ProFormDependency name={['instanceType']}>
        {({ instanceType }) => {
          if (instanceType === 'none' || instanceType === 'standard')
            return null;

          return (
            <>
              <ProFormText
                name='loopCardinality'
                label='循环基数'
                placeholder='指定循环次数，如: ${count}'
              />

              <ProFormText
                name='collection'
                label='集合'
                placeholder='指定迭代集合，如: ${users}'
              />

              <ProFormText
                name='elementVariable'
                label='元素变量'
                placeholder='存储每次迭代元素的变量名'
              />

              <ProFormSwitch
                name='noWaitStatesAsyncLeave'
                label='异步离开'
                tooltip='flowable:noWaitStatesAsyncLeave，多实例不等待异步状态完成即继续执行后续节点'
              />

              <ProFormRadio.Group
                name='completionCondition'
                label='完成条件'
                options={COMPLETION_CONDITIONS}
                className='w-full'
                fieldProps={{ buttonStyle: 'solid' }}
              />

              <ProFormDependency name={['completionCondition']}>
                {({ completionCondition }) => {
                  if (completionCondition === 'percentage') {
                    return (
                      <ProFormDigit
                        name='completionPercentage'
                        label='百分比数值'
                        placeholder='输入百分比值，如: 50'
                        fieldProps={{ precision: 0, suffix: '%' }}
                        max={100}
                        step={1}
                      />
                    );
                  }

                  if (completionCondition === 'count') {
                    return (
                      <ProFormDigit
                        name='completionCount'
                        label='完成数值'
                        fieldProps={{ precision: 0 }}
                        max={100}
                        step={1}
                        placeholder='输入完成数量值，如: 3'
                      />
                    );
                  }

                  if (completionCondition === 'expression') {
                    return (
                      <ProFormText
                        name='completionExpression'
                        label='表达式'
                        placeholder='如: ${nrOfCompletedInstances >= 1}'
                      />
                    );
                  }

                  return null;
                }}
              </ProFormDependency>
            </>
          );
        }}
      </ProFormDependency>
    </ProForm>
  );
};

export const MultiInstancePropertiesPanel = {
  key: 'multiInstance',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <Users className='flow-icon-panel' />
      多实例
    </span>
  ),
};

export default MultiInstanceProperties;

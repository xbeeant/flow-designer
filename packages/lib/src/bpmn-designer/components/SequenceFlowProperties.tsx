import {
  ProFormDependency,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { GitBranch } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';
import { isGatewayElement } from '../util/bpmn-helper.ts';

type FlowType = 'normal' | 'default' | 'condition';

interface SequenceFlowPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const SequenceFlowProperties: React.FC<SequenceFlowPropertiesProps> = ({
  modeler,
  element,
}) => {
  const [form] = Form.useForm();
  const { updateModdleProperties, createModdleElement, getElementById, fire } =
    useModelerUpdate({
      modeler,
    });

  useEffect(() => {
    if (!element || !modeler) {
      form.setFieldsValue({
        flowType: 'normal' as FlowType,
        condition: '',
        skipExpression: '',
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    const conditionExpression = businessObject.conditionExpression;
    let isDefault = false;
    // 获取连接的网关节点
    const sourceEl = getSourceElement();
    if (sourceEl) {
      isDefault = getBusinessObject(sourceEl).default?.id === element.id;
    }

    let flowType: FlowType = 'normal';
    let condition = '';

    if (conditionExpression?.body) {
      flowType = 'condition';
      condition = conditionExpression.body;
    } else if (isDefault) {
      flowType = 'default';
    }

    form.setFieldsValue({
      flowType,
      condition,
      skipExpression: businessObject.skipExpression || '',
    });
  }, [element]);

  const getSourceElement = () => {
    if (!element) return null;
    const businessObject = getBusinessObject(element);
    const sourceRef = businessObject.sourceRef;
    if (sourceRef?.id) {
      return getElementById(sourceRef.id) || sourceRef;
    }
    return null;
  };

  const clearGatewayDefault = (gatewayElement: ModdleElement) => {
    const gatewayBo = getBusinessObject(gatewayElement);
    // 如果当前没有默认流转，则无需操作
    if (!gatewayBo.default) return;

    // 使用 updateModdleProperties 清除嵌套的 default 引用
    updateModdleProperties(gatewayElement, gatewayBo, {
      default: undefined,
    });

    fire('elements.changed', { elements: [element, gatewayElement] });
  };

  const setGatewayDefault = (gatewayElement: ModdleElement) => {
    const gatewayBo = getBusinessObject(gatewayElement);

    // 核心修复：使用 updateModdleProperties 更新网关的 default 属性
    // 传入真实的 SequenceFlow Business Object，bpmn-js 会自动处理 XML 引用
    updateModdleProperties(gatewayElement, gatewayBo, {
      default: element,
    });
    fire('elements.changed', { elements: [element, gatewayElement] });
  };

  const handleUpdate = (key: string, value: any) => {
    if (!element) return;
    const businessObject = getBusinessObject(element);

    if (key === 'flowType') {
      const flowType = value as FlowType;
      const sourceElement = getSourceElement();

      if (sourceElement && isGatewayElement(sourceElement)) {
        if (flowType === 'default') {
          setGatewayDefault(sourceElement);
        } else {
          // 如果当前网关的默认流转正好是这条线，则清除
          if (
            getBusinessObject(sourceElement).default?.id === businessObject.id
          ) {
            clearGatewayDefault(sourceElement);
          }
        }
      }
    } else if (key === 'condition') {
      const flowType = form.getFieldValue('flowType') as FlowType;
      if (flowType !== 'condition') return;

      let conditionExpression: string | undefined;
      if (value && value.trim() !== '') {
        conditionExpression = createModdleElement('bpmn:FormalExpression', {
          body: value,
        });
      }

      // 条件表达式也是嵌套属性，必须使用 updateModdleProperties
      updateModdleProperties(element, businessObject, {
        conditionExpression,
      });
    } else if (key === 'skipExpression') {
      updateModdleProperties(element, businessObject, {
        skipExpression: value || undefined,
      });
    }
  };

  return (
    <Form
      form={form}
      onValuesChange={(changedValues) => {
        Object.keys(changedValues).forEach((key) => {
          handleUpdate(key, changedValues[key]);
        });
      }}
    >
      <ProFormRadio.Group
        label='流转类型'
        name='flowType'
        options={[
          { value: 'normal', label: '普通' },
          { value: 'default', label: '默认' },
          { value: 'condition', label: '条件' },
        ]}
      />
      <ProFormDependency name={['flowType']}>
        {({ flowType }) => {
          if (flowType === 'condition') {
            return (
              <ProFormTextArea
                label='表达式'
                name='condition'
                placeholder='{variable == "value"}'
                rows={3}
                rules={[
                  {
                    required: true,
                  },
                ]}
                extra="使用表达式语言，例如: ${status == 'approved'}"
              />
            );
          }
          return null;
        }}
      </ProFormDependency>
      <ProFormText
        label='跳过表达式'
        name='skipExpression'
        placeholder='如: ${initiator == "admin"}'
        tooltip='flowable:skipExpression - 条件为 true 时跳过该顺序流'
      />
    </Form>
  );
};

export const SequenceFlowPropertiesPanel = {
  key: 'sequenceFlow',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <GitBranch className='flow-icon-panel' />
      流转条件
    </span>
  ),
};

export default SequenceFlowProperties;

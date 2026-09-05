import {
  ProForm,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { FileText, History, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';
import { getExtensionElementMap } from '../util/extension-elements';

interface ProcessPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
  onPropertyChange: (property: string, value: string | boolean) => void;
}

const HISTORY_LEVEL_OPTIONS = [
  { value: 'none', label: 'None - 不记录（性能最佳）' },
  { value: 'instance', label: 'Instance - 仅流程实例' },
  { value: 'task', label: 'Task - 任务级别' },
  { value: 'activity', label: 'Activity - 节点活动' },
  { value: 'audit', label: 'Audit - 审计跟踪' },
  { value: 'full', label: 'Full - 全部细节' },
];

/** 流程高级属性：Flowable 特有流程级扩展（属性/扩展元素形式存储） */
const ProcessAdvancedInfo: React.FC<ProcessPropertiesProps> = ({
  modeler,
  element,
}) => {
  const { updateModdleProperties, createModdleElement } = useModelerUpdate({
    modeler,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element || !modeler) {
      form.setFieldsValue({
        versionTag: '',
        historyTimeToLive: '',
        isStartableInTasklist: false,
        historyLevel: '',
        failedJobRetryTimeCycle: '',
      });
      return;
    }

    const processData = getBusinessObject(element);
    const extensionElements = processData.extensionElements;
    const elementMap = getExtensionElementMap(extensionElements);

    form.setFieldsValue({
      versionTag: processData.versionTag || '',
      historyTimeToLive: processData.historyTimeToLive || '',
      isStartableInTasklist: !!processData.isStartableInTasklist,
      historyLevel: elementMap['flowable:HistoryLevel']?.historyLevel || '',
      failedJobRetryTimeCycle:
        elementMap['flowable:FailedJobRetryTimeCycle']?.body || '',
    });
  }, [element, modeler, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    if (!element) return;

    let extensionElements = getBusinessObject(element).extensionElements;

    // 先处理普通属性（versionTag 等）
    const directProps: Record<string, any> = {};
    ['versionTag', 'historyTimeToLive', 'isStartableInTasklist'].forEach(
      (key) => {
        if (changedValues[key] !== undefined) {
          directProps[key] = changedValues[key] || undefined;
        }
      },
    );
    if (Object.keys(directProps).length > 0) {
      updateModdleProperties(element, getBusinessObject(element), directProps);
    }

    // historyLevel 和 failedJobRetryTimeCycle 以扩展元素形式存储
    const isExtElementChange =
      changedValues.historyLevel !== undefined ||
      changedValues.failedJobRetryTimeCycle !== undefined;
    if (!isExtElementChange) return;

    if (!extensionElements) {
      extensionElements = createModdleElement('bpmn:ExtensionElements');
    }

    if (changedValues.failedJobRetryTimeCycle !== undefined) {
      if (changedValues.failedJobRetryTimeCycle) {
        let retryElement = extensionElements.values?.find(
          (el: any) => el.$type === 'flowable:FailedJobRetryTimeCycle',
        );
        if (!retryElement) {
          retryElement = createModdleElement(
            'flowable:FailedJobRetryTimeCycle',
            {},
          );
          extensionElements.values = [
            ...(extensionElements.values || []),
            retryElement,
          ];
        }
        retryElement.body = changedValues.failedJobRetryTimeCycle;
      } else {
        extensionElements.values = (extensionElements.values || []).filter(
          (el: any) => el.$type !== 'flowable:FailedJobRetryTimeCycle',
        );
      }
    }

    if (changedValues.historyLevel !== undefined) {
      if (changedValues.historyLevel) {
        let historyElement = extensionElements.values?.find(
          (el: any) => el.$type === 'flowable:HistoryLevel',
        );
        if (!historyElement) {
          historyElement = createModdleElement('flowable:HistoryLevel', {});
          extensionElements.values = [
            ...(extensionElements.values || []),
            historyElement,
          ];
        }
        historyElement.historyLevel = changedValues.historyLevel;
      } else {
        extensionElements.values = (extensionElements.values || []).filter(
          (el: any) => el.$type !== 'flowable:HistoryLevel',
        );
      }
    }

    updateModdleProperties(element, getBusinessObject(element), {
      extensionElements,
    });
  };

  return (
    <ProForm
      form={form}
      layout='vertical'
      submitter={false}
      onValuesChange={handleValuesChange}
    >
      <ProFormText
        name='versionTag'
        label='版本标签'
        placeholder='如: v1.0.0'
        tooltip='flowable:versionTag - 流程版本标识'
      />
      <ProFormText
        name='historyTimeToLive'
        label='历史数据存活时间（天）'
        placeholder='如: 30'
        tooltip='flowable:historyTimeToLive'
      />
      <ProFormSwitch
        name='isStartableInTasklist'
        label='可在任务列表启动'
        tooltip='flowable:isStartableInTasklist'
      />
      <ProFormSelect
        name='historyLevel'
        label='历史级别'
        options={HISTORY_LEVEL_OPTIONS}
        allowClear
        placeholder='选择历史记录级别'
        tooltip='flowable:HistoryLevel 扩展元素'
      />
      <ProFormText
        name='failedJobRetryTimeCycle'
        label='失败任务重试周期'
        placeholder='如: R3/PT10M'
        tooltip='flowable:failedJobRetryTimeCycle 扩展元素'
      />
    </ProForm>
  );
};

const ProcessBasicInfo: React.FC<ProcessPropertiesProps> = ({
  element,
  onPropertyChange,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        id: '',
        name: '',
        isExecutable: true,
        isEagerExecutionFetching: false,
        documentation: '',
      });
      return;
    }

    const processData = getBusinessObject(element);
    const documentationElements = processData.documentation || [];
    const docText =
      documentationElements.length > 0 ? documentationElements[0].text : '';

    form.setFieldsValue({
      id: processData.id || '',
      name: processData.name || '',
      isExecutable: processData.isExecutable || true,
      isEagerExecutionFetching: !!processData.isEagerExecutionFetching,
      documentation: docText,
    });
  }, [element, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    Object.entries(changedValues).forEach(([key, value]) => {
      onPropertyChange(key, value);
    });
  };

  return (
    <ProForm
      form={form}
      layout='horizontal'
      submitter={false}
      onValuesChange={handleValuesChange}
    >
      <ProForm.Group>
        <ProFormText name='id' label='流程ID' placeholder='流程唯一标识' />
        <ProFormText name='name' label='流程名称' placeholder='流程显示名称' />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSwitch name='isExecutable' label='是否可执行' />
      </ProForm.Group>
      <ProFormTextArea
        name='documentation'
        label='描述'
        rows={3}
        placeholder='流程描述信息'
      />
    </ProForm>
  );
};

const ProcessStarterConfig: React.FC<ProcessPropertiesProps> = ({
  element,
  onPropertyChange,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        candidateStarterUsers: '',
        candidateStarterGroups: '',
      });
      return;
    }

    const processData = getBusinessObject(element);
    form.setFieldsValue({
      candidateStarterUsers: processData.candidateStarterUsers || '',
      candidateStarterGroups: processData.candidateStarterGroups || '',
    });
  }, [element, form]);

  const handleValuesChange = (changedValues: Record<string, any>) => {
    Object.entries(changedValues).forEach(([key, value]) => {
      onPropertyChange(key, value);
    });
  };

  return (
    <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
      <ProFormText
        name='candidateStarterUsers'
        label='候选启动用户'
        placeholder='如: user1,user2,user3'
        tooltip='逗号分隔'
      />
      <ProFormText
        name='candidateStarterGroups'
        label='候选启动组'
        placeholder='如: group1,group2'
        tooltip='逗号分隔'
      />
    </Form>
  );
};

export const ProcessBasicInfoPanel = {
  key: 'process-basic',
  label: (
    <span className='flex items-center gap-2 text-gray-600 font-medium'>
      <FileText className='flow-icon-panel' />
      流程基本信息
    </span>
  ),
};

export const ProcessStarterConfigPanel = {
  key: 'process-starters',
  label: (
    <span className='flex items-center gap-2 text-gray-600 font-medium'>
      <Users className='flow-icon-panel' />
      启动权限配置
    </span>
  ),
};

export const ProcessAdvancedInfoPanel = {
  key: 'process-advanced',
  label: (
    <span className='flex items-center gap-2 text-gray-600 font-medium'>
      <History className='flow-icon-panel' />
      流程高级属性
    </span>
  ),
};

export {
  DataObjectsPanelConfig,
  default as DataObjectsPanel,
} from './DataObjectsPanel';
export {
  default as EventListenersPanel,
  EventListenersPanelConfig,
} from './EventListenersPanel';
export {
  default as ExecutionListenersPanel,
  ExecutionListenersPanelConfig,
} from './ExecutionListenersPanel';
export {
  default as ExtensionsPanel,
  ExtensionsPanelConfig,
} from './ExtensionsPanel';
export {
  default as GlobalEventsPanel,
  GlobalEventsPanelConfig,
} from './GlobalEventsPanel';
export { ProcessAdvancedInfo, ProcessBasicInfo, ProcessStarterConfig };

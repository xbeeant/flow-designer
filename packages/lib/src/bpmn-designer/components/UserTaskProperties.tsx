import {
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormText,
} from '@ant-design/pro-components';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Clock, User } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { useModelerUpdate } from '../hooks/useModelerUpdate';

interface UserTaskPropertiesProps {
  modeler: Modeler;
  element: ModdleElement;
}

const DEFAULT_INITIATOR = 'initiator';

const UserTaskProperties: React.FC<UserTaskPropertiesProps> = ({
  modeler,
  element,
}) => {
  const [form] = ProForm.useForm();
  const { updateModdleProperties } = useModelerUpdate({ modeler });

  // 初始化表单值
  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        assignee: '',
        skipExpression: '',
        candidateUsers: '',
        candidateGroups: '',
        dueDate: '',
        priority: undefined,
        initiator: DEFAULT_INITIATOR,
        formHandlerClass: '',
      });
      return;
    }

    const bo = getBusinessObject(element);
    form.setFieldsValue({
      assignee: bo.assignee || '',
      skipExpression: bo.skipExpression || '',
      candidateUsers: bo.candidateUsers || '',
      candidateGroups: bo.candidateGroups || '',
      dueDate: bo.dueDate || '',
      priority: bo.priority ? Number(bo.priority) : undefined,
      initiator: bo.initiator || DEFAULT_INITIATOR,
      formHandlerClass: bo.formHandlerClass || '',
    });
  }, [element, form]);

  // 字段变更时更新到模型
  const handleValuesChange = useCallback(
    (changedValues: any) => {
      if (!element) return;

      Object.entries(changedValues).forEach(([key, value]) => {
        // priority 需要转为字符串存储
        const storedValue = key === 'priority' ? String(value) : value;
        updateModdleProperties(element, getBusinessObject(element), {
          [key]: storedValue,
        });
      });
    },
    [element, updateModdleProperties],
  );

  const validateAssignee = (_: any, _value: string) => {
    const assignee = form.getFieldValue('assignee');
    const candidateUsers = form.getFieldValue('candidateUsers');
    const candidateGroups = form.getFieldValue('candidateGroups');
    if (!assignee && !candidateUsers && !candidateGroups) {
      return Promise.reject(new Error('处理人、候选人或候选组至少配置一项'));
    }
    return Promise.resolve();
  };

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
      {/* ─ 任务分配 ── */}
      <ProFormText
        name='assignee'
        label='处理人'
        placeholder='指定处理人，如: ${initiator}'
        rules={[{ validator: validateAssignee }]}
      />
      <ProFormText
        name='skipExpression'
        label='跳过表达式'
        placeholder="如: ${initiator == ''}"
      />
      <ProFormText
        name='candidateUsers'
        label='候选人'
        placeholder='逗号分隔，如: user1,user2'
      />
      <ProFormText
        name='candidateGroups'
        label='候选组'
        placeholder='逗号分隔，如: group1,group2'
      />
      <ProFormText
        name='initiator'
        label='启动人变量'
        placeholder='存储启动用户ID的变量名'
      />

      {/* ─ 时间配置 ── */}
      <ProFormDatePicker
        name='dueDate'
        label='截止日期'
        placeholder="选择日期或输入表达式，如: ${dateAdd(now(), 1, 'day')}"
        fieldProps={{
          prefix: <Clock className='flow-icon-button-sm text-gray-400' />,
          showTime: true,
          format: 'YYYY-MM-DD HH:mm:ss',
          allowClear: true,
        }}
      />
      <ProFormDigit
        name='priority'
        label='优先级'
        placeholder='输入优先级数值'
        min={0}
        max={100}
      />
      <ProFormText
        name='formHandlerClass'
        label='表单处理类'
        placeholder='Java类全限定名，如: com.example.MyFormHandler'
        tooltip='flowable:formHandlerClass - 自定义表单处理 Java 类'
      />
    </ProForm>
  );
};

export const UserTaskPropertiesPanel = {
  key: 'userTask',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <User className='flow-icon-panel' />
      用户任务配置
    </span>
  ),
};

export default UserTaskProperties;

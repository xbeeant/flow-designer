import {
  PageLoading,
  ProFormDependency,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import copy from 'antd/es/_util/copy';
import type Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { set } from 'lodash-es';
import { FileText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useExtensions } from '../hooks/useExtensions.ts';
import { useModelerUpdate } from '../hooks/useModelerUpdate';
import type { BpmnForm, XRenderFormField, XRenderSchema } from '../types';
import { parseXRenderSchema } from '../util/xrender-schema';
import FieldConfigEditor from './FieldConfigEditor';

interface FormConfigProps {
  modeler: Modeler;
  element: ModdleElement;
  forms: BpmnForm;
  modelerVersion?: number;
}

interface FormConfigValues {
  formKey?: string;
  parentFormKey: string;
}

const FormConfig: React.FC<FormConfigProps> = (props) => {
  const { modeler, element, forms } = props;
  const [form] = Form.useForm<FormConfigValues>();
  const { updateModdleProperties } = useModelerUpdate({ modeler });
  const [fields, setFields] = useState<XRenderFormField[]>([]);
  const [schema, setSchema] = useState<XRenderSchema | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const { properties, handleSave } = useExtensions(props);
  const isProcess = element.$type === 'bpmn:Process';
  const parsedFields = useCallback((schema: string) => {
    const xrenderSchema = JSON.parse(schema);
    setSchema(xrenderSchema);
    const formFields = parseXRenderSchema(xrenderSchema);
    setFields(formFields);
  }, []);

  const fetchSchemaFields = (formKey: string) => {
    // 获取schema配置
    const url = forms.detail(formKey || forms.parentFormKey);
    console.log('[form]', url);
    setLoading(true);
    fetch(url, {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((json) => {
        parsedFields(json.data?.content || '{}');
      })
      .catch(() => {
        parsedFields('{}');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const attrs = getBusinessObject(element).$attrs || {};
    let attrFormKey: string =
      attrs['flowable:formKey'] ||
      attrs['flowable:parentFormKey'] ||
      forms.parentFormKey ||
      '';

    if (isProcess) {
      const values: Record<string, any> = {};
      properties.forEach((property) => {
        values[property.name] = property.value;
      });

      form.setFieldsValue(values);
      console.log(values);
      attrFormKey = values.parentFormKey;
    } else {
      form.setFieldsValue({
        formKey: attrs['flowable:formKey'] || '',
        parentFormKey:
          attrs['flowable:parentFormKey'] || forms.parentFormKey || '',
      });
    }

    fetchSchemaFields(attrFormKey);
  }, [element, form, properties, forms.parentFormKey]);

  const handleValuesChange = useCallback(
    (changedValues: Partial<FormConfigValues>) => {
      if (!element) return;

      fetchSchemaFields(
        changedValues.parentFormKey || changedValues.formKey || '',
      );
    },
    [element, forms],
  );

  const handleFieldConfigChange = useCallback(
    (fieldKey: string, property: string, value: any) => {
      set(schema as XRenderSchema, `properties.${fieldKey}.${property}`, value);
      setSchema(schema);
      const formFields = parseXRenderSchema(schema as XRenderSchema);
      setFields(formFields);
    },
    [schema],
  );

  const parseFormOptions = useCallback(
    async (config: BpmnForm['search'], search?: string) => {
      const response = await fetch(`${config.url}${search || ''}`);
      const res = (await response.json()) as {
        success: boolean;
        data: Record<string, any>;
      };

      const option = config.option || { label: 'label', value: 'value' };

      return (res?.data || []).map((item: Record<string, any>) => {
        return {
          label: item[option.label],
          value: item[option.value],
        };
      });
    },
    [],
  );

  return (
    <div className='space-y-4'>
      {forms.search && (
        <Form
          form={form}
          layout='horizontal'
          labelCol={{ style: { width: 80, flexShrink: 0 } }}
          wrapperCol={{ flex: 1 }}
          onValuesChange={handleValuesChange}
          size='small'
        >
          {isProcess ? (
            <>
              <ProFormSelect
                label='父表单'
                disabled={true}
                name='parentFormKey'
                tooltip='父表单定义了此流程中所有流程节点需要的字段，子表单的字段配置从父表单的字段范围中选择。'
                showSearch={true}
                params={{ id: element?.id }}
                request={async (values) => {
                  return parseFormOptions(forms.search, values.keyWords);
                }}
              />
              <ProFormDependency name={['parentFormKey']}>
                {({ parentFormKey }) => {
                  if (parentFormKey) {
                    return (
                      <ProFormSelect
                        label='子表单'
                        name='formKey'
                        params={{ id: element?.id }}
                        showSearch={true}
                        tooltip='没有值的时候表示尚未保存详情表单'
                        request={async (values) => {
                          return parseFormOptions(
                            forms.search,
                            values.keyWords,
                          );
                        }}
                      />
                    );
                  }
                  return null;
                }}
              </ProFormDependency>
            </>
          ) : (
            <ProFormSelect
              label='子表单'
              name='formKey'
              params={{ id: element?.id }}
              showSearch={true}
              tooltip='没有值的时候表示尚未保存详情表单'
              request={async (values) => {
                return parseFormOptions(forms.search, values.keyWords);
              }}
            />
          )}
        </Form>
      )}
      {loading ? (
        <PageLoading />
      ) : (
        <div className='border-t border-gray-100 pt-4'>
          <div className='flex items-center gap-2 mb-3'>
            <FileText className='flow-icon-panel text-slate-600' />
            <span className='text-sm font-medium text-slate-700'>字段配置</span>
          </div>

          <FieldConfigEditor
            fields={fields || []}
            onSave={async () => {
              if (schema) {
                const savedFormKey = await forms.onSave(schema);
                if (isProcess) {
                  handleSave(
                    {
                      name: 'formKey',
                      value: savedFormKey,
                      type: 'normal',
                    },
                    true,
                  );
                } else {
                  updateModdleProperties(element, getBusinessObject(element), {
                    formKey: savedFormKey,
                  });
                }
                form.setFieldsValue({ formKey: savedFormKey });
              }
            }}
            onCopy={() => {
              copy(JSON.stringify(schema)).then(() =>
                message.info('已复制到剪贴板'),
              );
            }}
            onFieldConfigChange={handleFieldConfigChange}
          />
        </div>
      )}
    </div>
  );
};

export const FormConfigPanel = {
  key: 'formConfig',
  label: (
    <span className='flex items-center gap-2 text-slate-700 font-medium'>
      <FileText className='flow-icon-panel' />
      表单配置
    </span>
  ),
};

export default FormConfig;

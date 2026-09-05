import {
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { Globe } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { getFieldMap } from '../../util/extension-elements';

interface HttpTaskConfigProps {
  element: ModdleElement;
  onUpdate: (key: string, value: string) => void;
}

const HTTP_STATUS_CODES = [
  { value: '100', label: '100 - Continue' },
  { value: '101', label: '101 - Switching Protocols' },
  { value: '102', label: '102 - Processing' },
  { value: '103', label: '103 - Early Hints' },
  { value: '200', label: '200 - OK' },
  { value: '201', label: '201 - Created' },
  { value: '202', label: '202 - Accepted' },
  { value: '203', label: '203 - Non-Authoritative Information' },
  { value: '204', label: '204 - No Content' },
  { value: '205', label: '205 - Reset Content' },
  { value: '206', label: '206 - Partial Content' },
  { value: '207', label: '207 - Multi-Status' },
  { value: '208', label: '208 - Already Reported' },
  { value: '226', label: '226 - IM Used' },
  { value: '300', label: '300 - Multiple Choices' },
  { value: '301', label: '301 - Moved Permanently' },
  { value: '302', label: '302 - Found' },
  { value: '303', label: '303 - See Other' },
  { value: '304', label: '304 - Not Modified' },
  { value: '305', label: '305 - Use Proxy' },
  { value: '307', label: '307 - Temporary Redirect' },
  { value: '308', label: '308 - Permanent Redirect' },
  { value: '400', label: '400 - Bad Request' },
  { value: '401', label: '401 - Unauthorized' },
  { value: '402', label: '402 - Payment Required' },
  { value: '403', label: '403 - Forbidden' },
  { value: '404', label: '404 - Not Found' },
  { value: '405', label: '405 - Method Not Allowed' },
  { value: '406', label: '406 - Not Acceptable' },
  { value: '407', label: '407 - Proxy Authentication Required' },
  { value: '408', label: '408 - Request Timeout' },
  { value: '409', label: '409 - Conflict' },
  { value: '410', label: '410 - Gone' },
  { value: '411', label: '411 - Length Required' },
  { value: '412', label: '412 - Precondition Failed' },
  { value: '413', label: '413 - Payload Too Large' },
  { value: '414', label: '414 - URI Too Long' },
  { value: '415', label: '415 - Unsupported Media Type' },
  { value: '416', label: '416 - Range Not Satisfiable' },
  { value: '417', label: '417 - Expectation Failed' },
  { value: '418', label: "418 - I'm a teapot" },
  { value: '421', label: '421 - Misdirected Request' },
  { value: '422', label: '422 - Unprocessable Entity' },
  { value: '423', label: '423 - Locked' },
  { value: '424', label: '424 - Failed Dependency' },
  { value: '425', label: '425 - Too Early' },
  { value: '426', label: '426 - Upgrade Required' },
  { value: '428', label: '428 - Precondition Required' },
  { value: '429', label: '429 - Too Many Requests' },
  { value: '431', label: '431 - Request Header Fields Too Large' },
  { value: '451', label: '451 - Unavailable For Legal Reasons' },
  { value: '500', label: '500 - Internal Server Error' },
  { value: '501', label: '501 - Not Implemented' },
  { value: '502', label: '502 - Bad Gateway' },
  { value: '503', label: '503 - Service Unavailable' },
  { value: '504', label: '504 - Gateway Timeout' },
  { value: '505', label: '505 - HTTP Version Not Supported' },
  { value: '506', label: '506 - Variant Also Negotiates' },
  { value: '507', label: '507 - Insufficient Storage' },
  { value: '508', label: '508 - Loop Detected' },
  { value: '509', label: '509 - Bandwidth Limit Exceeded' },
  { value: '510', label: '510 - Not Extended' },
  { value: '511', label: '511 - Network Authentication Required' },
];

const HttpTaskConfig: React.FC<HttpTaskConfigProps> = ({
  element,
  onUpdate,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!element) {
      form.setFieldsValue({
        requestMethod: 'GET',
        requestUrl: '',
        requestHeaders: '',
        requestSecureHeaders: '',
        requestBody: '',
        responseVariableName: '',
        ignoreException: false,
        disallowRedirects: false,
        saveResponseParameters: '',
        saveResponseParametersTransient: false,
        saveResponseVariableAsJson: false,
        saveRequestVariables: '',
        failStatusCodes: '500',
        handleStatusCodes: '200',
      });
      return;
    }

    const businessObject = getBusinessObject(element);
    const extensionElements = businessObject.extensionElements;

    if (extensionElements && typeof extensionElements.get === 'function') {
      const fieldMap = getFieldMap(extensionElements);

      form.setFieldsValue({
        requestMethod: fieldMap.requestMethod || 'GET',
        requestUrl: fieldMap.requestUrl || '',
        requestHeaders: fieldMap.requestHeaders || '',
        requestBody: fieldMap.requestBody || '',
        responseVariableName: fieldMap.responseVariableName || '',
        ignoreException: fieldMap.ignoreException === 'true',
        disallowRedirects: fieldMap.disallowRedirects === 'true',
        saveResponseParametersTransient:
          fieldMap.saveResponseParametersTransient === 'true',
        saveResponseVariableAsJson:
          fieldMap.saveResponseVariableAsJson === 'true',
        failStatusCodes: fieldMap.failStatusCodes || '500',
        handleStatusCodes: fieldMap.handleStatusCodes || '200',
      });
    }
  }, [element]);

  return (
    <div className='bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
      <div className='flex items-center px-4 py-2.5 bg-linear-to-r from-purple-50 to-pink-50 border-b border-gray-100'>
        <div className='w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center text-white mr-2'>
          <Globe className='flow-icon-panel' />
        </div>
        <span className='text-sm font-semibold text-gray-700'>HTTP配置</span>
      </div>
      <div className='p-1'>
        <Form
          labelCol={{ span: 6 }}
          onValuesChange={(changedValues) => {
            Object.keys(changedValues).forEach((key) => {
              onUpdate(key, changedValues[key]);
            });
          }}
        >
          <ProFormSelect
            label='请求方法'
            name='requestMethod'
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'DELETE', label: 'DELETE' },
            ]}
          />
          <ProFormText
            label='请求URL'
            name='requestUrl'
            placeholder='http://example.com/api'
          />
          <ProFormTextArea
            label='请求头'
            name='requestHeaders'
            placeholder='{"Content-Type": "application/json"}'
          />
          <ProFormTextArea label='请求体' name='requestBody' placeholder='{}' />
          <ProFormText
            label='响应变量名'
            name='responseVariableName'
            placeholder='存储响应的变量名'
          />
          <ProFormSwitch
            label='忽略异常'
            name='ignoreException'
            fieldProps={{ defaultChecked: false }}
          />
          <ProFormSwitch
            label='禁止重定向'
            name='disallowRedirects'
            fieldProps={{ defaultChecked: false }}
          />
          <ProFormSwitch
            label='临时保存响应参数'
            name='saveResponseParametersTransient'
            fieldProps={{ defaultChecked: false }}
          />
          <ProFormSwitch
            label='以JSON保存响应'
            name='saveResponseVariableAsJson'
            fieldProps={{ defaultChecked: false }}
          />
          <ProFormSelect
            label='失败状态码'
            name='failStatusCodes'
            options={HTTP_STATUS_CODES}
            placeholder='选择失败状态码'
          />
          <ProFormSelect
            label='处理状态码'
            name='handleStatusCodes'
            options={HTTP_STATUS_CODES}
            placeholder='选择处理状态码'
          />
        </Form>
      </div>
    </div>
  );
};

export default HttpTaskConfig;

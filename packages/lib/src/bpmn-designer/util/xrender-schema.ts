import type { XRenderFormField, XRenderSchema } from '../types';

export function parseXRenderSchema(schema: XRenderSchema): XRenderFormField[] {
  const fields: XRenderFormField[] = [];

  if (!schema || typeof schema !== 'object') {
    return fields;
  }

  function traverse(obj: XRenderFormField | XRenderSchema, parentKey?: string) {
    const objProperties = obj.properties || {};
    for (const [key, value] of Object.entries(objProperties) as [
      string,
      XRenderFormField,
    ][]) {
      const currentKey = parentKey ? `${parentKey}.${key}` : `${key}`;
      const isObject = 'object' === value.type;
      const isArray = 'array' === value.type;

      const field = value;
      field.parentKey = parentKey;
      field.key = currentKey;
      fields.push(field);

      if (isObject) {
        traverse(value, currentKey);
      } else if (isArray) {
        if (value.items) {
          traverse(value.items, currentKey);
        }
      }
    }
  }

  traverse(schema);

  return fields;
}

export function getFieldTypeLabel(type: string, format?: string): string {
  const typeMap: Record<string, string> = {
    string: '字符串',
    number: '数字',
    boolean: '布尔值',
    array: '数组',
    object: '对象',
    range: '范围',
    html: 'HTML',
    block: '块',
  };

  const formatMap: Record<string, string> = {
    url: 'URL',
    email: '邮箱',
    date: '日期',
    datetime: '日期时间',
    textarea: '多行文本',
    password: '密码',
  };

  if (format && formatMap[format]) {
    return formatMap[format];
  }

  return typeMap[type] || type;
}

export const getFieldMap = (extensionElements: any): Record<string, string> => {
  const fieldMap: Record<string, string> = {};
  if (!extensionElements || typeof extensionElements.get !== 'function') {
    return fieldMap;
  }

  const fields = extensionElements.get('flowable:field') || [];
  fields.forEach((field: any) => {
    const fieldName = field.name;
    if (!fieldName) return;

    if (field.stringValue !== undefined && field.stringValue !== null) {
      fieldMap[fieldName] = String(field.stringValue);
    } else if (field.string !== undefined && field.string !== null) {
      const stringVal =
        field.string.value !== undefined ? field.string.value : field.string;
      fieldMap[fieldName] = String(stringVal);
    } else if (field.expression) {
      fieldMap[fieldName] = field.expression;
    }
  });

  return fieldMap;
};

/**
 * 读取 extensionElements 内以 flowable:Property 形式存储的扩展属性
 * （如 SaveToProcessData、HistoryLevel、FailedJobRetryTimeCycle 等 child 元素）。
 */
export const getPropertyMap = (
  extensionElements: any,
): Record<string, string> => {
  const propertyMap: Record<string, string> = {};
  if (!extensionElements || typeof extensionElements.get !== 'function') {
    return propertyMap;
  }

  const properties = extensionElements.get('flowable:property') || [];
  properties.forEach((property: any) => {
    const name = property.name;
    if (!name) return;
    const value = property.value;
    propertyMap[name] = String(value ?? '');
  });

  return propertyMap;
};

/**
 * 读取 extensionElements 内所有元素，返回 $type → 元素的映射。
 * 用于 FailedJobRetryTimeCycle、HistoryLevel 等单例 child 元素。
 */
export const getExtensionElementMap = (
  extensionElements: any,
): Record<string, any> => {
  const elementMap: Record<string, any> = {};
  if (!extensionElements || typeof extensionElements.get !== 'function') {
    return elementMap;
  }

  const values = extensionElements.get('values') || [];
  values.forEach((el: any) => {
    const type = el?.$type;
    if (type) elementMap[type] = el;
  });

  return elementMap;
};

/** 更新 extensionElements 中 name 匹配的 flowable:Property，不存在则追加 */
export const upsertExtensionProperty = (
  moddle: any,
  extensionElements: any,
  name: string,
  value: string,
) => {
  const values = extensionElements.get('values') || [];
  const otherElements = values.filter(
    (el: any) => !(el?.$type === 'flowable:Property' && el.name === name),
  );

  const property = moddle.create('flowable:Property', { name, value });
  extensionElements.set('values', [...otherElements, property]);
};

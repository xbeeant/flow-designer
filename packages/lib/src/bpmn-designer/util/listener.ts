import type { FieldType } from '../properties/components/field-table';

export const LISTENER_TYPE_MAP: Record<string, string> = {
  class: 'class',
  expression: 'expression',
  delegateExpression: 'delegateExpression',
  script: 'script',
};

export const LISTENER_VALUE_MAP: Record<string, string> = {
  class: 'className',
  expression: 'expression',
  delegateExpression: 'delegateExpression',
};

export function detectListenerType(listener: any): string {
  if (listener.expression) return 'expression';
  if (listener.delegateExpression) return 'delegateExpression';
  if (listener.script || listener.scriptResource) return 'script';
  return 'class';
}

export function extractFields(listener: any): FieldType[] {
  return (listener.fields || []).map((f: any) => {
    const value = f.string ?? f.expression ?? f.stringValue ?? '';
    const fieldType: 'string' | 'expression' =
      f.expression !== undefined ? 'expression' : 'string';
    return { name: f.name || '', fieldType, value };
  });
}

export function buildModdleField(moddle: any, field: FieldType): any {
  const moddleField = moddle.create('flowable:Field', { name: field.name });
  moddleField[field.fieldType === 'expression' ? 'expression' : 'string'] =
    field.value;
  return moddleField;
}

export function buildModdleListener(
  moddle: any,
  item: any,
  listenerType: string,
  typeAttrMap: Record<string, string>,
  itemValueMap: Record<string, string>,
): any {
  const moddleItem = moddle.create(listenerType, {
    id: item.id,
    event: item.event,
  });

  const attr = typeAttrMap[item.type];
  const val = itemValueMap[item.type];
  if (attr && val) moddleItem[attr] = val;

  if (item.type === 'script') {
    if (item.script) moddleItem.script = item.script;
    if (item.scriptResource) moddleItem.scriptResource = item.scriptResource;
  }

  if (item.transaction) moddleItem.transaction = item.transaction;

  if (item.fields?.length) {
    moddleItem.fields = item.fields.map((f: FieldType) =>
      buildModdleField(moddle, f),
    );
  }

  return moddleItem;
}

export function buildExecutionListener(moddle: any, item: any): any {
  const typeAttrMap: Record<string, string> = {
    class: 'class',
    expression: 'expression',
    delegateExpression: 'delegateExpression',
  };
  const itemValueMap: Record<string, string> = {
    class: item.className,
    expression: item.expression,
    delegateExpression: item.delegateExpression,
  };
  return buildModdleListener(
    moddle,
    item,
    'flowable:ExecutionListener',
    typeAttrMap,
    itemValueMap,
  );
}

export function buildTaskListener(moddle: any, item: any): any {
  const typeAttrMap: Record<string, string> = {
    class: 'class',
    expression: 'expression',
    delegateExpression: 'delegateExpression',
  };
  const itemValueMap: Record<string, string> = {
    class: item.className,
    expression: item.expression,
    delegateExpression: item.delegateExpression,
  };
  return buildModdleListener(
    moddle,
    item,
    'flowable:TaskListener',
    typeAttrMap,
    itemValueMap,
  );
}

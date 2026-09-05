export type EventType = 'message' | 'error' | 'signal' | 'escalation';

/** 每种事件类型的元信息配置 */
export interface EventTypeConfig {
  type: EventType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bpmnType: string;
  extraColumns: ColumnConfig[];
  ModalComponent: React.FC<any>;
}

export interface ColumnConfig {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: any) => React.ReactNode;
}

/** 从 bpmn rootElements 中提取指定类型的事件定义列表 */
export function extractDefinitionItems(
  rootElements: any[],
  bpmnType: string,
): any[] {
  return rootElements
    .filter((el) => el.$type === bpmnType)
    .map((el) => ({
      id: el.id || '',
      name: el.name || '',
      itemRef: el.itemRef?.id || '',
      errorCode: el.errorCode || '',
      escalationCode: el.escalationCode || '',
      scope: el.scope,
    }));
}

/** 同步事件定义到 modeler */
export function syncEventDefinitions(
  definitions: any,
  bpmnType: string,
  items: any[],
  createModdleElement: (type: string, props: Record<string, any>) => any,
): void {
  const rootElements = definitions.rootElements || [];

  // 移除旧元素
  rootElements
    .filter((el: any) => el.$type === bpmnType)
    .forEach((el: any) => {
      const idx = rootElements.indexOf(el);
      if (idx > -1) rootElements.splice(idx, 1);
    });

  // 添加新元素
  items.forEach((item) => {
    const moddleItem = createModdleElement(bpmnType, {
      id: item.id,
      name: item.name,
    });
    if (!moddleItem) return;

    applyItemProperties(moddleItem, item, rootElements);
    rootElements.push(moddleItem);
  });
}

/** 为 moddle 元素设置属性 */
function applyItemProperties(
  moddleItem: any,
  item: any,
  rootElements: any[],
): void {
  if (item.itemRef) {
    const itemDef = rootElements.find(
      (el) => el.$type === 'bpmn:ItemDefinition' && el.id === item.itemRef,
    );
    if (itemDef) moddleItem.itemRef = itemDef;
  }
  if (item.errorCode) moddleItem.errorCode = item.errorCode;
  if (item.escalationCode) moddleItem.escalationCode = item.escalationCode;
  if (item.scope) moddleItem.scope = item.scope;
}

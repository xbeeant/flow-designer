/** 翻译函数类型 */
export type TranslateFunction = (template: string, ...args: any[]) => string;

/** 模块声明类型 - 用于扩展 bpmn-js 的模块系统 */
export interface ModuleDeclaration {
  __init__?: string[];
  __depends__?: ModuleDeclaration[];
  [key: string]: any;
}

/** BPMN 渲染器配置 */
export interface BpmnRendererOptions {
  defaultLabelColor?: string;
  defaultFillColor?: string;
  defaultStrokeColor?: string;
  [key: string]: any;
}

/** 文本渲染器样式 */
export interface TextRendererStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number | string;
  lineHeight?: string;
  [key: string]: any;
}

/** 文本渲染器配置 */
export interface TextRendererOptions {
  defaultStyle?: Partial<TextRendererStyle>;
  [key: string]: any;
}

/** 设计器配置 */
export interface BpmnDesignerConfig {
  container?: HTMLElement;
  translate?: TranslateFunction;
  bpmnRenderer?: BpmnRendererOptions;
  textRenderer?: TextRendererOptions;
  keyboard?: {
    bindTo?: HTMLElement;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface XRenderSchema {
  title: string;
  type: string;
  format?: string;
  required?: string;
  parentKey?: string;
  hidden?: string;
  properties?: Record<string, any>;
  displayType?: 'row' | 'column';
  labelWidth?: number | string;
  bind?: string | string[] | false;
  className?: string;
  description?: string;
  descType?: 'text' | 'icon' | 'widget';
  descWidget?: string;
  dependencies?: string[];
  disabled?: string;
  extra?: string;
  enum?: string[];
  enumNames?: string[];
  props?: Record<string, any>;
  order?: number;
  placeholder?: string;
  rules?: Record<string, any>[];
  readOnly?: string;
  readOnlyWidget?: string;
  width?: string;
  children?: XRenderFormField[];
  items?: XRenderFormField;
  widget: string;
}

export interface XRenderFormField extends XRenderSchema {
  key: string;
}

export interface FieldPropertyConfig {
  hidden: string;
  readOnly: string;
  required: string;
}

export type RuleOperator =
  | '=='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'contains'
  | 'notContains'
  | 'isEmpty'
  | 'isNotEmpty';

export type RuleAction =
  | 'show'
  | 'hide'
  | 'enable'
  | 'disable'
  | 'required'
  | 'optional';

export interface FieldRule {
  id: string;
  name: string;
  conditionField: string;
  operator: RuleOperator;
  conditionValue: string;
  action: RuleAction;
}

export interface FieldConfig {
  fieldKey: string;
  fieldTitle: string;
  properties: FieldPropertyConfig;
  rules: FieldRule[];
  children?: FieldConfig[];
}

export interface BpmnForm {
  parentFormKey: string;
  search: {
    url: string;
    option: {
      label: string;
      value: string;
    };
  };
  detail: (value: string) => string;
  onSave: (schema: XRenderSchema) => Promise<string>;
}

/** 设计器 Props */
export interface BpmnDesignerProps {
  config?: BpmnDesignerConfig;
  /** BPMN XML 初始值，作为设计器的默认流程图数据 */
  value?: string;
  /** 保存时触发，xml 为当前流程图的 BPMN XML 字符串 */
  onSave?: (xml: string) => void;
  forms: BpmnForm;
  /** 是否启用校验功能，默认为 true */
  enableValidation?: boolean;
}

/** 面板元素项 */
export interface PaletteItem {
  type: string;
  group: string;
  className: string;
  title: string;
}

/** 元素属性 */
export interface ElementProperties {
  id: string;
  name: string;
  description: string;
  type: string;
  businessObjectType: string;
}

export interface InternalEvent {
  newSelection: any[];
  oldSelection: [];
  type?: string;
}

import bpmn from 'bpmn-js-i18n-zh/lib/bpmn-js';
import properties from 'bpmn-js-i18n-zh/lib/properties-panel';
import zh from './lang/zh';

export type Language = 'zh' | 'en';

const zhCN: Record<string, string> = {
  ...bpmn,
  ...properties,
  ...zh,
};

const enUS: Record<string, string> = {};

let currentLang: Language = 'zh';

export function getCurrentLang(): Language {
  return currentLang;
}

export function setLang(lang: Language): void {
  currentLang = lang;
}

export function translate(template: string, ...args: any[]): string {
  const dict = currentLang === 'zh' ? zhCN : enUS;
  let text = dict[template] || template;

  if (args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    const replacements = args[0] as Record<string, string>;
    text = text.replace(/{([^}]+)}/g, (_, key) => {
      return replacements[key] !== undefined ? String(replacements[key]) : `{${key}}`;
    });
  } else {
    args.forEach((arg, index) => {
      text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
    });
  }

  return text;
}

export const TranslateModule = {
  translate: ['value', translate],
};

export default translate;
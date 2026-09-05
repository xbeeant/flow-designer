const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * 生成随机字符序列
 * @param length 生成的字符长度
 * @returns 随机字符串
 */
export function randomChar(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

/**
 * 生成带前缀的随机 ID
 * @param prefix ID 前缀
 * @returns 随机 ID 字符串
 */
export function generateId(prefix = 'id'): string {
  return `${prefix.substring(0, 1).toUpperCase()}${prefix.substring(1)}_${randomChar()}`;
}

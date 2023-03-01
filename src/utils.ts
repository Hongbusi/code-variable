import { difference, union } from 'lodash-es'
import config from './config'

function filter(str: string): string[] {
  str = str.toLowerCase();
  const { prep, prefix, suffix, verb } = config.filter
  return difference(str.split(' '), union(prep, prefix, suffix, verb));
}

function toCamelCase(words: string[]): string {
  const firstWord = words[0].toLowerCase();
  const restWords = words.slice(1).map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return firstWord + restWords.join('');
}

function toUpperCamelCase(words: string[]): string {
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function toUnderline(words: string[]): string {
  return words.map(word => word.toLowerCase()).join('_')
}

function toHyphenated(words: string[]): string {
  return words.map(word => word.toLowerCase()).join('-')
}

function toConst(words: string[]): string {
  return words.map(word => word.toUpperCase()).join('_')
}

export function format(str: string, type: string) {
  const words = filter(str);
  if (type === 'xt') {
    return toCamelCase(words)
  }
  if (type === 'dt') {
    return toUpperCamelCase(words)
  }
  if (type === 'xh') {
    return toUnderline(words)
  }
  if (type === 'zh') {
    return toHyphenated(words)
  }
  if (type === 'cl') {
    return toConst(words)
  }
  return ''
}

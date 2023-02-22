/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/* eslint-disable no-nested-ternary */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/**
 * num 小于0，左缩进num*2个空格； 大于0，右缩进num*2个空格。
 * @param {string} str 代码
 * @param {number} num 缩进次数
 * @param {number} len 【可选】缩进单位，空格数
 */
export function indent(str, num, len = 2) {
  if (num === 0) return str
  const isLeft = num < 0; const result = []; let reg; let
    spaces = ''
  if (isLeft) {
    num *= -1
    reg = new RegExp(`(^\\s{0,${num * len}})`, 'g')
  } else {
    for (let i = 0; i < num * len; i++) spaces += ' '
  }

  str.split('\n').forEach(line => {
    line = isLeft ? line.replace(reg, '') : spaces + line
    result.push(line)
  })
  return result.join('\n')
}

// 首字母大小
export function titleCase(str) {
  return str.replace(/( |^)[a-z]/g, L => L.toUpperCase())
}

// 下划转驼峰
export function camelCase(str) {
  return str.replace(/-[a-z]/g, str1 => str1.substr(-1).toUpperCase())
}

export function isNumberStr(str) {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}

export const exportDefault = 'export default '

export const beautifierConf = {
  html: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'separate',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  },
  js: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: true,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  }
}

function stringify(obj) {
  return JSON.stringify(obj, (key, val) => {
    if (typeof val === 'function') {
      return `${val}`
    }
    return val
  })
}

function parse(str) {
  JSON.parse(str, (k, v) => {
    if (v.indexOf && v.indexOf('function') > -1) {
      return eval(`(${v})`)
    }
    return v
  })
}

export function jsonClone(obj) {
  return parse(stringify(obj))
}

// 深拷贝对象
export function deepClone(obj) {
  const _toString = Object.prototype.toString

  // null, undefined, non-object, function
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  // DOM Node
  if (obj.nodeType && 'cloneNode' in obj) {
    return obj.cloneNode(true)
  }

  // Date
  if (_toString.call(obj) === '[object Date]') {
    return new Date(obj.getTime())
  }

  // RegExp
  if (_toString.call(obj) === '[object RegExp]') {
    const flags = []
    if (obj.global) { flags.push('g') }
    if (obj.multiline) { flags.push('m') }
    if (obj.ignoreCase) { flags.push('i') }

    return new RegExp(obj.source, flags.join(''))
  }

  const result = Array.isArray(obj) ? [] : obj.constructor ? new obj.constructor() : {}

  for (const key in obj) {
    result[key] = deepClone(obj[key])
  }

  return result
}

const toStr = Function.prototype.call.bind(Object.prototype.toString)
export function isObjectObject(t) {
  return toStr(t) === '[object Object]'
}
export function isObjectArray(t) {
  return toStr(t) === '[object Array]'
}
export function isObjectNull(t) {
  return toStr(t) === '[object Null]'
}
export function isObjectUnde(t) {
  return toStr(t) === '[object Undefined]'
}

/**
 * 简易防抖函数
 * @param {Function} func -防抖目标函数
 * @param {Number}} gap - 防抖时间间隔
 */
export const debounce = ( func, gap ) => {
  let timer
  return function () {
    timer && clearTimeout( timer )
    timer = setTimeout( () => {
      func.apply( this, arguments )
    }, gap )
  }
}

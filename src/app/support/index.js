const isString = (a) => Object.prototype.toString.call(a) === '[object String]'
const isArray = (a) => Array.isArray(a)
const isFunction = (a) => {
  if (!a) {
    return false
  }
  const t = {}.toString.call(a)
  return t === '[object Function]' || t === '[object AsyncFunction]'
}
const isObject = (a) => typeof a === 'object' && a !== null
const isNumeric = (a) => !isNaN(parseFloat(a)) && isFinite(a)
const objectHasProp = (a, k) => isObject(a) && Object.prototype.hasOwnProperty.call(a, k)
const objectHasMethod = (a, m) =>
  !isObject(a) || typeof a[m] === 'undefined' ? false : isFunction(a[m])
const getValue = (a, def = null) => (isFunction(a) ? a() : a !== undefined ? a : def)
const getValues = (a) => a.map(getValue)
const isEmpty = (mixedValue) => {
  const emptyValues = [undefined, null, false, 0, '', '0']
  for (let i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedValue === emptyValues[i]) {
      return true
    }
  }

  if (isObject(mixedValue)) {
    for (let key in mixedValue) {
      if (objectHasProp(mixedValue, key)) {
        return false
      }
    }
    return true
  }

  return false
}
const wait = (time) => new Promise((resolve) => setTimeout(resolve, time))

const randomFromArray = (array) => array[Math.floor(Math.random() * array.length)]

module.exports = {
  isEmpty,
  isString,
  isFunction,
  isObject,
  isArray,
  isNumeric,
  objectHasProp,
  objectHasMethod,
  getValue,
  getValues,
  wait,

  randomFromArray
}

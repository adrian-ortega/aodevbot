const isString = (a) => Object.prototype.toString.call(a) === '[object String]';
const isArray = (a) => Array.isArray(a);
const isFunction = (a) => {
  if (!a) {
    return false;
  }
  const t = {}.toString.call(a);
  return t === '[object Function]' || t === '[object AsyncFunction]';

};
const isObject = (a) => typeof a === 'object' && a !== null;
const objectHasProp = (a, k) => isObject(a) && Object.prototype.hasOwnProperty.call(a, k);
const objectHasMethod = (a, m) => !isObject(a) || typeof a[m] === 'undefined' ? false : isFunction(a[m]);
const getValue = (a, def = null) => isFunction(a) ? a() : a !== undefined ? a : def;

module.exports = {
  isString,
  isFunction,
  isObject,
  isArray,
  objectHasProp,
  objectHasMethod,
  getValue,
}

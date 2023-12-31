const isString = (a) => Object.prototype.toString.call(a) === "[object String]";
const isArray = (a) => Array.isArray(a);
const isFunction = (a) => {
  if (!a) {
    return false;
  }
  const t = {}.toString.call(a);
  return t === "[object Function]" || t === "[object AsyncFunction]";
};
const isObject = (a) => typeof a === "object" && a !== null;
const isNumeric = (a) => !isNaN(parseFloat(a)) && isFinite(a);
const objectHasProp = (a, k) =>
  isObject(a) && Object.prototype.hasOwnProperty.call(a, k);
const objectHasMethod = (a, m) =>
  !isObject(a) || typeof a[m] === "undefined" ? false : isFunction(a[m]);
const getValue = (a, def = null) =>
  isFunction(a) ? a() : a !== undefined ? a : def;
const getValues = (a) => a.map(getValue);
const isEmpty = (mixedValue) => {
  const emptyValues = [undefined, null, false, 0, "", "0"];
  for (let i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedValue === emptyValues[i]) {
      return true;
    }
  }

  if (isObject(mixedValue)) {
    for (const key in mixedValue) {
      if (objectHasProp(mixedValue, key)) {
        return false;
      }
    }
    return true;
  }

  return false;
};
const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

const randomFromArray = (array) =>
  array[Math.floor(Math.random() * array.length)];

const shuffleArray = (array, size) => {
  let index = -1;
  const length = array.length;
  const copy = [...array];
  size = size === undefined ? length : size;
  while (++index < size) {
    const rand = Math.floor(Math.random() * index);
    [copy[index], copy[rand]] = [copy[rand], copy[index]];
  }
  copy.length = size;
  return copy;
};

const arrayWrap = (array) => {
  if (isString(array) || isObject(array)) return [array]
  return [...array]
}

const compareObjects = (obj1, obj2, props = []) => {
  if (!isObject(obj1) || !isObject(obj2)) return false;
  if (!props) {
    return compareObjects(obj1, obj2, Object.keys(obj1))
  }

  for (let i = 0; i < props.length; i++) {
    if (obj1[props[i]] !== obj2[props[i]]) {
      return false;
    }
  }

  return true;
}

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

  arrayWrap,
  randomFromArray,
  shuffleArray,

  compareObjects,
};

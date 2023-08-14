const { loadFile, saveFile } = require("./files");
const { isObject, objectHasProp, isArray } = require("./index");

class JSONFileStorage {
  constructor(filepath, data, autoload = false) {
    this.filepath = filepath;
    this.data = data;
    this.autoload = autoload;
    if (autoload) {
      this.runAutoload();
    }
  }

  all() {
    // @TODO implement
  }

  has(id) {
    this.refresh();
    return objectHasProp(this.data, id);
  }

  get(id, defaultValue = null) {
    this.refresh();
    return this.has(id) ? this.data[id] : defaultValue;
  }

  getOrCreate(id, createValue = null) {
    this.refresh();
    if (!this.has(id)) {
      this.put(id, createValue);
    }
    return this.get(id);
  }

  put(id, value) {
    const sanitize = (a) => (isObject(a) ? { ...a } : isArray(a) ? [...a] : a);

    // @TODO implement a way to "put" multiple values
    //       when the ID variable is an object with keys itself

    this.data[id] = sanitize(value);

    return this.save();
  }

  remove(id) {
    // @TODO implement
  }

  runAutoload() {
    // @TODO implement
  }

  refresh(defaultValue = {}) {
    this.data = this.loadFile(defaultValue);
    if (!isObject(this.data) || this.data === null) {
      this.data = defaultValue;
    }
    return true;
  }

  save(data = undefined) {
    if (!data) data = this.data;
    return this.saveFile(data);
  }

  saveFile(data) {
    return saveFile(this.filepath, data, this.fileWriteParser.bind(this));
  }

  loadFile(defaultValue = {}) {
    return loadFile(
      this.filepath,
      defaultValue,
      this.fileReadParser.bind(this),
      this.fileWriteParser.bind(this),
    );
  }

  fileWriteParser(value) {
    return JSON.stringify(value);
  }

  fileReadParser(value) {
    return JSON.parse(value);
  }
}

module.exports = (filepath, data, autoload = false) => {
  return new JSONFileStorage(filepath, data, autoload);
};

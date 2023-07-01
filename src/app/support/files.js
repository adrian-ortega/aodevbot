const fs = require('fs');
const log = require('../log');
const logPrefix = 'Support Files';

const { getValue } = require('../support');

const fileExists = (path) => {
  try {
    return fs.existsSync(path);
  } catch (err) {
    return false;
  }
};

const saveFile = (path, data = null, writeParser = getValue) => {
  try {
    fs.writeFileSync(path, writeParser(data));
    return true;
  } catch (err) {
    log.error('Failed to load file', {
      message: err.message,
      path,
      data
    }, logPrefix)
  }
  return false;
}

const loadFile = (path, createIfEmptyValue = '', readParser = getValue, writeParser = getValue) => {
  try {
    if (!fileExists(path)) {
      saveFile(path, createIfEmptyValue, writeParser);
    }
    return readParser(fs.readFileSync(path, 'utf-8'));
  } catch (err) {
    log.error('Failed to load file', {
      message: err.message
    }, logPrefix)
  }
  return false;
}

module.exports = {
  fileExists,
  loadFile,
  saveFile
}
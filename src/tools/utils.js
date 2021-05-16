const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { basename, extname, relative, resolve } = require('path');
const { generated, docsUrl } = require('./meta');

function makeRelativePath(baseDir, target) {
  return relative(baseDir, target).split('\\').join('/');
}

function getAbsolutePath(path, basePath = docs) {
  return resolve(dirname(basePath), path);
}

function getRelativePath(path, basePath = docs) {
  return makeRelativePath(docs, getAbsolutePath(path, basePath));
}

function imgRef(path, basePath) {
  return getAbsolutePath(path, basePath);
}

function docRef(path, basePath) {
  const relPath = getRelativePath(path, basePath);
  return `${docsUrl}/${relPath}`;
}

function capitalize(str) {
  switch (str) {
    case 'api':
      return 'API';
    case 'cli':
      return 'CLI';
    default:
      return str[0].toUpperCase() + str.substr(1);
  }
}

function getTitle(file) {
  const parts = niceName(file).split('-');
  return parts.map(m => capitalize(m)).join(' ');
}

function niceName(path) {
  const ext = extname(path);
  return basename(path).replace(ext, '');
}

function generateFile(name, content, type = 'codegen') {
  if (!existsSync(generated)) {
    mkdirSync(generated);
  }

  writeFileSync(resolve(generated, `${name}.${type}`), content, 'utf8');
}

module.exports = {
  imgRef,
  docRef,
  capitalize,
  niceName,
  makeRelativePath,
  getRelativePath,
  getAbsolutePath,
  generateFile,
  getTitle,
};

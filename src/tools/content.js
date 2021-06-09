const { resolve } = require('path');
const { docsPath, baseDir } = require('./meta-core');

function getGeneratorPath(genPath, options) {
  if (genPath === 'custom') {
    return resolve(baseDir, options.path);
  } else {
    return resolve(__dirname, './generators', genPath);
  }
}

function makeLinks(items, basePath) {
  const links = [];
  const flat = !Array.isArray(items);

  if (flat) {
    items = [items];
  }

  for (const item of items) {
    if (typeof item.generator === 'string') {
      const { generator, ...options } = item;
      const genPath = getGeneratorPath(generator, options);
      const gen = require(genPath);
      const content = gen.call(this, basePath, docsPath, options).join(', ');

      if (flat) {
        links.push(content);
      } else {
        links.push(`...populate([${content}])`);
      }
    } else {
      links.push(`{
        "title": ${JSON.stringify(item.title)},
        "links": [${makeLinks.call(this, item.links, basePath)}],
      }`);
    }
  }

  return links.join(', ');
}

function makeContent(sitemap) {
  const content = Object.keys(sitemap)
    .map(
      (key) => `${JSON.stringify(key)}: {
      "title": ${JSON.stringify(sitemap[key].title)},
      "sections": [${makeLinks.call(this, sitemap[key].sections, '/' + key)}],
    }`,
    )
    .join(',');

  return `{
    ${content}
  }`;
}

const populateCode = `
const { lazy } = require('react');

function populate(source) {
  const results = [];

  source.forEach(item => {
    const title = item.section;
    const [result] = results.filter(m => m.title === title);

    if (result) {
      result.links.push(item);
    } else {
      results.push({
        title,
        links: [item],
      });
    }
  });

  return results;
}
`;

module.exports = {
  makeLinks,
  makeContent,
  populateCode,
};

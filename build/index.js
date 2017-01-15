const { resolve } = require('path')
const yaml = require('js-yaml')
const marked = require('marked')
const {
  mkdirsAsync: mkdirs,
  readFileAsync: readFile,
  writeFileAsync: writeFile
} = require('fs-extra-promise')

const dirDocs = resolve(__dirname, '..', 'docs')
const dirDist = resolve(__dirname, '..', 'dist')

main().catch(({ stack }) => console.error(stack))

async function main () {
  const manifest = { sections: [] }

  await mkdirs(dirDist)

  const { sections } =
    yaml.load(await readFile(resolve(dirDocs, '_index.yaml')))

  for (const section of sections) {
    const dirSectionDocs = resolve(dirDocs, section)
    const dirSectionDist = resolve(dirDist, section)
    const { section: name, description, subsections } =
      yaml.load(await readFile(resolve(dirSectionDocs, '_index.yaml')))
    const index = {
      name,
      slug: section,
      description: description.trim(),
      subsections: []
    }

    await mkdirs(dirSectionDist)

    for (const subsection of subsections) {
      const srcFile = resolve(dirSectionDocs, subsection + '.md')
      const distFile = resolve(dirSectionDist, subsection + '.json')

      const { headers, examples, html } = await parse(srcFile)

      await writeFile(distFile, JSON.stringify({ html, examples }, null, 2))

      index.subsections.push({
        headers,
        slug: subsection,
        url: url(distFile)
      })
    }

    manifest.sections.push(index)
  }

  const manifestFile = resolve(dirDist, 'manifest.json')
  const manifestJSON = JSON.stringify(manifest, null, 2)

  console.log(manifestJSON)

  await writeFile(manifestFile, manifestJSON)
}

function url (path) {
  return path.replace(dirDist, 'https://tweedjs.github.io/docs')
}

async function parse (path) {
  const contents = await readFile(path)
  const [ metadata ] = /^(\w+:\s*.+\n)*/.exec(contents)
  const markdown = contents.slice(metadata.length).toString()

  const headers = metadata
    .split('\n')
    .filter((c) => c !== '')
    .map((s) => s.split(/:\s*/))
    .reduce((metadata, [key, value]) =>
      Object.assign(metadata, { [key.toLowerCase()]: value }),
      {}
    )

  const { html, examples } = compileMarkdown(markdown)

  return { headers, html, examples }
}

function compileMarkdown (source) {
  let examples = []
  const renderer = new marked.Renderer()

  renderer.code = function (code, language) {
    if (language === 'tweed') {
      const [ js, ts ] = code.split(/\s*---\s*/)

      examples.push({
        javascript: codeBlock(js, 'javascript'),
        typescript: codeBlock(ts, 'typescript')
      })

      return '<example-slot></example-slot>'
    }
    return codeBlock(code, language)
  }

  renderer.codespan = codeSpan

  const html = marked(source, { renderer })

  return { html, examples }
}

const { highlight: prism, languages } = require('prismjs/components/prism-core')
require('prismjs/components/prism-clike')
require('prismjs/components/prism-javascript')
require('prismjs/components/prism-markup')
require('prismjs/components/prism-jsx')
const { XmlEntities } = require('html-entities')

require('prismjs/components/prism-bash')

const entities = new XmlEntities()

languages.tweed = languages.extend('jsx')

const keywords = [
  'any',
  'as',
  'async',
  'await',
  'boolean',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'constructor',
  'continue',
  'debugger',
  'declare',
  'default',
  'delete',
  'do',
  'else',
  'end',
  'enum',
  'export',
  'extends',
  'finally',
  'for',
  'from',
  'function',
  'get',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'module',
  'namespace',
  'new',
  'null',
  'number',
  'of',
  'package',
  'private',
  'protected',
  'public',
  'readonly',
  'require',
  'return',
  'set',
  'static',
  'string',
  'super',
  'switch',
  'symbol',
  'this',
  'throw',
  'try',
  'type',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield'
]

languages.tweed.keyword = new RegExp(`\\b(${keywords.join('|')})\\b`)

languages.tweed['class-name'] = [{
  pattern: /(:|class|interface|type|implements|extends|instanceof|new|<|import|{|,)\s*\b[A-Z]\w*/,
  lookbehind: true
}, {
  pattern: /\b[A-Z]\w*\s*(?=\()/
}]

languages.tweed.plain = [{
  pattern: /(<(?!\/)[^>{]+>)(?:(?!<\/)[^<{])*/,
  lookbehind: true,
  greedy: true
}, {
  pattern: /(\}>)(?:(?!<\/)[^<{])*/,
  lookbehind: true,
  greedy: true
}, {
  pattern: /(})[^}{]*(?=<\/)/,
  lookbehind: true,
  greedy: true
}]

languages.tweed.annotation = {
  pattern: /@[\w.]+/
}

function codeBlock (code, language) {
  return `<pre><code>${highlight(code, language)}</code></pre>`
}

function codeSpan (code) {
  return `<code>${highlight(entities.decode(code))}</code>`
}

function highlight (code, language) {
  switch (language) {
    case 'javascript':
    case 'typescript':
    case null:
    case undefined:
      return prism(code, languages.tweed)

    case 'shell':
      return prism(code, languages.bash)

    case 'html':
      return prism(code, languages.markup)

    default:
      throw new Error(`Cannot highlight ${language}`)
  }
}

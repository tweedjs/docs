const { resolve } = require('path')
const yaml = require('js-yaml')
const marked = require('marked')
const {
  readdirAsync: readdir,
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

  for (const section of await readdir(dirDocs)) {
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
        javascript: highlight(js, 'javascript'),
        typescript: highlight(ts, 'typescript')
      })

      return '<example-slot></example-slot>'
    }
    return highlight(code, language)
  }

  const html = marked(source, { renderer })

  return { html, examples }
}

const { highlight: prism, languages } = require('prismjs/components/prism-core')
require('prismjs/components/prism-clike')
require('prismjs/components/prism-javascript')
require('prismjs/components/prism-markup')
require('prismjs/components/prism-jsx')

languages.tweed = languages.extend('jsx')

languages.tweed.annotation = {
  pattern: /@\w+/
}

function highlight (code, language) {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return prism(code, languages.tweed)

    default:
      throw new Error(`Cannot highlight ${language}`)
  }
}

import esbuild from 'esbuild'
import { resolve } from 'path'
import zlib from 'zlib'

function outputSize(name) {
  let size = bytesToSize(zlib.brotliCompressSync(resolve(`bundlers/${name}.min.js`)).length)
  console.log("\x1b[32m", `${name}: ${size}`, "\x1b[0m")
}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return 'n/a'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
}

function build(config) {
  return esbuild.build({
    ...config
  }).catch(() => process.exit(1))
}

// global
function buildGlobal(name) {
  build({
    entryPoints: [resolve(`scripts/${name}.js`)],
    outfile: `bundlers/${name}.global.js`,
    bundle: true,
    platform: 'browser',
    define: { CDN: true }
  })
  // minified version
  build({
    entryPoints: [resolve(`scripts/${name}.js`)],
    outfile: `bundlers/${name}.global.prod.js`,
    bundle: true,
    platform: 'browser',
    define: { CDN: true },
    minify: true
  }).then(() => {
    outputSize(name)
  })
}
// createWidget
function buildCreateWidget(name) {
  build({
    entryPoints: [resolve(`scripts/lesta.createWidget.js`)],
    outfile: `bundlers/${name}.createWidget.js`,
    bundle: true,
    platform: 'browser',
    define: { CDN: true }
  })
  // minified version
  build({
    entryPoints: [resolve(`scripts/${name}.js`)],
    outfile: `bundlers/${name}.createWidget.prod.js`,
    bundle: true,
    platform: 'browser',
    define: { CDN: true },
    minify: true
  }).then(() => {
    outputSize(name)
  })
}
// esm
function buildEsm(name) {
  build({
    entryPoints: [resolve(`scripts/${name}.js`)],
    outfile: `bundlers/${name}.esm.js`,
    bundle: true,
    platform: 'neutral',
    mainFields: ['module', 'main'],
  })
}
function buildCjs(name) {
  build({
    entryPoints: [resolve(`scripts/${name}.js`)],
    outfile: `bundlers/${name}.cjs.js`,
    bundle: true,
    target: ['node10.4'],
    platform: 'node'
  })
}

buildCreateWidget('lesta')
buildGlobal('lesta')
buildEsm('lesta')
buildCjs('lesta')

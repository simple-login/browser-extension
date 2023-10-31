#!/usr/bin/env node

import {createWriteStream, existsSync, mkdirSync} from 'node:fs'
import {join} from 'node:path'
import archiver from 'archiver'

const DEST_DIR = join(__dirname, '../dist')
const DEST_ZIP_DIR = join(__dirname, '../dist-zip')

const extractExtensionData = async () => {
  const extPackageJson = await import('../package.json')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const distManifestJson = await import('../dist/manifest.json')
  const isBeta = distManifestJson.name.match(/beta/i)
  const betaRev = extPackageJson.betaRev

  return {
    name: extPackageJson.name + (isBeta ? '-beta' : '-release'),
    version: extPackageJson.version + (isBeta ? '.' + betaRev : ''),
  }
}

const makeDestZipDirIfNotExists = () => {
  // This is a race condition. It is not recommended to do this
  if (!existsSync(DEST_ZIP_DIR)) {
    mkdirSync(DEST_ZIP_DIR)
  }
}

const buildZip = (src, dist, zipFilename) => {
  console.info(`Building ${zipFilename}...`)

  const archive = archiver('zip', {zlib: {level: 9}})
  const stream = createWriteStream(join(dist, zipFilename))

  return new Promise((resolve, reject) => {
    archive
      .directory(src, false)
      .on('error', (err) => reject(err))
      .pipe(stream)

    stream.on('close', () => resolve())
    archive.finalize()
  })
}

const extractSuffix = () => {
  if (import.meta.env.SUFFIX) {
    return `-${import.meta.env.SUFFIX}`
  }
  return ''
}

const main = async () => {
  const {name, version} = await extractExtensionData()
  const suffix = extractSuffix()
  const zipFilename = `${name}${suffix}-v${version}.zip`

  makeDestZipDirIfNotExists()

  buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename)
    .then(() => console.info('OK'))
    .catch(console.error)
}

main()

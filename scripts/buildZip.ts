import process from 'process'
import { createWriteStream } from 'fs'
import { access, mkdir } from 'fs/promises'
import { join } from 'path'
import archiver from 'archiver'
import extPackageJson from '../package.json' assert { type: 'json' }

const DEST_DIR = join(__dirname, '../dist')
const DEST_ZIP_DIR = join(__dirname, '../dist-zip')

const extractExtensionData = async () => {
  const manifestLocation = join(__dirname, '../dist/manifest.json')
  try {
    await access(manifestLocation)
  } catch (err) {
    console.error('manifest.json not found in dist folder. Please build the extension first.', err)
    process.exit(1)
  }
  const distManifestJson = await Bun.file(manifestLocation).json()
  const isBeta = distManifestJson.name.match(/beta/i)
  const betaRev = extPackageJson.betaRev

  return {
    name: extPackageJson.name + (isBeta ? '-beta' : '-release'),
    version: extPackageJson.version + (isBeta ? '.' + betaRev : '')
  }
}

const makeDestZipDirIfNotExists = () => mkdir(DEST_ZIP_DIR, { recursive: true })

const buildZip = async (src: string, dist: string, zipFilename: string) => {
  console.info(`Building ${zipFilename}...`)

  const archive = archiver('zip', { zlib: { level: 9 } })
  const outputPath = join(dist, zipFilename)
  const stream = createWriteStream(outputPath)

  archive.on('error', (err) => {
    throw err
  })

  archive.pipe(stream)
  archive.directory(src, false)

  await archive.finalize()
}

const extractSuffix = () => {
  if (process.env.SUFFIX) {
    return `-${process.env.SUFFIX}`
  }
  return ''
}

const main = async () => {
  const { name, version } = await extractExtensionData()
  const suffix = extractSuffix()
  const zipFilename = `${name}${suffix}-v${version}.zip`

  await makeDestZipDirIfNotExists()

  await buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename)
  console.info('OK')
}

main()

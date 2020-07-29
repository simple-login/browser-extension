#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const DEST_DIR = path.join(__dirname, '../dist');
const DEST_ZIP_DIR = path.join(__dirname, '../dist-zip'); 

const extractExtensionData = () => {
  const extPackageJson = require('../package.json');
  const distManifestJson = require('../dist/manifest.json');
  const isBeta = distManifestJson.name.match(/beta/i);
  const verPartsCount = extPackageJson.version.split('.').length;

  if (isBeta && verPartsCount !== 4) {
    console.error('Invalid Beta version number');
    process.exit();
  } else if (!isBeta && verPartsCount !== 3) {
    console.error('Invalid Release version number');
    process.exit();
  }

  return {
    name: extPackageJson.name + (isBeta ? '-beta' : '-release'),
    version: extPackageJson.version
  }
};

const makeDestZipDirIfNotExists = () => {
  if(!fs.existsSync(DEST_ZIP_DIR)) {
    fs.mkdirSync(DEST_ZIP_DIR);
  }
}

const buildZip = (src, dist, zipFilename) => {
  console.info(`Building ${zipFilename}...`);

  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(path.join(dist, zipFilename));
  
  return new Promise((resolve, reject) => {
    archive
      .directory(src, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
};

const main = () => {
  const {name, version} = extractExtensionData();
  const zipFilename = `${name}-v${version}.zip`;
  
  makeDestZipDirIfNotExists();

  buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename)
    .then(() => console.info('OK'))
    .catch(console.err); 
};

main();

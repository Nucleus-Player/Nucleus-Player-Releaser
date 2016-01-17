'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const OSX_EXT = '.dmg';
const OSX_PATCH_EXT = '-mac.zip';
const WIN_EXT = '.exe';
const WIN64_EXT = '-x64.exe';
const WIN_NU_EXT = '-full.nupkg';
const WIN64_NU_EXT = 'x64-full.nupkg';
const WIN_NU_DELTA_EXT = '-delta.nupkg';
const WIN64_NU_DELTA_EXT = 'x64-delta.nupkg';

let NUCLEUS_PATH_GLOBAL;
let COUNT = 0;

const last = (string, num) => {
  return string.substr(string.length - num);
};

const upload = (github, id, assetPath, name, suppressError) => {
  if (!fs.existsSync(path.resolve(NUCLEUS_PATH_GLOBAL + assetPath))) {
    return;
  }
  COUNT++;
  console.log('Starting upload - ' + name); // eslint-disable-line
  github.releases.uploadAsset({
    owner: 'Nucleus-Player',
    repo: 'Nucleus-Player-Releases',
    id,
    name,
    filePath: path.resolve(NUCLEUS_PATH_GLOBAL + assetPath),
  }, (err) => {
    if (err && !suppressError) {
      console.log('Something went wrong...'); // eslint-disable-line
      console.error(err); // eslint-disable-line
    } else if (err) {
      console.log('!!! Upload Suppressed - ' + name); // eslint-disable-line
    } else {
      console.log('Upload Successfull - ' + name); // eslint-disable-line
    }
    COUNT--;
    if (COUNT === 0) {
      require('request').get('http://ut.samuel.ninja:6069/api/force');
    }
  });
};

module.exports = (NUCLEUS_PATH, RELEASE_TYPE, github, targetRelease) => {
  let needOSX = RELEASE_TYPE === 'darwin';
  let needOSXPatch = RELEASE_TYPE === 'darwin';
  let needWin = RELEASE_TYPE !== 'darwin';
  let needWin64 = RELEASE_TYPE !== 'darwin';
  let needWinNu = RELEASE_TYPE !== 'darwin';
  let needWin64Nu = RELEASE_TYPE !== 'darwin';
  let needWinNuDelta = RELEASE_TYPE !== 'darwin';
  let needWin64NuDelta = RELEASE_TYPE !== 'darwin';

  NUCLEUS_PATH_GLOBAL = NUCLEUS_PATH;

  _.forEach(targetRelease.assets || [], (asset) => {
    if (last(asset.name, OSX_EXT.length) === OSX_EXT) {
      needOSX = false;
    } else if (last(asset.name, OSX_PATCH_EXT.length) === OSX_PATCH_EXT) {
      needOSXPatch = false;
    } else if (last(asset.name, WIN64_EXT.length) === WIN64_EXT) {
      needWin64 = false;
    } else if (last(asset.name, WIN_EXT.length) === WIN_EXT) {
      needWin = false;
    } else if (last(asset.name, WIN64_NU_EXT.length) === WIN64_NU_EXT) {
      needWin64Nu = false;
    } else if (last(asset.name, WIN_NU_EXT.length) === WIN_NU_EXT) {
      needWinNu = false;
    } else if (last(asset.name, WIN64_NU_DELTA_EXT.length) === WIN64_NU_DELTA_EXT) {
      needWin64NuDelta = false;
    } else if (last(asset.name, WIN_NU_DELTA_EXT.length) === WIN_NU_DELTA_EXT) {
      needWinNuDelta = false;
    }
  });

  const packageJSON = require(path.resolve(NUCLEUS_PATH + '/package.json'));

  if (needOSX) {
    upload(github, targetRelease.id,
      '/dist/Nucleus Player-darwin-x64/Nucleus Player.zip', 'Nucleus Player-mac.zip');
  }
  if (needWin) {
    upload(github, targetRelease.id,
      '/dist/build/installer32/Nucleus PlayerSetup.exe', 'Nucleus Player Setup.win.exe');
  }
  if (needWin64) {
    upload(github, targetRelease.id,
      '/dist/build/installer64/Nucleus PlayerSetup.exe', 'Nucleus Player Setup.win-x64.exe');
  }
  if (needWinNu) {
    upload(github, targetRelease.id,
      '/dist/build/installer32/NucleusPlayer-' + packageJSON.version + '-full.nupkg',
      'NucleusPlayer-' + packageJSON.version + '-full.nupkg');
  }
  if (needWin64Nu) {
    upload(github, targetRelease.id,
      '/dist/build/installer64/NucleusPlayer-' + packageJSON.version + '-full.nupkg',
      'NucleusPlayer-' + packageJSON.version + '-x64-full.nupkg');
  }
  if (needWinNuDelta) {
    upload(github, targetRelease.id,
      '/dist/build/installer32/NucleusPlayer-' + packageJSON.version + '-delta.nupkg',
      'NucleusPlayer-' + packageJSON.version + '-delta.nupkg', true);
  }
  if (needWin64NuDelta) {
    upload(github, targetRelease.id,
      '/dist/build/installer64/NucleusPlayer-' + packageJSON.version + '-delta.nupkg',
      'NucleusPlayer-' + packageJSON.version + '-x64-delta.nupkg', true);
  }
  if (needWinNuDelta) {
    upload(github, targetRelease.id,
      '/dist/build/installer32/RELEASES',
      'RELEASES', true);
  }
  if (needWin64NuDelta) {
    upload(github, targetRelease.id,
      '/dist/build/installer64/RELEASES',
      'RELEASES-x64', true);
  }
  // if (needWinNu) {
  //   pathToAsset = NUCLEUS_PATH + '/dist/built/win/Nuceleus Player Setup.exe';
  //   upload(github, targetRelease.id, pathToAsset, 'Nucleus Player Setup.exe');
  // }
};

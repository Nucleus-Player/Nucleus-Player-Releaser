#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const GitHubApi = require('github');
const yargs = require('yargs').argv;

const uploadAsset = require('./upload');

const NUCLEUS_PATH = yargs['nucleus-path'];
const RELEASE_TYPE = yargs['release-type'];
const GITHUB_KEY = yargs['github-key'] || process.env.GITHUB_KEY;

if (!NUCLEUS_PATH || !RELEASE_TYPE || !GITHUB_KEY) {
  console.log('You must specify all command line options'); // eslint-disable-line
  process.exit(1);
}

const github = new GitHubApi({
  version: '3.0.0',
  headers: {
    'user-agent': 'nucleus-player-releaser',
  },
});
github.authenticate({
  type: 'oauth',
  token: GITHUB_KEY,
});

const packageJSON = require(NUCLEUS_PATH + '/package.json');

const initUploadProccess = () => {
  github.releases.listReleases({
    owner: 'Nucleus-Player',
    repo: 'Nucleus-Player-Releases',
    per_page: 100,
  }, (err, data) => {
    let targetRelease;

    _.forEach(data, (release) => {
      if (release.tag_name === packageJSON.version) {
        targetRelease = release;
        return false;
      }
    });

    if (!targetRelease) {
      github.releases.createRelease({
        owner: 'Nucleus-Player',
        repo: 'Nucleus-Player-Releases',
        tag_name: packageJSON.version,
        name: 'Version ' + packageJSON.version,
        prerelease: true,
      }, initUploadProccess);
    } else {
      uploadAsset(NUCLEUS_PATH, RELEASE_TYPE, github, targetRelease);
    }
  });
};

initUploadProccess();

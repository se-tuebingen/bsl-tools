const utils = require('chromium/utils');
const puppeteer = require('puppeteer-core');
const path = require('path');
const axios = require('axios');

const platform = process.argv[process.argv.length - 1]; // 'linux' | 'mac' | 'win64'
(async () => {
  // const revision = await utils.getLatestRevisionNumber(); // is the latest revision number for current host so unclear if this works on all OSes
  // const jsonAnswer = await axios.get(
  //   `https://omahaproxy.appspot.com/all.json?os=${platform}&channel=stable`
  // );
  // const revision = jsonAnswer.data[0].versions[0].branch_base_position;
  let osString = '';
  switch(platform) {
    case 'linux':
      osString = 'Linux_x64';
      break;
    case 'mac':
      osString = 'Mac';
      break;
    case 'win64':
      osString = 'Win_x64';
      break;
    default:
      console.error(`Unknown platform argument: ${platform}`);
      return;
  }
  const revisionUrl =
    `https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/${osString}%2FLAST_CHANGE?alt=media`;
  console.log(`Trying to fetch revision info from: ${revisionUrl}`);
  const response = await axios.get(revisionUrl);
  const revision = `${response.data}`;
  console.log(revision);
  console.log(`Fetched revision info: trying to install ${revision} for ${platform}`);

  const browserFetcher = puppeteer.createBrowserFetcher({
    platform: platform,
    path: path.join(__dirname, 'chromium')
  });
  console.log('Ready for Download');
  const revisionInfo = await browserFetcher.download(revision);
  console.log('Done');
})();

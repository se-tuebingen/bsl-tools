const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ executablePath: '/snap/bin/chromium'});
  const page = await browser.newPage();
  await page.setViewport({
    width: 640,
    height: 1000,
    deviceScaleFactor: 1,
  });
  const wd = process.cwd();
  await page.goto(`file://${wd}/test.html`);

  // Get location and extent of element we want to screenshot
  const dimensions = await page.evaluate(() => {
    const printEl = document.getElementById('test');
    const pos = printEl.getBoundingClientRect();
    return {
      width: printEl.clientWidth,
      height: printEl.clientHeight,
      x: pos.x,
      y: pos.y
    };
  });
  // wait for css transitions
  await new Promise(resolve => setTimeout(resolve, 2000)); // are 1s but let's be sure
  // generate screenshot
  await page.screenshot({
    path: 'test.png',
    clip: dimensions
  });

  // console.log('Dimensions:', dimensions);

  await browser.close();
})();

const puppeteer = require('puppeteer');
const fsp = require('fs').promises;
const open = require('open');

var size = process.argv[4] || '1280x720', width = parseInt(size.split('x')[0]), height = parseInt(size.split('x')[1]), length = process.argv[5]; length = process.argv[5] ? parseInt(length.replace('s','')) : 5; 

var options = {
  headless: false,
  args: [
    '--enable-usermedia-screen-capturing',
    '--allow-http-screen-capture',
    '--auto-select-desktop-capture-source=racetrack',
    '--load-extension=' + __dirname,
    '--disable-extensions-except=' + __dirname,
    '--disable-infobars',
    '--force-device-scale-factor=1'
  ],
}

const NETWORK_CONFIG_4G = {
  'offline': false,
  'downloadThroughput': 4 * 1024 * 1024 / 8,
  'uploadThroughput': 3 * 1024 * 1024 / 8,
  'latency': 20
}

const player = (a, b) => `<html>
<style>
    body {
        text-align: center;
    }
</style>
<body>
    <video controls autoplay muted width="48%">
        <source src="${a}"
                type="video/webm">
    </video>
    <video controls autoplay muted width="48%">
        <source src="${b}"
                type="video/webm">
    </video>
</body>
</html>`;

async function main(url) {
    const exportname = url.replace('https://','') + '-' + width + 'x' + height + '.webm';
    const browser = await puppeteer.launch(options);
    const pages = await browser.pages();
    const page = pages[0];
    await page._client.send('Emulation.clearDeviceMetricsOverride');
    await page._client.send('Network.emulateNetworkConditions', NETWORK_CONFIG_4G);
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: `${process.cwd()}` });
    await page.setViewport({width: width, height: height, deviceScaleFactor: 1});
    await page.goto(url, {waitUntil: 'networkidle2'});
    await page.setBypassCSP(true);
    await page.evaluate(filename=>{
      window.postMessage({type: 'SET_EXPORT_PATH', filename: filename}, '*')
    }, exportname);
    await page.waitFor(5 * 1000);
    await page.evaluate(filename=>{
      window.postMessage({type: 'REC_STOP'}, '*')
    }, exportname);
    await page.waitForSelector('html.downloadComplete', {timeout: 0});
    await browser.close();
    return exportname;
}

const urls = [process.argv[2], process.argv[3]];

async function init() {
  if (urls.length !== 2) {
    console.log('two urls required');
    return;
  }
  const video1 = await main(urls[0]);
  const video2 = await main(urls[1]);
  const html = player(video1, video2)
  const filename = `${video1}-${video2}-${Date.now()}.html`;
  await fsp.writeFile(filename, html)
  open(`${process.cwd()}/${filename}`)
}

init();


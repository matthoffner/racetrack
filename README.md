# racetrack

Load two pages, record video in webm format. Outputs html file that autoplays pages side by side. 

![](./demo.gif)

Unlike puppetcam, racetrack begins recording immediately rather than onload.

## usage

```sh
npm install
```

```sh
node racetrack.js https://nike.com https://adidas.com 1024x1024
```

## credits

* [puppetcam](https://github.com/muralikg/puppetcam)
* [html2screen for non headless version of puppetcam](https://github.com/Ventricule/html2screen)
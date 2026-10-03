// Runs after `react-scripts build` when NO_CONTACT=true (see cra.js). It finishes the
// parts of a no-contact build that live outside the JavaScript bundle, in build/:
//   index.html  - drops the social preview image (hosted on the developer's Flickr) and
//                 any comment left in the page, and marks the page noindex
//   robots.txt  - drops Sitemap and Host lines, which would advertise the normal domain
// It never runs for a normal build.
const fs = require('fs')
const path = require('path')

const build = path.join(__dirname, '..', 'build')
const ROBOTS_META = '<meta name="robots" content="noindex, nofollow">'

const htmlFile = path.join(build, 'index.html')
let html = fs.readFileSync(htmlFile, 'utf8')
html = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<meta\b[^>]*\b(?:og|twitter):image\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, '')
if (!/<head[^>]*>/i.test(html)) throw new Error('no-contact postbuild: build/index.html has no <head>')
html = html.replace(/<head[^>]*>/i, (head) => head + ROBOTS_META)
fs.writeFileSync(htmlFile, html)

const robotsFile = path.join(build, 'robots.txt')
if (fs.existsSync(robotsFile)) {
    const lines = fs.readFileSync(robotsFile, 'utf8').split(/\r?\n/)
    fs.writeFileSync(robotsFile, lines.filter((line) => !/^\s*(?:sitemap|host)\s*:/i.test(line)).join('\n'))
}

console.log('no-contact postbuild: build/index.html and build/robots.txt updated')

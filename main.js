const electron = require('electron')

const app = electron.app
const BrowserWindow = electron.BrowserWindow


const fs = require('fs')
const path = require('path')
const url = require('url')
const ram = require('random-access-memory')
const hyperdrive = require('hyperdrive')
const discovery = require('hyperdiscovery')
const mirror = require('mirror-folder')
const Dat = require('dat-node')

var link = process.argv[2]
var dir = process.cwd()

let mainWindow

var key = process.argv[2]
if (!key) {
  console.log('Run with: electron ./ <key>')
  process.exit(1)
}

var dest = path.join(__dirname, 'tmp')
fs.mkdirSync(dest)


function createWindow() {
  Dat(ram, {key: key, sparse: true}, function(err, dat) {
    if (err) throw err

    var network = dat.joinNetwork()
    network.once('connection', function(){
      console.log('Connected')
    })

    dat.archive.metadata.update(download)
    console.log(`Downloading: ${dat.key.toString('hex')}\n`)
  })

  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}


function download() {
  var progress = mirror({ fs: dat.archive, name: '/'}, dest, function(err) {
    if (err) throw err
    console.log('Done')
  })

  progress.on('put', function(src) {
    console.log('Downloading', src.name)
  })
}

app.on('ready', createWindow)


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})




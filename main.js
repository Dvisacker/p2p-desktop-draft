const electron = require('electron')

const app = electron.app

const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const ram = require('random-access-memory')
const hyperdrive = require('hyperdrive')
const discovery = require('hyperdiscovery')
const mirror = require('mirror-folder')

var link = process.argv[2]
var dir = process.cwd()

let mainWindow

function createWindow () {

  mainWindow = new BrowserWindow({width: 800, height: 600})

  var archive = hyperdrive(ram, link)
  archive.ready(function() {
    discovery(archive)

    var progress = mirror({ name: '/', fs: archive}, dir, function(err) {
      console.log('done downloading')
    })

    progress.on('put', function(src) {
      console.log(src.name, 'downloaded')
    })
  })


  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))


  mainWindow.on('closed', function () {
    mainWindow = null
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




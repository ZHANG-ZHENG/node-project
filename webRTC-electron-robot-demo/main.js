'use strict'
if(process.env.NODE_ENV=='test'){
	var localWebServer = require('./local-web-server.js');
	localWebServer.initServer();
}else{
	console.log("https and socketio no start,if you want it work,npm test");
}

const electron = require('electron')
const electronApp = electron.app
const BrowserWindow = electron.BrowserWindow
electronApp.commandLine.appendSwitch('ignore-certificate-errors');//https://blog.csdn.net/chengzhf/article/details/106873649 Electron中使用socket.io
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800, 
    height: 600,
    title: "rj远程桌面",
	webPreferences:{
		nodeIntegration:true,  
		contextIsolation:false    
	}	
  });
  mainWindow.setWin

  mainWindow.webContents.openDevTools();
  //mainWindow.webContents.openDevTools({mode: 'bottom'});  

  mainWindow.loadFile('local/index.html');
  //mainWindow.loadURL('https://127.0.0.1/peer/src.html');

//   let view=new BrowserView();
//   view.setBounds({x:10,y:220,width:800,height:300});
//   view.webContents.loadURL('http://127.0.0.1/peer/src.html');
//   mainWindow.setBrowserView(view);

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

electronApp.on('ready', createWindow)

electronApp.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    electronApp.quit()
  }
})

electronApp.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
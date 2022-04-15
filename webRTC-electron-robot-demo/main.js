'use strict'

var http = require('http');
var https = require('https');
var fs = require('fs');
var socketIo = require('socket.io');

var express = require('express');
var serveIndex = require('serve-index');

var USERCOUNT = 3;

var app = express();
app.use(serveIndex('./public'));
app.use(express.static('./public'));



//http server
var http_server = http.createServer(app);
http_server.listen(80, '0.0.0.0');

var options = {
	key : fs.readFileSync('./cert/zdomain.top.key'),
	cert: fs.readFileSync('./cert/zdomain.top.pem')
}

//https server
var https_server = https.createServer(options, app);
// var io = socketIo.listen(https_server);
var io = socketIo(https_server,{
    cors: {
        origin: '*'
    }
});

io.sockets.on('connection', (socket)=> {

	socket.on('message', (room, data)=>{
		socket.to(room).emit('message',room, data);
	});

	socket.on('join', (room)=>{
		socket.join(room);
		var myRoom = io.sockets.adapter.rooms[room]; 
		var users = (myRoom)? Object.keys(myRoom.sockets).length : 0;
		console.log('the user number of room is: ' + users);

		if(users < USERCOUNT){
			socket.emit('joined', room, socket.id); //发给除自己之外的房间内的所有人
			if(users > 1){
				socket.to(room).emit('otherjoin', room, socket.id);
			}
		
		}else{
			socket.leave(room);	
			socket.emit('full', room, socket.id);
		}
		//socket.emit('joined', room, socket.id); //发给自己
		//socket.broadcast.emit('joined', room, socket.id); //发给除自己之外的这个节点上的所有人
		//io.in(room).emit('joined', room, socket.id); //发给房间内的所有人
	});

	socket.on('leave', (room)=>{
		var myRoom = io.sockets.adapter.rooms[room]; 
		var users = (myRoom)? Object.keys(myRoom.sockets).length : 0;
		console.log('the user number of room is: ' + (users-1));
		//socket.emit('leaved', room, socket.id);
		//socket.broadcast.emit('leaved', room, socket.id);
		socket.to(room).emit('bye', room, socket.id);
		socket.emit('leaved', room, socket.id);
		//io.in(room).emit('leaved', room, socket.id);
	});

});

https_server.listen(443, '0.0.0.0');

// https://127.0.0.1/stream/media.html https://127.0.0.1/peer/src.html https://127.0.0.1/peer/des.html
// https://172.20.124.233/peer/src.html
// https://172.20.124.233/peer/src.html https://172.20.124.233/peer/des.html https://test.zdomain.top/peer/des.html
// https://127.0.0.1/chatroom/index.html https://127.0.0.1/peer/des.html

// const { app, BrowserWindow } = require('electron')
// const path = require('path')

// function createWindow () {
//   let win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       // preload: path.join(__dirname, 'preload.js'),
//       nodeIntegration: false,
//       // devTools: true,
//       // webSecurity:false,
//       // experimentalFeatures:true,
//       // contextIsolation:false
//     }
//   });
//   win.webContents.openDevTools();
//   win.loadFile('index.html');
// }
// app.whenReady().then(createWindow)

const electron = require('electron')
const electronApp = electron.app
const BrowserWindow = electron.BrowserWindow
const BrowserView = electron.BrowserView
electronApp.commandLine.appendSwitch('ignore-certificate-errors');//https://blog.csdn.net/chengzhf/article/details/106873649 Electron中使用socket.io
let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800, 
    height: 600,
    title: "rj远程桌面"
  });
  mainWindow.setWin

  //mainWindow.webContents.openDevTools();
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

function initServer(){
	//var http = require('http');
	var https = require('https');
	var fs = require('fs');
	var socketIo = require('socket.io');
	
	var express = require('express');
	var serveIndex = require('serve-index');
	
	var USERCOUNT = 3;
	var config = require('./config/config.json');
	
	var app = express();
	app.use(serveIndex(__dirname+'/public'));
	app.use(express.static(__dirname+'/public'));
	
	
	
	//http server
	// var http_server = http.createServer(app);
	// http_server.listen(80, '0.0.0.0');
	
	var options = {
		key : fs.readFileSync(__dirname+'/cert/zdomain.top.key'),
		cert: fs.readFileSync(__dirname+'/cert/zdomain.top.pem')
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
	
	https_server.listen(config.httpsServerPort, '0.0.0.0');

    console.log("https and socketio,server is started,"+"httpsServerPort="+config.httpsServerPort);
}

function test(){
    
    console.log("hello2");
}

module.exports = {initServer,test}
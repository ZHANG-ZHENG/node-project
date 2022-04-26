'use strict'
const { desktopCapturer } = require('electron')
var robot = require("@jitsi/robotjs");
var config = require('../config/config.json');

var localVideo = document.querySelector('video#localvideo');
// var remoteVideo = document.querySelector('video#remotevideo');

var btnConn =  document.querySelector('button#connserver');
var btnLeave = document.querySelector('button#leave');
var optBw = document.querySelector('select#bandwidth')

var offer = document.querySelector('textarea#offer');
var answer = document.querySelector('textarea#answer');

var pcConfig = {"iceServers":[{"urls":["stun:stun.l.google.com:19302"]},{"urls":["turn:linux.zdomain.top:3478"],"username":"admin","credential":"123456"}],"iceTransportPolicy":"all"};

var localStream = null;
// var remoteStream = null;

var pc = null;
var pcReceiveChannel = null;

var roomid="room-test";
var socket = null;
// var socketRobot = null;

var offerdesc = null;
var state = 'init';
console.log("process.env.NODE_ENV="+process.env.NODE_ENV);
if(process.env.NODE_ENV=='test'){
	document.querySelector('#webAddress').innerHTML = "web访问地址 https://localhost:"+config.httpsServerPort+"/peer/des-media-data-robot.html";
	document.querySelector('#socketInfo').innerHTML = "socket地址：wss://127.0.0.1:8843,socket房间："+roomid;
}else{
	document.querySelector('#webAddress').innerHTML = "web访问地址 https://182.61.37.107/peer/des-media-data-robot.html";
	document.querySelector('#socketInfo').innerHTML = "socket地址："+config.socketSever+",socket房间："+roomid;
}

document.querySelector('#screensize').innerHTML=`宽高比${JSON.stringify(robot.getScreenSize())}`;

let robotEventQueue = [];
var msgX=0;
var msgY=0;
var nowX=0;
var nowY=0;
var robotTimer = null;

function sendMessage(roomid, data){

	console.log('send message to other end', roomid, data);
	if(!socket){
		console.log('socket is null');
	}
	socket.emit('message', roomid, data);
}

function sendMessageRobot(roomid, data){
	// console.log('send messageRobot to other end', roomid, data);
	// if(!socketRobot){
	// 	console.log('socketRobot is null');
	// }
   	var obj = JSON.parse(data);
		switch (obj.event){
		case 'mousemove':
			if(obj.drag==1){
				robot.mouseToggle("down");
				robot.dragMouse(obj.x, obj.y);
			}else{
				msgX=obj.x;
				msgY=obj.y;
				if(robotTimer==null){
					robotTimer = setInterval(()=>{
						if(msgX!=nowX || msgY!=nowY){
							robot.moveMouse(msgX, msgY);
							nowX = msgX;
							nowY = msgY;
						}
						// else{
						// 	console.log("no move");
						// }
					}, 50);
				}				
				// var len = robotEventQueue.unshift(obj);
				// console.log('在开头添加元素后长度变为：' + len + '，添加后，数组为:' + robotEventQueue);
				// if(robotTimer==null){
				// 	robotTimer = setInterval(()=>{
				// 		while(robotEventQueue.length>0){
				// 			var lastObj = robotEventQueue.pop();
				// 			console.log('在末尾移出元素：' + lastObj + '，移出后，数组为:' + robotEventQueue);
				// 			if(robotEventQueue.length==0){
				// 				if(lastObj){
				// 					robot.moveMouse(lastObj.x, lastObj.y);
				// 				}							
				// 				break;
				// 			}
				// 		}
				// 	}, 5);
				// }

				
			}  
			break;
		case "click" :
			robot.mouseClick();
			break;
		case "dblclick" :
		   robot.mouseClick("left",true);
		 break;	
		case "contextmenu" :
			robot.mouseClick('right',false);
			break;
	   case "mousewheel" :
		console.log("obj.event",obj.event+",x="+obj.x+",y="+obj.y);
			robot.scrollMouse(obj.x, obj.y );
		break;
		case "keyTap" :
			console.log("obj.event",obj.event+",key="+obj.key+",y="+obj.y);
		 robot.keyTap(obj.key);
			break;		
		}

	//socketRobot.emit('message', roomid, data);
}

function conn(){
	// socketRobot = io("wss://127.0.0.1:8443");
	// socketRobot.emit('join', roomid);
	
	console.log("socket start");
	//socket = io.connect();
	if(process.env.NODE_ENV=='test'){
		console.log("socketHost default wss://127.0.0.1:8843");
		socket = io.connect("wss://127.0.0.1:8843"); 
	}else{
		console.log("socketHost /soc",config.socketSever);
		socket = io.connect(config.socketSever,{path:"/soc",transports: ["websocket"]});
	}
	
	console.log("socket end");
	socket.on('connect_error', e => {
		console.log('connect_error', e);
	  });

	socket.on('joined', (roomid, id) => {
		console.log('receive joined message!', roomid, id);
		state = 'joined'

		//如果是多人的话，第一个人不该在这里创建peerConnection
		//都等到收到一个otherjoin时再创建
		//所以，在这个消息里应该带当前房间的用户数
		//
		//create conn and bind media track
		createPeerConnection();
		bindTracks();

		btnConn.disabled = true;
		btnLeave.disabled = false;
		console.log('receive joined message, state=', state);
	});

	socket.on('otherjoin', (roomid) => {
		console.log('receive otherjoin message:', roomid, state);

		//如果是多人的话，每上来一个人都要创建一个新的 peerConnection
		//
		if(state === 'joined_unbind'){
			createPeerConnection();
			bindTracks();
		}

		state = 'joined_conn';
		call();

		console.log('receive other_join message, state=', state);
	});

	socket.on('full', (roomid, id) => {
		console.log('receive full message', roomid, id);
		hangup();
		closeLocalMedia();
		state = 'leaved';
		console.log('receive full message, state=', state);
		alert('the room is full!');
	});

	socket.on('leaved', (roomid, id) => {
		console.log('receive leaved message', roomid, id);
		state='leaved'
		socket.disconnect();
		console.log('receive leaved message, state=', state);

		btnConn.disabled = false;
		btnLeave.disabled = true;
	});

	socket.on('bye', (room, id) => {
		console.log('receive bye message', roomid, id);
		//state = 'created';
		//当是多人通话时，应该带上当前房间的用户数
		//如果当前房间用户不小于 2, 则不用修改状态
		//并且，关闭的应该是对应用户的peerconnection
		//在客户端应该维护一张peerconnection表，它是
		//一个key:value的格式，key=userid, value=peerconnection
		state = 'joined_unbind';
		hangup();
		offer.value = '';
		answer.value = '';
		console.log('receive bye message, state=', state);
	});

	socket.on('disconnect', (socket) => {
		console.log('receive disconnect message!', roomid);
		if(!(state === 'leaved')){
			hangup();
			closeLocalMedia();

		}
		state = 'leaved';
	
	});

	socket.on('message', (roomid, data) => {
		console.log('receive message!', roomid, data);

		if(data === null || data === undefined){
			console.error('the message is invalid!');
			return;	
		}

		if(data.hasOwnProperty('type') && data.type === 'offer') {
			
			offer.value = data.sdp;

			pc.setRemoteDescription(new RTCSessionDescription(data));

			//create answer
			pc.createAnswer()
				.then(getAnswer)
				.catch(handleAnswerError);

		}else if(data.hasOwnProperty('type') && data.type == 'answer'){
			answer.value = data.sdp;
			pc.setRemoteDescription(new RTCSessionDescription(data));
		
		}else if (data.hasOwnProperty('type') && data.type === 'candidate'){
			var candidate = new RTCIceCandidate({
				sdpMLineIndex: data.label,
				candidate: data.candidate
			});
			pc.addIceCandidate(candidate);	
		
		}else{
			console.log('the message is invalid!', data);
		
		}
	
	});

	socket.emit('join', roomid);

	return true;
}

function connSignalServer(){
	
	//开启本地视频
	start();

	return true;
}

function getMediaStream(stream){

	if(localStream){
		stream.getAudioTracks().forEach((track)=>{
			localStream.addTrack(track);	
			stream.removeTrack(track);
		});
	}else{
		localStream = stream;	
	}

	//localVideo.srcObject = localStream;

	//这个函数的位置特别重要，
	//一定要放到getMediaStream之后再调用
	//否则就会出现绑定失败的情况
	//
	//setup connection
	conn();

	//btnStart.disabled = true;
	//btnCall.disabled = true;
	//btnHangup.disabled = true;
}


function handleError(err){
	console.error('Failed to get Media Stream!', err);
}


function start(){
	desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: {
			width: 320,
			height: 240,
		}
	}).then( sources =>{
		console.log("sources",sources);
		var source = sources[0];
		var constraints = {
			video : {
				width: 640,	
				height: 480,
				frameRate:15,
				facingMode: 'enviroment',
				deviceId : source.id 
			}, 
			audio : false 
		}	
		constraints = {
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					chromeMediaSourceId: source.id,
					minWidth: 640,
					maxWidth: 1920,
					minHeight: 320,
					maxHeight: 1080
				}
			}
		}
		navigator.mediaDevices.getUserMedia(constraints)
		.then(getMediaStream)
		.catch(handleError);		
	}).catch( error => {
		console.error('desktopCapturer.getSources 失败',error);
	});		
}

// function getRemoteStream(e){
// 	remoteStream = e.streams[0];
// 	remoteVideo.srcObject = e.streams[0];
// }

function handleOfferError(err){
	console.error('Failed to create offer:', err);
}

function handleAnswerError(err){
	console.error('Failed to create answer:', err);
}

function getAnswer(desc){
	pc.setLocalDescription(desc);
	answer.value = desc.sdp;

	//send answer sdp
	sendMessage(roomid, desc);
}

function getOffer(desc){
	pc.setLocalDescription(desc);
	offer.value = desc.sdp;
	offerdesc = desc;

	//send offer sdp
	sendMessage(roomid, offerdesc);	

}

function createPeerConnection(){

	//如果是多人的话，在这里要创建一个新的连接.
	//新创建好的要放到一个map表中。
	//key=userid, value=peerconnection
	console.log('create RTCPeerConnection!');
	if(!pc){
		if(document.querySelector('#useRelay').checked){
			pcConfig.iceTransportPolicy="relay";
		}else{
			pcConfig.iceTransportPolicy="all";
		}
		console.log("pcConfig",pcConfig);		
		pc = new RTCPeerConnection(pcConfig);
		pc.onicecandidate = (e)=>{

			if(e.candidate) {
				sendMessage(roomid, {
					type: 'candidate',
					label:e.candidate.sdpMLineIndex, 
					id:e.candidate.sdpMid, 
					candidate: e.candidate.candidate
				});
			}else{
				console.log('this is the end candidate');
			}
		}

		//pc.ontrack = getRemoteStream;

		pc.createDataChannel('sendDataChannel');
		pc.ondatachannel = (event) => {
			console.log("pc.ondatachannel",event);
			pcReceiveChannel = event.channel;
			pcReceiveChannel.onmessage = onReceiveMessage;
			pcReceiveChannel.onopen = onReceiveChannelStateChange;
			pcReceiveChannel.onclose = onReceiveChannelStateChange;
		};		
	}else {
		console.warning('the pc have be created!');
	}

	return;	
}

function onReceiveMessage(event) {
	console.log("收到事件数据",event.data);
	document.querySelector("input#showData").value = event.data;
	sendMessageRobot(roomid, event.data);
	
}
function onReceiveChannelStateChange(event) {
	console.log("onReceiveChannelStateChange",event);
}

//绑定永远与 peerconnection在一起，
//所以没必要再单独做成一个函数
function bindTracks(){

	console.log('bind tracks into RTCPeerConnection!');

	if( pc === null || pc === undefined) {
		console.error('pc is null or undefined!');
		return;
	}

	if(localStream === null || localStream === undefined) {
		console.error('localstream is null or undefined!');
		return;
	}

	//add all track into peer connection
	localStream.getTracks().forEach((track)=>{
		pc.addTrack(track, localStream);	
	});

}

function call(){
	
	if(state === 'joined_conn'){

		var offerOptions = {
			offerToRecieveAudio: 1,
			offerToRecieveVideo: 1
		}

		pc.createOffer(offerOptions)
			.then(getOffer)
			.catch(handleOfferError);
	}
}

function hangup(){

	if(pc) {

		offerdesc = null;
		
		pc.close();
		pc = null;
	}

}

function closeLocalMedia(){

	if(localStream && localStream.getTracks()){
		localStream.getTracks().forEach((track)=>{
			track.stop();
		});
	}
	localStream = null;
}

function leave() {

	if(socket){
		socket.emit('leave', roomid); //notify server
	}

	hangup();
	closeLocalMedia();

	offer.value = '';
	answer.value = '';
	btnConn.disabled = false;
	btnLeave.disabled = true;
}

//控制传输速率
function chang_bw(){
	//optBw.disabled =true;
	var bw = optBw.options[optBw.selectedIndex].value;
	
	var vsender = null;
	var senders = pc.getSenders();
	senders.forEach(sender=>{
		if(sender&&sender.track && sender.track.kind === 'video'){
			vsender = sender;
		}	
	});
	var parameters= vsender.getParameters();
	if(!parameters.encodings){
		return;
	}
	if(bw === 'unlimited'){
		return;
	}
	console.log("parameters",parameters);
	parameters.encodings[0].maxBitrate = bw * 1000;
	vsender.setParameters(parameters)
		   .then(()=>{
		   		optBw.disabled =false;
		   	 console.log('Successed to set parameters!');
		   })
		   .catch(err=>{
		   		 console.error(err);
		   })
	
}

btnConn.onclick = connSignalServer;
btnLeave.onclick = leave;
optBw.onchange=chang_bw;

//页面加载启动
start();
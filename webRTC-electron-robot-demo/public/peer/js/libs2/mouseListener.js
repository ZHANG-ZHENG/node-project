function MouseListener(){
    this.dom=null;
    this.setting={//默认的参数
       remoteScreen:[0,0], //用来转化成远程的坐标系
	   postMsg:this.postEvent,
	   printCoordinate:false,
    }
	this.domWidth=null;
    this.coordinateRate=1
    this.dragMouse=0
}
MouseListener.prototype.eventKey={
   "mousemove":"move",
   "click":"click",
   "mousewheel":"mousewheel",

}
MouseListener.prototype.constructor === MouseListener

MouseListener.prototype.init=function(domId,opt){
     //配置重写
	Object.assign(this.setting,opt);
	
	this.dom=document.getElementById(domId);

    let w=this.dom.offsetWidth; //用来转化宽度
    let h=this.dom.offsetHeight;
     
    let rate=w/h;
    
   let realrate= this.setting.remoteScreen[0]/this.setting.remoteScreen[1]
   let selectType='x';
    if(rate>realrate){
        selectType='y'
    }else{
        selectType='x'
    }
    if(selectType=='x'){
        this.dom.style.height= w/realrate+"px"
    }if(selectType=='y'){
        this.dom.style.width= h*realrate+"px";
    } 
    this.coordinateRate=this.setting.remoteScreen[0]/this.dom.offsetWidth;
    // this.dom.style.cursor='none'
    //监听各种鼠标键盘事件
    this.mouseMove();
    // 监听鼠标滚轮事件
    this.mousewheel();
     // 监听双击事件
    this.dblclick();
     // 监听点击事件
   this.onclick();
	      // 监听点击事件
   this.keyDown();

   this.mouseDown();
     
}

MouseListener.prototype.mouseMove=function(){
	 let _this= this;
     let move=(e)=>{
        x = e.offsetX*this.coordinateRate;
        y = e.offsetY*this.coordinateRate; 
        let data={"event":"mousemove","drag":this.dragMouse,"x":x,"y":y}    
        this.postEvent(data)
     }
    _this.dom.addEventListener("mousemove",move,false);
}

MouseListener.prototype.mousewheel=function(){
    let _this= this;
    let eventfn=(e)=>{
        if (e.preventDefault)  
        e.preventDefault();  
        if (e.stopPropagation)
        e.stopPropagation();
        //鼠标滚动
        x = 0;
        y = e.wheelDelta;
        let data={"event":"mousewheel","x":x,"y":y}    
        this.postEvent(data)
     }
    this.dom.addEventListener("mousewheel",eventfn,false);
}
MouseListener.prototype.dblclick=function(){
    let _this= this;
    let eventfn=(e)=>{
        x = e.offsetX;
        y = e.offsetY; 
        let data={"event":"dblclick","x":x,"y":y}    
        this.postEvent(data)
     }
      this.dom.addEventListener("dblclick",eventfn,false);
}
MouseListener.prototype.onclick=function(){
    let eventfn=(e)=>{
        x = e.offsetX;
        y = e.offsetY; 
        let data={"event":"click","x":x,"y":y}    
        this.postEvent(data)
     }
      this.dom.addEventListener("click",eventfn,false);
}


MouseListener.prototype.keyDown=function(){

    let eventfn=(e)=>{
        // if (e.preventDefault)  
        // e.preventDefault();  
        // if (e.stopPropagation)
        // e.stopPropagation();
        console.log(e);
      //  console.log(  String.fromCharCode(e.keyCode))
       if(e.ctrlKey||e.altKey||e.shiftKey){
           
        }
        let data={"event":"keyTap","key":e.key,"combineKey":""}    
        this.postEvent(data)
     }
     document.addEventListener("keydown",eventfn,false);
    
}


MouseListener.prototype.mouseDown=function(){

    let event=(e)=>{
        if (e.preventDefault)  
        e.preventDefault();  
        if (e.stopPropagation)
        e.stopPropagation();
        this.dragMouse=1  
     }
    this.dom.addEventListener("mousedown",event,false);

    let eventfn=(e)=>{
        if (e.preventDefault)  
        e.preventDefault();  
        if (e.stopPropagation)
        e.stopPropagation();
        this.dragMouse=0  
     }
    this.dom.addEventListener("mouseup",eventfn,false);

    let event2=(e)=>{
        if (e.preventDefault)  
        e.preventDefault();  
        if (e.stopPropagation)
        e.stopPropagation();
        x = e.offsetX;
        y = e.offsetY; 
        let data={"event":"contextmenu","x":x,"y":y}    
        this.postEvent(data)
     }
    this.dom.addEventListener("contextmenu",event2,false);

}

MouseListener.prototype.postEvent=function(data){ 
    
   console.log("获取的事件数据" +JSON.stringify(data));
    
}
// 坐标转化用
MouseListener.prototype.transforCoordinate=function(){ 
    let  _this =this;
}

MouseListener.prototype.logCoor=function(data){ 
  if(this.printCoordinate) console.log()
}

MouseListener.prototype.fn=function(data){ 
    console.log("获取的事件数据" +JSON.stringify(data));
    
 }



 
 

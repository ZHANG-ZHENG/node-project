function MouseListener(domId){
    this.dom=document.getElementById(domId)
    this.setting={
       screenWidth:100,
       screenHeight:100
    }
}
MouseListener.prototype.eventKey={
   "mousemove":"move",
   "click":"click",
   "mousewheel":"mousewheel",

}
MouseListener.prototype.constructor === MouseListener

MouseListener.prototype.init=function(opt){
    //监听各种鼠标键盘事件
    this.mouseMove();
    // 监听鼠标滚轮事件
    this.mousewheel();
     // 监听点击事件
    this.dblclick();
     // 监听点击事件
     this.onclick();
     
}

MouseListener.prototype.mouseMove=function(){
     let move=(e)=>{
        x = e.offsetX;
        y = e.offsetY; 
        let data={"event":"mousemove","x":x,"y":y}    
        this.postEvent(data)
     }
    this.dom.addEventListener("mousemove",move,false);
}

MouseListener.prototype.mousewheel=function(){
    let eventfn=(e)=>{
        x = e.offsetX;
        y = e.offsetY; 
        let data={"event":"mousewheel","x":x,"y":y}    
        this.postEvent(data)
     }
    this.dom.addEventListener("mousewheel",eventfn,false);
}
MouseListener.prototype.dblclick=function(){
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
MouseListener.prototype.postEvent=function(data){ 
   console.log("获取的事件数据1",JSON.stringify(data));


   
}

MouseListener.prototype.fn=function(data){ 
    console.log("获取的事件数据2",JSON.stringify(data));
    
 }


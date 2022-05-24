'use strict'
//教程 
// https://segmentfault.com/a/1190000019770619?utm_source=tag-newest
// https://blog.51cto.com/u_15358766/3793535

let ffi = require("ffi-napi");
//console.log("ffi",ffi);
var libm = ffi.Library('Desktop4Node.dll', {
	// 函数名 返回类型 传入参数类型2个参数
	'add': [ 'int', [ 'int', 'int' ] ],
	'mouseMove': [ 'int', [ 'int', 'int' ] ],
	'leftClick': [ 'int', [ ] ],
	'rightClick': [ 'int', [ ] ],
});
  
var res = libm.add(3,2);
console.error('res:',res);
libm.mouseMove(3,2);
libm.rightClick();

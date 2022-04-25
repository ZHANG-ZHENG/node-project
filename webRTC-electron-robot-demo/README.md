npm config set electron_mirror "https://npm.taobao.org/mirrors/electron/"
npm install --registry=https://registry.npm.taobao.org


npm start


## 需要重新编译执行


```
 npm rebuild --runtime=electron --target=4.2.12 --disturl=https://atom.io/download/atom-shell --abi=75

./node_modules/.bin/electron-rebuild
```


## 打包相关脚本
  在根目录下直接执行 npm run pack
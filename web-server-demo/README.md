centos:
yum install openssl

生成私钥和证书
openssl req -newkey rsa:2048 -nodes -keyout zztest.com.key -subj "/C=XX/O=XX/OU=XX/OU=XX/OU=XX/CN=zztest.com" -x509 -days 36500 -out zztest.com.crt
参数-nodes取消密码
　　
生成公钥(证书中包含了公钥, 因此直接使用证书生成)
openssl x509 -in zztest.com.crt -outform PEM -out zztest.com.pem
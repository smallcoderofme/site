---
title: Install Nodejs On FreeBSD 11.1
date: 2020-08-14 15:10:21
categories: 
- Web
tags:
- Nodejs
---

### 安装  NodeJS:
这里用懒惰的办法，直接安装二进制包：
``` bash
pkg install node
```
（PS:网络好的话还是ports源码安装比较好）
安装过程是没有任何问题的，但是我想 node -v看下版本测试是否真的安装成功的时候。
然后就出事了：
<font color=#dd0000>Undefined symbol "nghttp2_submit_origin" nodejs FreeBSD</font>
好在FreeBSD的优势就是文档详细，在官方文档找到如下：
<img src="/myblogs.github.io/2020/08/14/Install_Nodejs_On_FreeBSD11/freebsd_node.jpg">
其实真正导致这个问题的是缺少 libnghttp2但是我看到我的系统自带python 版本是python27-2.7.13，为了不出其他的幺蛾子，索性把依赖的库都升级到requires的版本了。
把依赖的包依次安装或更新，问题瞬间解决。完美
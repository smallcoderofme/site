---
title: Pkg update on FreeBSD 11.1
date: 2020-10-19 14:29:28
categories: 
- erlang
tags:
- os
---

今天在安装erlang时出现以下问题：
### 安装 erlang:
直接安装二进制包：

``` bash
pkg install erlang
```
<br/> 
<img src="/myblogs.github.io/2020/10/19/Pkg-update-on-FreeBSD-11-1/error.png">
（PS:网络好的话还是ports源码安装比较好）

解决办法：
``` bash
pkg bootstrap -f
pkg update -f
```

系统更新：
*[原文地址：help-the-world-by-healing-your-nginx-configuration](https://www.freebsd.org/doc/zh_CN/books/handbook/updating-upgrading-freebsdupdate.html/)*
换国内源
``` bash
vi /etc/freebsd-update.conf # change .org to .cn
freebsd-update -r 12.1-RELEASE upgrade
freebsd-update install
``` 
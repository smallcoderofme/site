---
title: Pkg update on FreeBSD 11.1
date: 2020-10-19 14:29:28
categories: 
- erlang
tags:
- os
---

今天在安装erlang时出现以下问题：
### 安装  NodeJS:
直接安装二进制包：
``` bash
pkg install erlang
```
<img src="/myblogs.github.io/2020/10/19/Pkg-update-on-FreeBSD-11-1/error.png">
（PS:网络好的话还是ports源码安装比较好）

解决办法：
``` bash
pkg bootstrap -f
pkg update -f
```
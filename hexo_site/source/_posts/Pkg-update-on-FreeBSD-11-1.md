---
title: Pkg update on FreeBSD 11.1
date: 2020-10-19 14:29:28
tags:
- OS
---

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
---
title: 通过修复NGINX配置帮助世界
date: 2020-08-17 16:29:17
categories: 
- web
tags:
- nginx
---

*[原文地址：help-the-world-by-healing-your-nginx-configuration](https://www.nginx.com/blog/help-the-world-by-healing-your-nginx-configuration/)*
海军上将威廉·麦克雷文2014年著名的演讲，在得克萨斯大学，他说，如果你想改变世界，通过使你的床开始。有时候，小事情可能会产生很大的影响-无论是早上铺床还是对网站的HTTP服务器配置进行少量更改。
这看起来像是夸大其词？2020年的头几个月，我们对世界上正常和合理事物的所有定义都花光了。由于COVID‑19大流行，地球上将近一半的人口被困在自己的家中，因此互联网已成为他们交流，娱乐，购买食物，工作和教育的唯一方式。互联网每周都比以往任何时候都拥有更高的网络流量和服务器负载。根据BroadbandNow在3月25日发布的报告，“在我们分析的200个城市中，有88个（44％）在过去一周内经历了一定程度的网络降级，而之前的10个星期是这样”。
诸如Netflix和YouTube之类的主要媒体平台都在限制其传输质量，以保护网络链接，使人们有更多带宽可用于工作，与家人交流或在学校上虚拟课。但这还不够，因为网络质量逐渐恶化，许多服务器变得超负荷。

### 您可以通过优化网站来提供帮助

如果您拥有网站并可以管理其HTTP服务器配置，则可以提供帮助。进行一些小的更改可以减少用户生成的网络带宽以及服务器的负载。这是双赢的局面：如果您的站点当前负载沉重，则可以减少它，从而为更多的用户提供服务，并可能降低成本。如果负载不是很高，则更快的负载可以改善用户的体验（有时会积极影响您在Google搜索结果中的排名）。

如果您的应用程序每个月有数百万用户，或者是一个包含烘焙食谱的小博客，那都没有关系–您消除的每千字节网络流量都释放了容量，供那些迫切需要在线检查医学检查结果或创建包裹标签的人使用给亲戚寄一些重要的东西

在此博客中，我们介绍了您可以对NGINX配置进行的一些简单但功能强大的更改。举一个真实的例子，我们使用我的朋友Rogalove的电子商务网站，该公司是我居住的波兰一家生态化妆品制造商。该网站是运行NGINX 1.15.9作为其Web服务器的相当标准的WooCommerce安装。为了进行计算，我们假设该网站每天获得100个唯一身份用户，其中30％的用户为固定访问者，并且每个用户在会话期间平均访问4个页面。

这些技巧是您可以立即采取的简单步骤，以提高性能并减少网络带宽。如果您要处理大量流量，则可能需要实施更复杂的更改以产生重大影响，例如，调整操作系统和NGINX，提供正确的硬件容量，以及（最重要的是）启用和调整缓存。查看这些博客文章以获取详细信息：

* [调整NGINX的性能](https://www.nginx.com/blog/tuning-nginx/)
* [性能调优–技巧与窍门](https://www.nginx.com/blog/performance-tuning-tips-tricks/)
* [10倍应用程序性能的10个技巧](https://www.nginx.com/blog/10-tips-for-10x-application-performance/)
* [在裸机服务器上部署NGINX Plus的规模调整指南](https://www.nginx.com/resources/datasheets/nginx-plus-sizing-guide/)
* [NGINX和NGINX Plus缓存指南](https://www.nginx.com/blog/nginx-caching-guide/)
* [使用NGINX进行微缓存的好处](https://www.nginx.com/blog/benefits-of-microcaching-nginx/)

### 为HTML，CSS和JavaScript文件启用Gzip压缩

如您所知，用于在现代网站上构建页面的HTML，CSS和JavaScript文件可能非常庞大。在大多数情况下，Web服务器可以即时压缩这些和其他文本文件，以节省网络带宽。

<img src="/myblogs.github.io/2020/08/17/通过修复NGINX配置帮助世界/rogalove-devtools-no-gzip.png">

如您在左下方所见，没有压缩：文本文件的大小为1.15 MB，并且传输了很多数据。

默认情况下，NGINX中禁用压缩，但是根据您的安装或Linux发行版，某些设置可能会在默认的nginx.conf文件中启用。在这里，我们在NGINX配置文件中启用gzip压缩：

``` bash
gzip on;
gzip_types application/xml application/json 
text/css text/javascript application/javascript;
gzip_vary on;
gzip_comp_level 6;
gzip_min_length 500;
```

如您在以下屏幕截图中所见，压缩后的数据传输量仅为260 KB ，减少了约80％！对于页面上的每个新用户，您可以节省大约917 KB的数据传输。对于我们的WooCommerce安装，每天62 MB，或每月1860 MB。

<img src="/myblogs.github.io/2020/08/17/通过修复NGINX配置帮助世界/rogalove-devtools-gzip.png">

### 设置缓存头

当浏览器检索网页的文件时，它会将副本保留在本地磁盘缓存中，这样，当您再次访问该页面时，它不必从服务器重新获取文件。每个浏览器都使用自己的逻辑来决定何时使用文件的本地副本以及何时在服务器上更改了文件时再次获取它。但是，作为网站所有者，您可以在发送的HTTP响应中设置缓存控制和过期标头，以提高浏览器的缓存行为的效率。从长远来看，您会收到很多不必要的HTTP请求。

首先，您可以为字体和图像设置较长的缓存过期时间，这些字体和图像可能不会经常更改（即使更改，它们通常也会获得新的文件名）。在以下示例中，我们指示客户端浏览器将字体和图像在本地缓存中保留一个月：

``` bash
location ~* \.(?:jpg|jpeg|gif|png|ico|woff2)$ {
    expires 1M;
    add_header Cache-Control "public";
}
```

### 启用HTTP / 2协议支持

HTTP / 2是用于服务网页的下一代协议，旨在更好地利用网络和主机服务器。根据Google文档，它可以更快地加载页面： 生成的协议对网络更友好，因为与HTTP / 1.x相比，使用的TCP连接更少。这意味着与其他流量的竞争减少，连接寿命更长，从而可以更好地利用可用网络容量。 NGINX 1.9.5和更高版本（以及NGINX Plus R7和更高版本）支持HTTP / 2协议，您所需要做的就是启用它。为此，请在您的NGINX配置文件中http2的listen指令中包含参数：

``` bash
listen 443 ssl http2;
```
请注意，在大多数情况下，您还需要启用TLS才能使用HTTP / 2。 您可以通过HTTP2.Pro服务验证您（或任何站点）是否支持HTTP/2:
<img src="/myblogs.github.io/2020/08/17/通过修复NGINX配置帮助世界/rogalove-http2-pro.png">

### 优化记录
让自己喝一杯自己喜欢的饮料，舒适地坐着，然后思考：您上次查看访问日志文件是什么时候？上周，上个月，从来没有？即使将其用于站点的日常监视，您也可能只关注错误（400和500状态代码等），而不关注成功的请求。

通过减少或消除不必要的日志记录，可以节省服务器上的磁盘存储，CPU和I / O操作。这不仅使您的服务器更快一点-如果将您部署在云环境中，则释放的I / O吞吐量和CPU周期可能为同一虚拟机上的其他虚拟机或应用程序节省生命。

有几种不同的方法可以减少和优化日志记录。在这里，我们重点介绍三个。

#### 方法1：禁用页面资源请求的记录
如果您不需要记录检索普通页面资源（例如图像，JavaScript文件和CSS文件）的请求，则这是一种快速简便的解决方案。您需要做的就是创建一个location与这些文件类型匹配的新块，并禁用其中的日志记录。（您也可以将此access_log指令添加到我们设置标头的上方的location块中。）Cache-Control

``` bash
location ~* \.(?:jpg|jpeg|gif|png|ico|woff2|js|css)$ {
        access_log off;
    }
```

#### 方法2：禁用成功请求的日志记录
这是一种更强大的方法，因为它会丢弃带有或响应代码的查询，仅记录错误。它比方法1稍微复杂一点，因为它取决于如何配置NGINX日志记录。在我们的示例中，我们使用Ubuntu Server发行版中包含的标准nginx.conf，因此，无论虚拟主机如何，所有请求都记录到/var/log/nginx/access.log中。2xx3xx

使用官方NGINX文档中的示例，让我们打开条件日志记录。创建一个变量$loggable，并将其设置为，0以使用和代码进行请求，否则设置为 。然后在指令中将此变量作为条件引用。2xx3xx1access_log

这是/etc/nginx/nginx.conf中http上下文中的原始指令：
``` bash
access_log /var/log/nginx/access.log;
```

添加一个map块并从access_log指令中引用它：
``` bash
map $status $loggable {
    ~^[23] 0;
    default 1;
}
access_log /var/log/nginx/access.log combined if=$loggable;
```
请注意，尽管这combined是默认的日志格式，但是在包含if参数时，您需要明确指定它。

#### 方法3：使用缓冲最小化I / O操作
即使您要记录所有请求，也可以通过打开访问日志缓冲来最大程度地减少I / O操作。使用此指令，NGINX会等待将日志数据写入磁盘，直到填满512 KB缓冲区或自上次刷新以来经过1分钟（以先发生者为准）。
``` bash
access_log /var/log/nginx/access.log combined buffer=512k flush=1m;
```

### 限制特定URL的带宽

如果服务器提供较大的文件（或较小但非常受欢迎的文件，例如表单或报表），则设置客户端下载文件的最大速度可能很有用。如果您的站点已经承受了很高的网络负载，则限制下载速度会留下更多带宽，以使应用程序的关键部分保持响应速度。这是硬件制造商使用的非常流行的解决方案–您可能需要等待更长的时间才能为打印机下载3 GB的驱动程序，但是同时有成千上万的其他人下载您仍然可以下载。😉

使用limit_rate指令限制特定URL的带宽。在这里，我们将/ download 下每个文件的传输速率限制为每秒50 KB。
``` bash
location /download/ {
    limit_rate 50k;
}
```      
您可能还希望仅对较大的文件进行速率限制，这可以使用limit_rate_after指令进行。在此示例中，每个文件（来自任何目录）的前500 KB都不受速度限制地进行传输，之后的所有内容均以50 KB / s为上限。这样可以加快网站关键部分的交付速度，同时降低其他部分的速度。
``` bash
location / {
    limit_rate_after 500k;
    limit_rate 50k;
}
```     
请注意，速率限制适用于浏览器和NGINX之间的单个HTTP连接，因此请不要阻止用户使用下载管理器来解决速率限制。 最后，您还可以限制到服务器的并发连接数或请求速率。有关详细信息，请参见我们的文档。

### 摘要
我们希望这五个技巧能帮助您优化网站的性能。速度和带宽增益因网站而异。即使调整您的NGINX配置似乎并没有显着释放带宽或提高速度，成千上万的网站单独调整其NGINX配置的整体影响还是会加在一起。我们的全球网络得到更有效的利用，这意味着最关键的服务将在需要时提供。 如果您在站点上遇到有关NGINX的任何问题，我们将为您提供帮助！在COVID‑19大流行期间，NGINX员工和社区正在监视Stack Overflow 1上的NGINX通道，并尽快答复问题和要求。 如果您在流行病最前沿的组织工作并有高级需求，则您可能有资格获得最多五个免费的NGINX Plus许可证以及更高级别的F5 DNS负载平衡器云服务。有关详细信息，请参见受COVID‑19影响的网站的免费资源。 还可以查看该博客，了解使用NGINX和F5的免费资源来提高网站性能的其他简便方法的摘要。
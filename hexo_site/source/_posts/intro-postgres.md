---
title: intro_postgres
date: 2020-09-22 09:46:32
categories: 
- SQL
tags:
- postgresql
---

#### 创建数据库：
``` bash
createdb -h localhost -U postgres -p 5432 mydb
```

#### 用户登陆：
``` bash
psql -h localhost -U postgres -p 5432 mydb
```

#### 以超级用户登陆：
``` bash
sudo su - postgres   1234567890
```

#### 删除或者创建用户皆以数据库为依托：
``` bash
psql sqlname
drop user role
```

#### 创建角色和将数据库分配给角色：
``` bash
CREATE ROLE name PASSWORD 'string'
CREATE DATABASE exampledb OWNER dbuser
```

#### 删除表：
``` bash
DROP TABLE tablename
```

#### 删除表数据,但保留表结构：
``` bash
delete from users
```

#### 超级管理员 postgres 登录，创建数据库并移交给某个用户：
``` bash
psql -h localhost -U postgres
CREATE DATABASE tempDB OWNER sunshuai
```

#### 超级管理员直接创建数据库（所有者为超级管理员）：
``` bash
createdb -h localhost -U postgres -p 5432 tempDB
```

#### 备份和恢复：
``` bash
pg_dump -h localhost -U sunshuai tempdb > dumpfile
psql dbname < dumpfile
```

#### 赋予角色登陆权限
``` bash
psql -h localhost -U postgres
ALTER ROLE "asunotest" WITH LOGIN
```
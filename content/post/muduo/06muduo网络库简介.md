---
title: "06 muduo 网络库简介"
date: 2025-11-16T14:17:14+08:00
author: ["寒江雪"]

categories:
- muduo
- 多线程
- linux
- c++

description: "" # 文章描述，与搜索优化相关
summary: "muduo 文章阅读" # 文章简单描述，会展示在主页
draft: false # 是否为草稿
math: true # 启用/禁用KaTeX渲染。
comments: true
image:  # 文章图片
toc: true # 目录 默认值 .Site.Params.Article.toc， bool 类型，至少有一个标题才会显示
showToc: true # 显示目录
TocOpen: true # 自动展开目录
readingTime: true # 显示阅读时间
autonumbering: true # 目录自动编号
hidemeta: false # 是否隐藏文章的元信息，如发布日期、作者等
disableShare: true # 底部不显示分享栏
searchHidden: false # 该页面可以被搜索到
showbreadcrumbs: true #顶部显示当前路径
mermaid: true # 是否流程图渲染
style:  # 用于文章页面中出现的分类术语徽章的额外CSS样式。用于列表页面，目前仅支持background和color
    background: "white"
    color: "black"
license: 
    enabled: false
    default: Licensed under CC BY-NC-SA 4.0
cover:   # 封面的详细信息
    image: ""  # 封面图片
    caption: "" # 封面图片下方显示的文字说明或标题
    alt: "" # 封面图片提供替代文本
    relative: false # 所提供的图片路径是否为相对路径
---

## 安装

[muduo 地址](https://github.com/chenshuo/muduo)

安装 cmake

```bash
sudo apt-get install cmake g++ make
```

安装依赖 boost

```bash
sudo apt-get install libboost-dev libboost-test-dev
```

三个非必要依赖库：curl、c-ares DNS、 Google Protobuf。

```bash
sudo apt-get install libcurl4-openssl-dev libc-ares-dev protobuf-compiler libprotobuf-dev
```

muduo 编译

```bash
git clone https://github.com/chenshuo/muduo
cd muduo

./build.sh -j2 #编译 muduo 库和自带的用例，生成可执行文件和静态库分别位于 ../build/debug/{bin,lib}

./build.sh install #将 muduo 头文件和库文件安装到 ../build/debug-install/{include,lib}

## 编译 release 包（以 -O2 优化）
BUILD_TYPE=release ./build.sh -j2 #编译 muduo 库和自带的用例，生成可执行文件和静态库分别位于 ../build/release/{bin,lib}

BUILD_TYPE=release ./build.sh install #将 muduo 头文件和库文件安装到 ../build/release-install/{include,lib}，以便 muduo-protorpc 和 muduo-udns 等库使用
```

使用 muduo 库只需要设置好头文件路径（../build/release-install/include）和库文件路径（../build/release-install/lib）并链接相应的静态库文件（-lmuduo_net -lmuduo_base）。

如何 CMake 和 makefile 编译基于 muduo 的程序：https://github.com/chenshuo/muduo-tutorial

## 目录结构

```bash
# tree -L 1 muduo
muduo
├── BUILD.bazel     # Bazel 构建工具的配置文件
├── CMakeLists.txt  # cmake 编译文件
├── ChangeLog       # 项目变更日志
├── ChangeLog2      # 项目变更日志
├── License         # 项目许可证文件
├── README          # 项目说明文档
├── WORKSPACE       # Bazel 构建系统的工作区配置文件，用于声明项目的外部依赖（如第三方库），与 BUILD.bazel 配合使用
├── build.sh        # 编译脚本
├── contrib         # 第三方贡献的扩展模块或工具
├── examples        # 示例代码
├── muduo           # muduo 主体
└── patches         # 补丁文件

5 directories, 8 files
```

基础库

```bash
# tree -L 1 muduo/muduo/base/
muduo/muduo/base/
├── AsyncLogging.cc
├── AsyncLogging.h          # 异步日志 backend
├── Atomic.h                # 原子操作
├── BUILD.bazel
├── BlockingQueue.h         # 无界阻塞队列（生产者消费者队列）
├── BoundedBlockingQueue.h  # 有界阻塞队列
├── CMakeLists.txt
├── Condition.cc
├── Condition.h             # 条件变量，与 Mutex 一起使用
├── CountDownLatch.cc
├── CountDownLatch.h        # “倒计时门闩” 同步
├── CurrentThread.cc
├── CurrentThread.h
├── Date.cc
├── Date.h                  # julian 日期库（公历）
├── Exception.cc
├── Exception.h             # 带 stack trace 的异常基类
├── FileUtil.cc
├── FileUtil.h
├── GzipFile.h
├── LogFile.cc
├── LogFile.h
├── LogStream.cc
├── LogStream.h
├── Logging.cc
├── Logging.h               # 简单日志
├── Mutex.h                 # 互斥锁
├── ProcessInfo.cc
├── ProcessInfo.h           # 进程信息
├── Singleton.h             # 线程安全的 Singleton
├── StringPiece.            # 字符串传递类型
├── Thread.cc
├── Thread.h                # 线程对象
├── ThreadLocal.h           # 线程局部数据
├── ThreadLocalSingleton.h  # 每个线程的 Singleton
├── ThreadPool.cc
├── ThreadPool.h            # 简单的固定大小线程池
├── TimeZone.cc
├── TimeZone.h              # 时区与夏令时
├── Timestamp.cc
├── Timestamp.h             # UTC 时间戳
├── Types.h                 # 基本类型声明
├── WeakCallback.h
├── copyable.h              # 空基类，用于标识值类型
├── noncopyable.h
└── tests                   # 测试用例

2 directories, 45 files
```

网络核心库

基于 Reactor 模式的网络库，核心是个事件循环 EventLoop，用于响应计时器，和 IO 事件。

```bash
tree -L 1 muduo/muduo/net
muduo/muduo/net
├── Acceptor.cc
├── Acceptor.h              # 接收器，用于服务端网络连接
├── BUILD.bazel
├── Buffer.cc
├── Buffer.h                # 缓冲区，非阻塞 IO 必备
├── CMakeLists.txt
├── Callbacks.h
├── Channel.cc
├── Channel.h               # 用于每个 socket 连接的事件分发
├── Connector.cc
├── Connector.h             # 连接器，用于客户端发起连接
├── Endian.h                # 网络字节序与本机字节序转换
├── EventLoop.cc
├── EventLoop.h             # 事件分发器
├── EventLoopThread.cc
├── EventLoopThread.h       # 专门用于 EventLoop 的线程
├── EventLoopThreadPool.cc
├── EventLoopThreadPool.h   # muduo 默认 多线程 IO 模型
├── InetAddress.cc
├── InetAddress.h           # Ip 地址的简单封装
├── Poller.cc
├── Poller.h                # io multiplexing的基类
├── Socket.cc
├── Socket.h                # 封装 socket 描述符，用于关闭连接
├── SocketsOps.cc
├── SocketsOps.h            # 封装底层 socket api
├── TcpClient.cc
├── TcpClient.h             # Tcp 客户端
├── TcpConnection.cc
├── TcpConnection.h
├── TcpServer.cc
├── TcpServer.h             # Tcp 服务端
├── Timer.cc
├── Timer.h
├── TimerId.h
├── TimerQueue.cc
├── TimerQueue.h
├── ZlibStream.h
├── boilerplate.cc
├── boilerplate.h
├── http                    # 网络附属库 http，需要 -lmuduo_http链接
├── inspect                 # 网络附属库 窥探进程内部信息，需要 -lmuduo_inspect链接
├── poller                  # Io multiplexing 实现
├── protobuf
├── protorpc
└── tests                   # 测试用例

7 directories, 40 files
```

muduo 头文件使用前置声明，减少头文件引入的依赖关系。

https://github.com/chenshuo/muduo-udns ：基于 UDNS 的异步 DNS 解析

https://github.com/chenshuo/muduo-protorpc：基于 muduo 的 RPC 框架，自动管理对象生命周期。

TCP 网络编程最本质的是处理三个半事件：
1. 连接建立。（客户端发起连接，服务端被动接受连接）
2. 消息到达，文件描述符可读。（阻塞和非阻塞，如何处理分包，应用层的缓冲如何设计等）
3. 连接断开。（主动断开和被动断开）
3.5. 消息发送完毕（数据写入操作系统的缓冲区，将TCP协议栈负责数据的发送和重传，不代表对方已经收到数据）。

## 编译 c-ares 相关问题

ARES_VERSION 是 c-ares 库提供的一个预定义宏，在头文件<ares.h>中，它表示当前使用的 c-ares 库的版本号。这个宏的值是一个 24 位的十六进制数

0x010F04 表示 c-ares 1.15.4 版本
0x010500 表示 c-ares 1.5.0 版本

#if ARES_VERSION >= 0x010500 的含义

这行代码是 C/C++ 预处理器的条件编译指令，它的作用是：

"如果当前使用的 c-ares 库版本大于或等于 1.5.0，则编译下面的代码块；否则，跳过该代码块或编译替代代码。"

## Reference

http://blog.csdn.net/Solstice/archive/2010/03/10/5364096.aspx

http://www.oschina.net/question/28_61182

http://aur.archlinux.org/packages.php?ID=49251

http://www.cs.nott.ac.uk/~cah/G51ISS/Document/NoSliverBullet.html

http://redmin.lighttpd.net/issues/show/2105

http://download.lighttpd.net/lighttpd/security/lighttpd_sa_2010_01.txt

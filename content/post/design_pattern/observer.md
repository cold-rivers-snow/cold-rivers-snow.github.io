---
title: "观察者模式"
date: 2025-11-19T19:04:14+08:00
author: ["寒江雪"]

categories:
- 设计模式

description: ""
summary: "设计模式笔记"
draft: false
math: true
comments: true
image:
toc: true
showToc: true
TocOpen: true
readingTime: true
autonumbering: true
hidemeta: false
disableShare: true
searchHidden: false
showbreadcrumbs: true
mermaid: true
style:
    background: "white"
    color: "black"
license: 
    enabled: false
    default: Licensed under CC BY-NC-SA 4.0
cover:
    image: ""
    caption: ""
    alt: ""
    relative: false
---

**观察者模式（Observer Pattern）** 是一种行为型设计模式，它定义了对象之间 **一对多的依赖关系**，当一个对象（称为“主题”或“被观察者”）的状态发生改变时，所有依赖于它的对象（称为“观察者”）都会自动收到通知并更新。

## 🎯 核心思想

- **解耦**：被观察者和观察者之间松耦合，彼此不知道对方的具体实现。
- **自动通知**：被观察者状态变化时，自动广播通知给所有注册的观察者。
- **动态注册/注销**：观察者可以动态地添加或移除。

## 🧱 角色组成

| 角色 | 说明 |
|------|------|
| **Subject（主题 / 被观察者）** | 它保存着被观察的状态。它维护一个观察者列表，并提供用于订阅、取消订阅和通知观察者的方法 |
| **Observer（观察者）** | 定义接收更新的接口，通知观察者主题的状态变化 |
| **ConcreteSubject（具体主题）** | 具体的被观察者，状态变化时通知所有观察者 |
| **ConcreteObserver（具体观察者）** | 实现更新逻辑，对接收到的通知做出反应 |

## 🌐 实际应用场景

| 场景 | 说明 |
|------|------|
| **GUI 事件系统** | 按钮点击、鼠标移动等事件通知 |
| **MVC 架构** | View 观察 Model 的变化 |
| **消息队列 / 发布-订阅系统** | 如 Kafka、Redis Pub/Sub |
| **游戏开发** | 角 |
| **日志监控** | 日志生成时通知色状态变化通知 UI 或 AI多个处理模块 |
| **股票价格监控** | 股价变动通知多个投资者对象 |

---

## ✅ 优点

| 优点 | 说明 |
|------|------|
| **松耦合** | 被观察者和观察者之间无直接依赖 |
| **可扩展性** | 可以动态添加/删除观察者 |
| **支持广播通信** | 一个主题可通知多个观察者 |
| **符合开闭原则** | 扩展新观察者无需修改主题 |

---

## ❌ 缺点

| 缺点 | 说明 |
|------|------|
| **性能问题** | 观察者过多时，通知可能耗时 |
| **内存泄漏风险** | 若未正确注销，观察者可能无法被释放（尤其在使用裸指针时） |
| **通知顺序不确定** | 通常不保证通知顺序 |
| **循环依赖** | 观察者反过来影响被观察者可能导致无限循环 |

---

## 🆚 与发布-订阅模式（Pub-Sub）的区别

| 特性 | 观察者模式 | 发布-订阅模式 |
|------|------------|----------------|
| 耦合度 | 紧耦合（直接引用） | 松耦合（通过消息中间件） |
| 通信方式 | 同步调用 | 通常异步 |
| 中间件 | 无 | 有（如消息队列） |
| 适用范围 | 同一进程内 | 可跨进程、跨网络 |

> 🔍 **简单说**：观察者模式是“直接通知”，发布-订阅是“通过邮局中转”。

## ✅ 总结

观察者模式是一种强大且常用的设计模式，特别适合：

- 需要 **状态变化通知** 的场景
- 实现 **事件驱动架构**
- 构建 **响应式系统**

## 实现

{{< remotecode "https://raw.githubusercontent.com/cold-rivers-snow/recipes/master/designpattern/observer.cpp" "c++" "linenos=true" >}}

## Refernece

https://www.geeksforgeeks.org/system-design/observer-pattern-c-design-patterns/
https://refactoring.guru/design-patterns/observer/cpp/example
https://www.bogotobogo.com/DesignPatterns/observer.php
https://medium.com/@lokeshbihani99/observer-pattern-in-c-366a1e9226f6
https://github.com/gayashanbc/observer-pattern-cpp

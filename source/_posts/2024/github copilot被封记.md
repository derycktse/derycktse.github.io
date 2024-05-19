---
date: 2024-04-11 11:00:00
title: github copilot被封记
---
# 背景
2024-03-29晚上使用vs code, 发现我的copilot一直不起作用了。

# 分析
一开始想着可能我配置错了，尝试了各种方法，都不行：
1. 切换更早版本的copilot（一年前的版本）
2. 换一台笔记本
3. 用其他的IDE

copliot 的终端报错显示
```
[INFO] [auth] [2024-03-29T14:22:41.063Z] Invalid copilot token: missing token: 403 
[ERROR] [default] [2024-03-29T14:22:41.065Z] GitHub Copilot could not connect to server. Extension activation failed: "Contact Support. You are currently logged in as derycktse."
```

琢磨了一下看着像是被封了

# 处理
于是在官网找到客服提ticket实锤被封。
GitHub回复检测我的账号有部署服务的嫌疑，不能解禁。
![img](https://github.com/derycktse/Note/assets/3389862/9ddc188b-b3db-4827-b663-690e95668ed6)
因为我在公司使用了，而公司出口IP走的腾讯云。于是被github 的安全机制扫描出来给封禁了。

于是我质疑他们只看来源不看使用量的策略，毕竟我个人使用的话，这个量还是微乎其微的。
![img](https://github.com/derycktse/Note/assets/3389862/52c2cc78-2c10-4e59-a3c5-6fdb1b352e24)
最终客服成功给我解封了

---
tags:
  - SEO
  - DataAnalytics
title: 使用Google Analytics
date: 2024-07-28 21:58
---
# Google Analytics
目前市场流量分析工具，Google Analytics的占有为全球第一
2024年7月开始，Google Universal Analytics开始全面停用，所有服务切换到了GA4。
> **紧急通知：** 自 2024 年 7 月 1 日起，您将无法通过界面/API 以及任何产品集成功能（例如 Google Ads 或 Search Ads 360）访问 Universal Analytics 数据。如果您尚未完成迁移，请通过[设置助理](https://support.google.com/analytics/answer/10110290) 开始使用 Google Analytics 4 (GA4)。如果您想要继续访问媒体资源中的数据，则应立即[下载自己的数据](https://support.google.com/analytics/answer/11583528#export&zippy=%2Chow-can-i-export-data-from-my-universal-analytics-property) 。

##  Google Analytics 4 
 Google Analytics 4，即GA4，为GA的第4个版本。
## Google Analytics 的各个版本
严格来说，并没有一个被正式称为 "GA3" 的版本。Google Analytics 的版本命名并不是按照数字顺序进行的，但我们可以根据其发展历程来理解不同版本的演变。
1. Urchin：
    - Google Analytics 的前身是 Urchin，Google 在2005年收购了 Urchin Software Corporation，并基于其技术推出了 Google Analytics。
2. Classic Google Analytics (GA1)：
    - 这是 Google Analytics 的第一个版本，使用了 Urchin Tracking Module (UTM) 代码进行数据收集。
3. Universal Analytics (GA2)：
    - 2012年，Google 推出了 Universal Analytics，这是一个重大升级，采用了新的数据模型和跟踪代码（analytics.js），并引入了许多新功能，如跨设备跟踪和更灵活的数据收集。
4. Google Analytics 4 (GA4)：
    - 2020年，Google 推出了 Google Analytics 4，这是一个全新的版本，采用了基于事件的数据模型，旨在更好地支持跨平台（网站和应用）跟踪和分析。
说明: 
1. Google 并没有正式使用 "GA3" 这个名称。Universal Analytics 通常被视为 Google Analytics 的第二个主要版本（GA2），而 GA4 则是第三个主要版本。
# 接入方式
GA4 接入方式有两种：
1. gtag.js
2. 使用Google Tag Manager

# Global Site Tag (gtag.js)
Google在2017年发布了全球站点标签（gtag.js）。这个新的库可以在Google的网站和转化测量产品中通用，使得用户只需使用gtag.js代码就可以管理不同的产品，而不需要管理多个标签。在gtag之前，Google Analytics和Google Ads使用的是不同的标签框架。
gtag.js框架以统一和标准化的方式向Google Analytics、Google Ads（以前称为Google Adwords）和其他Google服务发送数据。
## 使用gtag接入ga4
1. 登录[Google analytic 后台](https://analytics.google.com/analytics/web), 在Amin -> Property settings -> Data Collection and modification -> Data streams 可以找到一个 `G-*` 开头的ID，这就是你的GA4 ID 
![image](https://github.com/user-attachments/assets/09ee0ca2-a1e0-48e2-8f88-b94418a51a48)

2. 使用gtag 接入
![image](https://github.com/user-attachments/assets/43c7d5f3-77fa-4307-a7dd-88d5836ff2db)

# 参考
- [About the Google tag](https://developers.google.com/tag-platform/gtagjs)
- [先利其器 - 查看 Google Analytics 报表的小诀窍](https://zhuanlan.zhihu.com/p/53993217?utm_source=wechat_session&utm_medium=social&utm_oi=793368515217330176&from=timeline&isappinstalled=0)
- [GTAG vs Google Tag Manager. What is the Difference? What to Choose?  ](https://www.analyticsmania.com/post/gtag-vs-google-tag-manager/)
- [GTAG vs Analytics.js ](https://www.analyticsmania.com/post/gtag-vs-analytics-js/)
- [Measure Google Analytics Events ](https://developers.google.com/analytics/devguides/collection/gtagjs/events)
- [不可不知的GA4事件！與通用版Analytics(GA3)有什麼不同呢?  ](https://awoo.ai/zh-hant/blog/google-analytics4-events/)
- [Set up User-ID](https://support.google.com/analytics/answer/3123666?hl=en#zippy=%2Cin-this-article)
- [自定义维度和指标](https://support.google.com/analytics/answer/2709828?hl=zh-Hans#collection)
- [Google Analytics发展历史（1995到2024）](https://www.ichdata.com/google-analytics-history.html)
- [History of Google Analytics](https://onward.justia.com/history-of-google-analytics/)
- [分析现有代码配置](https://developers.google.com/tag-platform/devguides/existing)
- [UA→GA4How gtag.js for UA maps to GA4](https://support.google.com/analytics/answer/9310895?hl=en#zippy=%2Cin-this-article)
- [Google Analytics 4 免费版和付费版的限额对比](https://www.ichdata.com/google-analytics-and-google-tag-manager-limits.html)
- [将 analytics.js 添加到网站中](https://developers.google.com/analytics/devguides/collection/analyticsjs)
---
title: react组件的生命周期
date: 2016-12-15 20:18:41
tags: [react]
---

react组件生命周期:
- constructor
- componentWillMount
- render
- ComponentDidMount
- componentWillReceiveProps
- shouldConponentUpdate
- componentWillUpdate
- componentDidUpdate
- componentWillUnmount

<!-- more -->

普通的react组件，一般会依次经历一下阶段:
1. constructor
2. componentWillMount
3. render
4. ComponentDidMount


当react组件内部state有更新时:
1. shouldConponentUpdate (当shouldConponentUpdate返回值为false的时候，之后的生命周期不会执行)
2. componentWillUpdate
3. render
4. componentDidUpdate


当react组件接收的props值有更新时:
1. componentWillReceiveProps
2. shouldConponentUpdate (当shouldConponentUpdate返回值为false的时候，之后的生命周期不会执行)
3. componentWillUpdate
4. render
5. componentDidUpdate


删除react组件:
1. componentWillUnmount

### 参考文档 ###
[React.Component](https://facebook.github.io/react/docs/react-component.html)
---
title: "KernelSU LKM Root 隐藏"
image: ""
published: 2026-07-30
pinned: false
description: "KernelSU LKM 模式的 Root 隐藏方案"
toc: true
draft: false
---

# 安装完模块重启，再设置以下操作

## 1.[KernelSU](https://github.com/tiann/KernelSU)
> 设置 → 打开 **隐藏 SELinux 修改**

## 2.[Zygisk Next](https://github.com/Dr-TSNG/ZygiskNext)
> 进入 WebUI → 排除列表策略切换 **仅还原挂载** → 打开 **使用匿名内存** → 打开 **使用 Zygisk Next 链接器**

## 3. [LSPosed](https://github.com/LSPosed/LSPosed)
> 若 LSP 管理器图标不见，拨号界面输入 `*#*#5776733#*#*`

## 4. [Tricky Store](https://github.com/5ec1cff/TrickyStore)
> 自行到 `/data/adb/tricky_store/` 替换有效密钥 `keybox.xml`

> 一键更新第三方应用命令，系统应用需自行添加
```shell
pm list packages -3 | sed 's/package://g' | sort -u > /data/adb/tricky_store/target.txt
```

## 5. [Play Integrity Fork](https://github.com/osm0sis/PlayIntegrityFork)
> 挂代理 → WebUI 点击 **执行操作** 按钮来抓取一个有效的设备指纹

## 6. [隐藏应用列表](https://github.com/Xposed-Modules-Repo/com.tsng.hidemyapplist)
> 给本模块 **Root 权限** → 配置 HMA
- 黑名单：只隐藏勾选的 APP，其余全部正常可见
- 白名单：仅勾选的 APP 可见，除此之外所有应用全部隐藏
# CDN 加速部署指南 / CDN Acceleration Deployment Guide

[English](#english) | [中文](#中文)

---

## 中文

### 概述

OneManager-php 现在支持 CDN 加速功能,可以通过 Cloudflare Workers 或腾讯 EdgeOne ESA 来加速云盘文件下载。

### 支持的 CDN 提供商

- **Cloudflare Workers** - 免费套餐每天 100,000 次请求
- **腾讯 EdgeOne ESA** - 边缘函数服务
- **自定义 CDN** - 任何支持Worker/Edge Function的CDN

### 部署步骤

#### 方法一:Cloudflare Workers

1. **注册 Cloudflare 账号**
   - 访问 https://workers.cloudflare.com/
   - 注册并登录您的账号

2. **创建 Worker**
   - 进入 Workers 页面
   - 点击 "Create a Service"
   - 输入 Service 名称,例如 `onemanager-cdn`
   - 点击 "Create service"

3. **部署代码**
   - 点击 "Quick edit" 按钮
   - 将 `cdn/cloudflare-worker.js` 的全部内容复制粘贴到编辑器中
   - 点击 "Save and Deploy"

4. **获取 Worker URL**
   - 部署成功后,您会看到类似 `https://onemanager-cdn.你的用户名.workers.dev` 的URL
   - 复制这个 URL

5. **在 OneManager 中配置**
   - 登录 OneManager 管理后台
   - 进入"设置"页面
   - 找到对应的disk配置
   - 设置以下参数:
     - `cdnEnabled`: 填 `1` (启用CDN)
     - `cdnProvider`: 填 `cloudflare`
     - `cdnWorkerUrl`: 填写您的 Worker URL (例如: `https://onemanager-cdn.你的用户名.workers.dev`)
     - `cdnForLargeFile`: 填 `0` (所有文件使用CDN) 或填一个数字(例如 `10`,表示只有大于10MB的文件使用CDN)
   - 保存设置

#### 方法二:腾讯 EdgeOne ESA

1. **注册腾讯云账号**
   - 访问 https://www.tencentcloud.com/products/teo
   - 注册并登录
   - 开通 EdgeOne 服务

2. **创建边缘函数**
   - 进入 EdgeOne 控制台
   - 选择您的站点
   - 进入"边缘函数"页面
   - 创建新的边缘函数

3. **部署代码**
   - 将 `cdn/edgeone-worker.js` 的内容复制到函数编辑器
   - 保存并发布

4. **配置触发规则**
   - 设置触发路径为 `/proxy*`
   - 配置您的自定义域名

5. **在 OneManager 中配置**
   - `cdnEnabled`: `1`
   - `cdnProvider`: `edgeone`
   - `cdnWorkerUrl`: 您的 EdgeOne 域名 (例如: `https://cdn.yourdomain.com`)
   - `cdnForLargeFile`: 根据需要设置

### 工作原理

1. 用户点击下载文件
2. OneManager 检查是否启用 CDN 和文件大小条件
3. 如果满足条件,生成 CDN 代理 URL:
   - Cloudflare: `https://worker-url?url=原始URL&filename=文件名`
   - EdgeOne: `https://cdn-domain/proxy?url=原始URL&filename=文件名`
4. 浏览器重定向到CDN URL
5. CDN Worker 从原始URL获取文件并缓存在边缘节点
6. 用户从最近的边缘节点下载文件,速度更快

### 性能优化建议

- 对于小文件(< 10MB),可以不使用CDN,让OneManager直接302跳转
- 对于大文件(> 10MB),使用CDN可以有效提高下载速度
- 推荐设置 `cdnForLargeFile` 为 `10` 或 `20`

### 故障排除

**问题: 下载速度没有提升**
- 检查 CDN Worker 是否正确部署
- 检查 OneManager 配置是否正确
- 查看浏览器开发者工具,确认URL是否经过CDN

**问题: 下载失败**
- 检查 Worker URL 是否正确
- 检查原始云盘直链是否有效
- 查看 Worker 日志(Cloudflare Dashboard)

---

## English

### Overview

OneManager-php now supports CDN acceleration through Cloudflare Workers or Tencent EdgeOne ESA to speed up file downloads from cloud storage.

### Supported CDN Providers

- **Cloudflare Workers** - Free tier: 100,000 requests/day
- **Tencent EdgeOne ESA** - Edge Function service
- **Custom CDN** - Any CDN supporting Workers/Edge Functions

### Deployment Steps

#### Method 1: Cloudflare Workers

1. **Sign up for Cloudflare**
   - Visit https://workers.cloudflare.com/
   - Register and login

2. **Create Worker**
   - Go to Workers page
   - Click "Create a Service"
   - Enter service name, e.g., `onemanager-cdn`
   - Click "Create service"

3. **Deploy Code**
   - Click "Quick edit"
   - Copy entire content of `cdn/cloudflare-worker.js` into the editor
   - Click "Save and Deploy"

4. **Get Worker URL**
   - After deployment, you'll see URL like `https://onemanager-cdn.yourname.workers.dev`
   - Copy this URL

5. **Configure in OneManager**
   - Login to OneManager admin panel
   - Go to "Setup" page
   - Find your disk configuration
   - Set these parameters:
     - `cdnEnabled`: `1` (enable CDN)
     - `cdnProvider`: `cloudflare`
     - `cdnWorkerUrl`: Your worker URL (e.g., `https://onemanager-cdn.yourname.workers.dev`)
     - `cdnForLargeFile`: `0` (use CDN for all files) or a number (e.g., `10` means only files > 10MB use CDN)
   - Save settings

#### Method 2: Tencent EdgeOne ESA

1. **Sign up for Tencent Cloud**
   - Visit https://www.tencentcloud.com/products/teo
   - Register and login
   - Activate EdgeOne service

2. **Create Edge Function**
   - Go to EdgeOne console
   - Select your site
   - Go to "Edge Functions" page
   - Create new function

3. **Deploy Code**
   - Copy content of `cdn/edgeone-worker.js` to function editor
   - Save and publish

4. **Configure Trigger Rules**
   - Set trigger path to `/proxy*`
   - Configure your custom domain

5. **Configure in OneManager**
   - `cdnEnabled`: `1`
   - `cdnProvider`: `edgeone`
   - `cdnWorkerUrl`: Your EdgeOne domain (e.g., `https://cdn.yourdomain.com`)
   - `cdnForLargeFile`: Set according to your needs

### How It Works

1. User clicks download link
2. OneManager checks if CDN is enabled and file size condition
3. If conditions met, generates CDN proxy URL:
   - Cloudflare: `https://worker-url?url=originalURL&filename=filename`
   - EdgeOne: `https://cdn-domain/proxy?url=originalURL&filename=filename`
4. Browser redirects to CDN URL
5. CDN Worker fetches file from original URL and caches at edge nodes
6. User downloads from nearest edge node with faster speed

### Performance Tips

- For small files (< 10MB), you may not need CDN, let OneManager use direct 302 redirect
- For large files (> 10MB), CDN can significantly improve download speed
- Recommended to set `cdnForLargeFile` to `10` or `20`

### Troubleshooting

**Issue: No speed improvement**
- Check if CDN Worker is properly deployed
- Verify OneManager configuration
- Use browser dev tools to confirm URL goes through CDN

**Issue: Download fails**
- Check if Worker URL is correct
- Verify original cloud storage direct link is valid
- Check Worker logs (Cloudflare Dashboard)

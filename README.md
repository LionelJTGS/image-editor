# 在线图片编辑器

纯前端实现的图片编辑工具：上传、预览、旋转、亮度调整、导出缩放、撤销重做、导出下载。图片全程在浏览器本地处理，不会上传到服务器。

技术栈：React + TypeScript + Canvas 2D + Vite，单元测试使用 Vitest。

## 运行

需要 Node.js 20 或更高版本。

```bash
npm install     # 安装依赖
npm run dev     # 本地开发，打开终端里显示的地址
npm test        # 运行单元测试
npm run build   # 类型检查并打包到 dist/
```

## 功能

- 上传：点击选择或拖拽；校验格式（JPG / PNG / WebP）、大小（10 MB）和尺寸（单边 8000 像素）
- 预览：按容器等比缩放，窗口大小变化时自动重绘，适配高分屏
- 编辑：左右旋转 90°、亮度 0% ~ 200%、导出缩放 10% ~ 100%
- 历史：撤销、重做、重置，支持 Ctrl/Cmd + Z、Ctrl/Cmd + Shift + Z、Ctrl + Y
- 导出：按原图分辨率重绘后下载为 PNG 或 JPG

## 目录结构

```
src/
├── types.ts                  编辑参数 EditParams 的定义
├── App.tsx                   页面状态与各功能的串联
├── components/
│   ├── UploadArea.tsx        上传区域（点击 + 拖拽）
│   ├── CanvasPreview.tsx     预览画布
│   └── Slider.tsx            滑块
├── hooks/
│   └── useHistory.ts         撤销重做 Hook
└── lib/
    ├── geometry.ts           尺寸计算（旋转、缩放、适配容器）
    ├── render.ts             统一的 Canvas 绘制函数
    ├── history.ts            撤销重做的纯函数实现
    ├── file.ts               文件校验与图片加载
    └── exportImage.ts        离屏画布导出与下载
```

## 设计说明

### 1. 编辑参数与绘制分离

页面不保存“编辑后的图片”，只保存原图和一组参数 `{ rotation, brightness, scale }`。
画布内容始终由 `renderToCanvas(canvas, image, params, width, height)` 根据「原图 + 参数」重新画出来。

好处：

- 预览和导出共用同一个绘制函数，只是画布大小不同，两者结果一致。
- 多次编辑不会损失画质，因为每次都从原图开始画，而不是在上一次的结果上叠加。
- 新增一种编辑功能时，只需要给参数加一个字段，并在绘制函数里处理它。

### 2. 三种尺寸

| 尺寸 | 含义 | 计算位置 |
| --- | --- | --- |
| 原图尺寸 | 图片文件本身的像素大小 | `image.naturalWidth / naturalHeight` |
| 预览尺寸 | 等比缩小到容器内的显示大小 | `fitSize()` |
| 导出尺寸 | 旋转后的原图尺寸 × 缩放比例 | `getOutputSize()` |

旋转 90° 或 270° 时画布的宽高要互换。绘制时把坐标原点移到画布中心，旋转坐标系，再以原点为中心画图。

预览画布的像素数还要乘以 `devicePixelRatio`，否则在高分屏上会模糊。

### 3. 撤销重做

历史记录是 `{ past, present, future }` 三段结构，保存的是参数快照而不是像素数据，所以内存占用很小。

- 新操作：`present` 进入 `past`，`future` 清空（历史截断）
- 撤销：`past` 的最后一项变成 `present`，原来的 `present` 放到 `future` 开头
- 重做：反过来
- 最多保留 50 步

拖动滑块时，过程中的值只写入临时的 `draft` 状态用于实时预览，松手时才写入一条历史，这样一次拖动只对应一次撤销。

### 4. 亮度

优先使用 `ctx.filter = 'brightness(...)'`；浏览器不支持时，退回到 `getImageData` 逐像素把 R、G、B 乘以系数。

## 部署

**Vercel**：把代码推到 GitHub，在 Vercel 里导入该仓库，保持默认设置即可（构建命令 `npm run build`，输出目录 `dist`）。

**GitHub Pages**：项目已包含 `.github/workflows/deploy.yml`，推送到 `main` 分支后会自动测试、打包并发布。首次使用需要在仓库的 Settings → Pages 里把 Source 设为 GitHub Actions。

## 可以继续做的功能

- 裁剪：需要把鼠标在预览上的坐标换算回原图坐标
- 更多调整项：对比度、饱和度、水平/垂直翻转
- 大图导出放到 Web Worker + OffscreenCanvas，避免阻塞页面

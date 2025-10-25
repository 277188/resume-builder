# 简历生成器

一个功能丰富的在线简历生成工具，帮助用户快速创建专业的简历。

## 功能特点

- 多种简历模板选择
- 拖拽式板块管理
- 实时预览效果
- 导出为PDF格式
- 响应式设计
- 本地数据存储
- 左侧边栏与简历内容联动

## 使用方法

1. **选择模板**：点击顶部模板选项切换不同简历样式
2. **编辑内容**：
   - 点击左侧边栏的板块
   - 在右侧面板填写内容
   - 内容会实时反映在预览中
3. **调整板块**：
   - 拖拽左侧面板中的板块调整顺序
   - 点击"添加板块"按钮创建自定义板块
   - 点击删除图标删除非核心板块
4. **保存简历**：点击"保存简历"按钮导出为PDF

## 核心板块

- 个人信息（不可删除）
- 个人简介（不可删除）
- 教育背景（不可删除）

## 部署说明

### 方法一：使用Python内置服务器

1. 确保已安装Python
2. 在项目根目录打开命令行
3. 运行命令：`python -m http.server 8000`
4. 在浏览器中访问：`http://localhost:8000`

### 方法二：使用Node.js和http-server

1. 安装Node.js
2. 全局安装http-server：`npm install -g http-server`
3. 在项目根目录运行：`http-server -p 8000`
4. 在浏览器中访问：`http://localhost:8000`

### 方法三：部署到GitHub Pages

1. 创建GitHub仓库
2. 上传所有文件到仓库
3. 在仓库设置中启用GitHub Pages
4. 访问生成的URL

## 技术栈

- HTML5
- CSS3 (CSS Grid, Flexbox)
- JavaScript (ES6+)
- Sortable.js (拖拽功能)
- html2pdf.js (PDF导出)

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License
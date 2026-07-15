# 组合产品可视化资料中心

面向外部客户和内部投顾团队的一站式产品展示、营销数据查阅与运营资料管理平台。

## 功能模块

| 模块 | 说明 | 标识色 |
|------|------|--------|
| 🟦 **产品介绍** | 组合产品浏览、投资策略详情、历史业绩展示 | `#1E5EFF` |
| 🟩 **客户营销推广资料** | KPI数据看板、趋势图表、营销物料下载 | `#159A75` |
| 🟧 **投顾内部资料** | 推广话术、客户沟通指南、社群素材、培训材料 | `#F28A1A` |

## 技术栈

- **React 18** + **TypeScript**
- **Vite** 构建工具
- **Tailwind CSS v4** 样式方案
- **Recharts** 数据可视化
- **React Router v6** 路由管理
- **Lucide React** 图标库

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── types/              # TypeScript 类型定义
├── data/               # Mock 数据（产品、营销、内部资料）
├── context/            # AuthContext 角色权限模拟
├── components/
│   ├── layout/         # Header, Footer, Layout
│   ├── common/         # 通用组件（SearchBar, MetricCard, DocumentCard 等）
│   └── charts/         # 图表组件（Trend, Bar, Pie, Performance）
└── pages/
    ├── home/           # 首页
    ├── product/        # 产品列表 & 详情
    ├── marketing/      # 营销数据看板 & 物料
    ├── internal/       # 内部资料列表 & 详情
    ├── admin/          # 管理后台
    ├── search/         # 全局搜索
    ├── announcements/  # 公告通知
    └── auth/           # 角色切换（演示）
```

## 角色权限（演示模式）

| 角色 | 权限 |
|------|------|
| 访客 | 产品浏览、营销数据查看 |
| 授权客户 | 产品浏览、营销数据查看和下载 |
| 投顾经理 | 全部内容查看、内部资料访问和下载 |
| 运营人员 | 内容管理、资料上传编辑、审核提交 |
| 系统管理员 | 全部权限、用户管理、系统配置 |

## 演示说明

本项目为前端演示版本，所有数据均为 Mock 数据。主要展示：

- 3大核心模块的完整页面交互
- 基于角色的权限访问控制
- 响应式布局（PC / 平板 / 手机）
- 数据可视化图表（SVG + Recharts）
- 产品筛选、搜索、资料管理功能
- 管理后台 CRUD 和审核流程

实际部署时需对接后端 API、用户认证系统和文档存储服务。

## License

MIT

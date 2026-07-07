# Detwiler Tech

B2B 独立站 — Next.js 14 + Payload CMS 3 + next-intl + Tailwind CSS + TypeScript

## 功能特性

- ✅ 中英双语 (next-intl 路径式路由)
- ✅ B2B 询盘驱动：表单 / 邮件 / WhatsApp 三种渠道
- ✅ Cash on Delivery 展示 + 支付接口预留（后期启用）
- ✅ Payload CMS 3 自托管后台 (`/admin`)
- ✅ Cloudflare Turnstile 反垃圾
- ✅ 国内/海外邮件分流（阿里云 DirectMail + Resend）
- ✅ SQLite (开发) / PostgreSQL (生产)
- ✅ Docker Compose 一键部署

## 项目状态

| Phase | 内容 | 状态 |
|---|---|---|
| 0 | 准备 | ✅ |
| 1 | 项目骨架 + 首页 | ✅ 当前 |
| 2 | 产品中心 + 询盘功能 | ⏳ |
| 3 | Payload CMS 后台完善 | ⏳ |
| 4 | SEO + 部署上线 | ⏳ |
| 5 | 支付集成（按需启用）| 🔌 插槽已就位 |

## 快速开始

见 [SETUP.md](./SETUP.md)

## 文档

- [实施计划](./moonlit-bouncing-naur.md) - 完整架构与决策记录
- [SETUP.md](./SETUP.md) - 安装与启动指南

## 团队协作

- **代码组织**：`src/app/[locale]/*` 用户端，`src/app/(payload)/*` 后台
- **i18n 文案**：`src/i18n/messages/{en,zh}.json`
- **产品数据**：Phase 2 通过抓取脚本或 Payload 后台录入
- **样式规范**：Tailwind 主题色定义为 `tailwind.config.ts` 中的 brand-* 色阶

## License

Proprietary © Detwiler Tech

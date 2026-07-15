import type { Announcement } from '../types';

export const announcements: Announcement[] = [
  {
    id: 'ann-001',
    title: '满山红精选组合2026年Q2业绩报告发布',
    content:
      '满山红精选组合2026年第二季度业绩报告已正式发布。Q2组合净值增长6.8%，年内累计收益14.2%。详细业绩数据及持仓分析请查看最新产品一页通。',
    category: 'product',
    publishDate: '2026-07-07',
    relatedProducts: ['prod-001'],
    isPinned: true,
  },
  {
    id: 'ann-002',
    title: '全球多资产配置组合暂停申购通知',
    content:
      '因境外投资额度调整，全球多资产配置组合自2026年7月1日起暂停新增申购，赎回业务正常办理。恢复时间将另行通知。已持有份额的客户不受影响，存量资产继续按照原策略管理。',
    category: 'product',
    publishDate: '2026-07-01',
    effectiveDate: '2026-07-01',
    relatedProducts: ['prod-004'],
    isPinned: true,
  },
  {
    id: 'ann-003',
    title: '合规销售指引更新至V4.0版本',
    content:
      '根据最新监管要求，《产品合规销售指引》已更新至V4.0版本。主要更新内容：适当性管理流程优化、AI投顾工具使用规范新增、录音录像标准更新。请全体投顾及客户经理于7月15日前完成学习并签署确认书。',
    category: 'compliance',
    publishDate: '2026-06-25',
    relatedProducts: [],
    isPinned: false,
  },
  {
    id: 'ann-004',
    title: '营销推广资料V3.0版本更新',
    content:
      '满山红精选组合和稳健增长组合的客户营销推广资料已更新至最新版本，包含Q2最新业绩数据和市场展望。旧版本资料已于7月1日下架，请使用新版本进行客户沟通。',
    category: 'material',
    publishDate: '2026-07-02',
    relatedProducts: ['prod-001', 'prod-002'],
    isPinned: false,
  },
  {
    id: 'ann-005',
    title: '系统功能升级：新增资料收藏和版本对比功能',
    content:
      '平台已完成V2.3版本升级，新增以下功能：1）内部资料支持个人收藏夹；2）支持同资料不同版本的对比查看；3）营销数据看板新增导出Excel功能；4）产品搜索支持模糊匹配和标签筛选。如有使用问题请联系运营支持团队。',
    category: 'system',
    publishDate: '2026-06-28',
    relatedProducts: [],
    isPinned: false,
  },
  {
    id: 'ann-006',
    title: '客户沙龙活动7月排期发布',
    content:
      '7月客户沙龙活动排期已确定：7月12日"下半年市场展望"（上海）、7月19日"高净值客户资产配置策略"（北京）、7月26日"科技赛道投资机会"（深圳）。活动邀请函及执行手册已同步更新，请各区域投顾提前邀约目标客户。',
    category: 'product',
    publishDate: '2026-07-03',
    relatedProducts: ['prod-001', 'prod-003'],
    isPinned: false,
  },
  {
    id: 'ann-007',
    title: '客户沟通话术V3.5版本更新说明',
    content:
      '满山红精选组合推广话术已更新至V3.5版本，重点新增：1）Q2业绩亮点话术；2）竞品差异化优势对比；3）客户异议处理新增场景（波动焦虑、赎回诉求）。请各投顾尽快熟悉新话术并在客户沟通中应用。',
    category: 'material',
    publishDate: '2026-06-22',
    relatedProducts: ['prod-001'],
    isPinned: false,
  },
];

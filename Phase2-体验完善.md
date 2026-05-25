# Phase 2：体验完善

## 目标

在 MVP 基础上提升用户体验，完善消息交互细节，支持模型配置。

---

## 任务清单

- [ ] Markdown / 代码高亮渲染
- [ ] 消息操作（重新生成、复制消息内容）
- [ ] 点赞 / 踩反馈功能
- [ ] 模型切换（GPT-4o / GPT-3.5-turbo 等）
- [ ] 系统提示词配置页（自定义 AI 角色）
- [ ] 数学公式渲染（KaTeX）

---

## 前端新增功能

### Markdown 渲染
- 引入 `react-markdown` + `rehype-highlight` + `remark-math` + `rehype-katex`
- 为 AI 消息气泡启用 Markdown 解析
- 代码块显示语言标签 + 一键复制按钮

### 消息操作按钮
- 复制：将消息原文复制到剪贴板
- 重新生成：删除最后一条 AI 消息，重新请求
- 点赞/踩：记录用户反馈，发送到后端

### 模型切换
- 顶部导航栏或设置抽屉中添加模型下拉选择器
- 切换时更新当前会话绑定的模型
- 支持模型：`gpt-4o`、`gpt-4o-mini`、`gpt-3.5-turbo`

### 系统提示词配置
- 新建会话时可选填 System Prompt
- 会话设置面板支持编辑已有会话的提示词

---

## 后端新增接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/messages/{id}/feedback` | POST | 提交点赞/踩 |
| `/conversations/{id}` | PATCH | 更新会话（模型、提示词）|
| `/messages/{id}/regenerate` | POST | 重新生成最后一条回复 |

---

## 数据库变更

```sql
-- messages 表新增字段
ALTER TABLE messages ADD COLUMN feedback VARCHAR(10);  -- 'like' / 'dislike'
```

---

## 技术依赖新增

```bash
# 前端
npm install react-markdown rehype-highlight remark-math rehype-katex

# 后端（无新增依赖）
```

---

## 验证方式

- 发送包含代码块的消息，验证代码高亮渲染正常
- 点击重新生成，验证 AI 重新回复
- 切换模型后发送消息，验证后端调用对应模型
- 配置 System Prompt 后验证 AI 角色行为改变

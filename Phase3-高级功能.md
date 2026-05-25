# Phase 3：高级功能

## 目标

在 Phase 2 基础上，引入文件上传、RAG 检索问答、用户配额管理和管理后台，打造完整的生产级对话系统。

---

## 任务清单

### 文件上传与 RAG 检索
- [ ] 后端：文件上传接口（支持 PDF / TXT / DOCX）
- [ ] 后端：PDF 解析与文本提取（PyMuPDF / pdfplumber）
- [ ] 后端：文本向量化（OpenAI Embeddings API）
- [ ] 后端：向量存储接入（Qdrant 本地部署）
- [ ] 后端：RAG 检索逻辑——问题向量化 → 相似度召回 → 拼入 Prompt
- [ ] 前端：文件上传 UI（拖拽上传区域）
- [ ] 前端：已上传文件列表展示
- [ ] 前端：对话时显示"基于文件回答"来源标注

### 用户配额与限流
- [ ] 后端：每用户每日 token 用量统计（Redis 计数）
- [ ] 后端：超配额时返回友好错误信息
- [ ] 前端：展示用量进度条（已用 / 总配额）
- [ ] 后端：管理员可调整用户配额

### 管理后台
- [ ] 后端：管理员角色权限（role 字段）
- [ ] 后端：管理接口——用户列表、封禁/解禁、配额设置
- [ ] 前端：管理后台页面（用户管理、统计看板）
- [ ] 前端：用量统计图表（每日对话量、token 消耗趋势）

---

## 技术新增

| 层面 | 技术 |
|------|------|
| PDF 解析 | PyMuPDF（`fitz`）或 pdfplumber |
| 向量化 | OpenAI `text-embedding-3-small` |
| 向量数据库 | Qdrant（Docker 本地部署）|
| 文件存储 | 本地 `/uploads` 目录（可迁移 S3）|
| 配额统计 | Redis INCR + EXPIRE（按天）|
| 图表 | Recharts（前端）|

---

## 数据库新增

```sql
-- 文件附件表
attachments (
  id, conversation_id, user_id,
  filename, file_path, vector_indexed,  -- 是否已向量化
  created_at
)

-- 用量记录表
usage_logs (
  id, user_id, conversation_id,
  prompt_tokens, completion_tokens, total_tokens,
  created_at
)
```

---

## 目录结构新增

```
backend/app/
├── api/
│   ├── files.py          # 文件上传接口
│   └── admin.py          # 管理后台接口
├── services/
│   ├── rag.py            # RAG 检索逻辑
│   ├── embeddings.py     # 向量化封装
│   └── quota.py          # 配额管理
└── vector/
    └── qdrant_client.py  # Qdrant 连接封装

frontend/src/
├── pages/
│   └── AdminPage.tsx     # 管理后台
└── components/
    ├── FileUpload.tsx     # 文件上传组件
    └── UsageBar.tsx       # 用量进度条
```

---

## 验证方式

1. 上传一份 PDF，发送相关问题，验证 AI 回答中有文件内容
2. 超出每日配额后，验证前端显示限流提示
3. 以管理员账户登录，查看用户列表和用量统计图表
4. `docker-compose up` 确认 Qdrant 容器正常启动

---

## 依赖前置

- ✅ Phase 1 完成（认证 + 基础对话）
- ✅ Phase 2 完成（Markdown 渲染 + 消息操作）

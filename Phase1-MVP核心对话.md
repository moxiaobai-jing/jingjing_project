# Phase 1 — MVP 核心对话

> **目标**：跑通完整的注册登录 + 多会话 + 流式对话闭环

---

## 系统架构（本阶段）

```
前端 (React)  ──SSE──►  FastAPI 后端  ──►  OpenAI API
                              │
                         PostgreSQL
```

---

## 后端任务

### 1. 项目骨架
- [ ] 初始化 FastAPI 项目，配置 `.env`（DATABASE_URL、OPENAI_API_KEY、JWT_SECRET）
- [ ] Docker Compose 配置（FastAPI + PostgreSQL + Redis）
- [ ] Alembic 数据库迁移初始化

### 2. 数据库模型

```sql
users (id, email, hashed_password, created_at)
conversations (id, user_id, title, system_prompt, model, created_at, updated_at)
messages (id, conversation_id, role, content, token_count, created_at)
```

### 3. 认证接口
- [ ] `POST /auth/register` — 注册
- [ ] `POST /auth/login` — 登录，返回 JWT
- [ ] `GET /auth/me` — 获取当前用户信息
- 技术：`python-jose`（JWT）+ `passlib[bcrypt]`

### 4. 会话接口
- [ ] `GET /conversations` — 列出当前用户所有会话
- [ ] `POST /conversations` — 新建会话
- [ ] `DELETE /conversations/{id}` — 删除会话
- [ ] `PATCH /conversations/{id}` — 重命名

### 5. 消息 / 流式对话接口
- [ ] `GET /conversations/{id}/messages` — 获取历史消息
- [ ] `POST /conversations/{id}/chat` — 发送消息，SSE 流式返回 AI 回复
  - 调用 `openai.chat.completions.create(stream=True)`
  - 逐 chunk 写入 `text/event-stream`
  - 完成后将完整回复存入 `messages` 表

---

## 前端任务

### 1. 项目骨架
- [ ] Vite + React 18 + TypeScript 初始化
- [ ] Tailwind CSS + shadcn/ui 配置
- [ ] Zustand store 骨架（auth、conversations、messages）
- [ ] React Router v6 路由配置

### 2. 登录/注册页 (`/login`)
- [ ] 邮箱 + 密码表单
- [ ] 调用 `/auth/login`，JWT 存入 localStorage
- [ ] 登录成功跳转 `/chat`

### 3. 对话主页 (`/chat`)
- [ ] 左侧侧边栏：会话列表 + 新建按钮
- [ ] 中央聊天区：消息气泡列表
- [ ] 底部输入框 + 发送按钮
- [ ] 流式输出：`fetch` + `ReadableStream` 逐字追加到 AI 气泡

### 4. 状态管理
- [ ] `useAuthStore`：token、用户信息
- [ ] `useConversationStore`：会话列表、当前会话 ID
- [ ] `useMessageStore`：当前会话消息列表、流式状态

---

## 目录结构

```
chatgpt-clone/
├── backend/
│   ├── app/
│   │   ├── api/           # auth.py / conversations.py / messages.py
│   │   ├── models/        # 数据库 ORM 模型
│   │   ├── schemas/       # Pydantic 校验模型
│   │   ├── services/
│   │   │   └── llm.py     # OpenAI 流式封装
│   │   ├── core/          # config.py / security.py
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── Dockerfile

├── frontend/
│   ├── src/
│   │   ├── components/    # Sidebar / ChatWindow / MessageBubble / InputBox
│   │   ├── pages/         # LoginPage / ChatPage
│   │   ├── store/         # Zustand stores
│   │   └── api/           # axios 封装 + SSE 工具函数
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## 本地启动

```bash
docker-compose up          # 启动 PostgreSQL + Redis + 后端 + 前端
# 或分开运行：
cd backend && uvicorn app.main:app --reload   # http://localhost:8000/docs
cd frontend && npm run dev                    # http://localhost:5173
```

## 完成标准

- 可以注册/登录
- 能新建会话并发送消息
- AI 回复以流式打字机效果显示
- 刷新页面后会话和消息历史仍在

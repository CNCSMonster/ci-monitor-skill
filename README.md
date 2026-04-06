# CI Monitor Skill

智能 CI 构建监控技能 - 根据历史构建时间动态调整检查间隔

## 功能特点

- 📊 自动分析历史构建时间，计算平均完成时间
- ⏱️ 智能调整检查间隔，避免过度轮询
- 🔔 构建完成时立即报告结果
- 🚨 构建失败时提供错误查看指引

## 检查间隔策略

| 进度 | 检查间隔 |
|------|---------|
| 0-25% | 60 秒 |
| 25-75% | 30 秒 |
| 75-100% | 15 秒 |
| >100% | 5 秒 |

## 安装

### 方式 1: 全局安装（推荐）

```bash
git clone https://github.com/CNCSMonster/ci-monitor-skill.git ~/.qwen/skills/ci-monitor
```

### 方式 2: 项目安装

```bash
git clone https://github.com/CNCSMonster/ci-monitor-skill.git .qwen/skills/ci-monitor
```

### 方式 3: 直接使用

```bash
git clone https://github.com/CNCSMonster/ci-monitor-skill.git
cd ci-monitor-skill
node index.js
```

## 使用方法

### 作为独立脚本运行

```bash
# 监控 main 分支
node index.js

# 监控指定分支
node index.js wsl2-ubuntu-24
```

### 在 Qwen Code 中使用

安装到 `~/.qwen/skills/ci-monitor/` 后，AI 会自动识别并执行：

```bash
node ~/.qwen/skills/ci-monitor/index.js [branch]
```

或直接说：
- "监控 CI 构建"
- "Check CI status"
- "Watch the build and report when done"

## 前置要求

- Node.js 14+
- GitHub CLI (`gh`) 已安装并登录
- 有权限访问目标仓库的 Actions

## 配置

在 `index.js` 中修改默认设置：
```javascript
const DEFAULT_BRANCH = 'main';
const DEFAULT_WORKFLOW = 'Dockerfile Build Check';
```

## 许可证

MIT

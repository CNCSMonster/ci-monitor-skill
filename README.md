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

```bash
# 克隆技能仓库
git clone https://github.com/YOUR_USERNAME/ci-monitor-skill.git

# 进入目录
cd ci-monitor-skill

# 安装依赖（如果需要）
npm install
```

## 使用方法

### 作为独立脚本运行

```bash
# 监控 main 分支
node index.js

# 监控指定分支
node index.js wsl2-ubuntu-24
```

### 在 Claude Code 中使用

```
/monitor-ci
```

或自然语言：
- "监控 CI 构建"
- "Check CI status"
- "Watch the build and report when done"

## 前置要求

- Node.js 14+
- GitHub CLI (`gh`) 已安装并登录
- 有权限访问目标仓库的 Actions

## 配置

编辑 `skill.json` 修改默认设置：

```json
{
  "defaultBranch": "main",
  "defaultWorkflow": "Dockerfile Build Check",
  "checkIntervals": {
    "early": 60000,
    "middle": 30000,
    "late": 15000,
    "overtime": 5000
  }
}
```

## 许可证

MIT

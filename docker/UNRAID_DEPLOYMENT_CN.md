# Lovevery 替代品爬虫 — Unraid 部署指南

本指南将详细介绍如何在 Unraid 家庭服务器上部署 Lovevery 亚马逊替代品爬虫 Docker 容器。该容器会自动定时运行，抓取最新的产品数据，并自动将更新后的 `lovevery_alternatives.json` 文件推送到您的 GitHub 仓库。

## 准备工作

在开始之前，请确保您已准备好以下各项：

1.  **Unraid 服务器**: 确保您的 Unraid 服务器已启用 Docker 功能。
2.  **Community Applications 插件**: 这是 Unraid 社区推荐的应用商店插件，能极大地简化安装过程。如果您尚未安装，请前往 Unraid WebUI 的 `Apps` 标签页进行安装。
3.  **GitHub 个人访问令牌 (Token)**: 爬虫需要此令牌来将更新后的数据推送到您的 GitHub 仓库。
    *   访问 [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new) 创建。
    *   **Note**: 随意填写，例如 `lovevery-scraper`。
    *   **Expiration**: 建议选择 `No expiration` (无过期时间)。
    *   **Scopes**: 必须勾选 `repo` (完全控制私有仓库)。
    *   创建后，请**立即复制并妥善保管**生成的令牌 (例如 `ghp_xxxxxxxx`)，因为此令牌只会显示一次。
4.  **OpenAI API 密钥**: 爬虫使用 OpenAI 的 AI 模型来智能查找替代品。如果您需要此功能，请准备好您的 API 密钥。
    *   访问 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) 创建。
    *   如果您只想更新已有产品的价格 (`--refresh-prices` 模式)，则**无需**此密钥。

## 部署步骤

我们推荐使用 Community Applications (CA) 插件进行部署，这是最简单、最不容易出错的方法。

### 方法一：使用 Community Applications (推荐)

1.  **添加自定义模板仓库**:
    *   打开 Unraid WebUI，进入 `Docker` 页面。
    *   拉到页面底部，找到 `Add Container` 按钮，点击它旁边的 `Template Repositories` 链接。
    *   在 `Template Repositories` 字段中，添加以下 URL：
        ```
        https://github.com/gzxultra/loveveryfans
        ```
    *   点击 `Save` 保存。

2.  **从 Apps 页面安装**:
    *   进入 `Apps` 页面。
    *   在搜索框中输入 `lovevery-scraper`。
    *   找到 `lovevery-scraper` 应用，点击其图标进行安装。

3.  **配置环境变量**:
    *   在安装界面，您会看到所有可配置的选项。最关键的是填入您的环境变量。
    *   请参考下方的 **“环境变量配置”** 表格，填入您的 `GITHUB_TOKEN` 和 `OPENAI_API_KEY`。
    *   其他选项（如定时任务表达式、Git 分支等）可以根据您的需求进行修改，或者直接使用默认值。

4.  **应用并启动**:
    *   检查所有配置无误后，点击页面底部的 `Apply` 按钮。
    *   Unraid 将会自动拉取 Docker 镜像并启动容器。

### 方法二：手动添加容器 (高级)

如果您不想使用 CA 插件，也可以手动添加容器。

1.  **打开添加容器页面**: 进入 `Docker` 页面，点击 `Add Container`。
2.  **填写配置信息**: 按照下表填写所有字段。

| Unraid 字段 | 值 / 描述 |
| :--- | :--- |
| **Name** | `lovevery-scraper` (或您喜欢的任何名称) |
| **Repository** | `gzxultra/loveveryfans:latest` (注意：这是假设镜像已推送到 Docker Hub，目前需要从 GitHub build) |
| **Docker Hub URL** | *留空* |
| **Icon URL** | *留空* |
| **WebUI** | *留空* |
| **Network Type** | `Bridge` |
| **Console shell command** | `Shell` |

3.  **添加环境变量**: 点击 `Add another Path, Port, Variable, Label or Device`，类型选择 `Variable`，然后根据下方的 **“环境变量配置”** 表格，逐一添加所有需要的变量。

4.  **应用并启动**: 点击 `Apply` 启动容器。

## 环境变量配置

这是此容器最重要的部分。请确保至少填写了必填的变量。

| 变量名 | 是否必填 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- |
| `GITHUB_TOKEN` | **是** | - | 您的 GitHub 个人访问令牌，用于推送代码。 |
| `OPENAI_API_KEY` | **是**\* | - | 您的 OpenAI API 密钥，用于 AI 搜索。 |
| `GITHUB_REPO` | 否 | `gzxultra/loveveryfans` | 您的目标 GitHub 仓库，格式为 `owner/repo`。 |
| `CRON_SCHEDULE` | 否 | `0 3 * * 1` | Cron 定时表达式。默认是**每周一凌晨 3 点**运行。 |
| `RUN_ON_STARTUP` | 否 | `true` | 是否在容器启动时立即运行一次爬虫。 |
| `TZ` | 否 | `America/Los_Angeles` | 容器的 timezone，用于 cron 定时。建议设置为您所在地的时区，例如 `Asia/Shanghai`。 |
| `SCRAPER_FLAGS` | 否 | `--update --verbose` | 传递给爬虫脚本的参数。例如，只更新价格可设为 `--refresh-prices --verbose`。 |
| `GIT_USER_NAME` | 否 | `loveveryfans-bot` | Git commit 时使用的用户名。 |
| `GIT_USER_EMAIL` | 否 | `bot@loveveryfans.com` | Git commit 时使用的邮箱。 |
| `GIT_BRANCH` | 否 | `main` | 要推送到的 Git 分支。 |

> \* **注意**: 如果您的 `SCRAPER_FLAGS` 设置为 `--refresh-prices --verbose` (仅更新价格模式)，则无需提供 `OPENAI_API_KEY`。

## 验证安装

容器启动后，您可以验证它是否正常工作：

1.  **查看 Docker 日志**: 在 Unraid 的 `Docker` 页面，找到 `lovevery-scraper` 容器，点击其图标，选择 `Logs`。
2.  **检查启动日志**: 如果 `RUN_ON_STARTUP` 设置为 `true`，您应该能看到类似以下的日志输出，表明爬虫已经开始运行：
    ```log
    [2026-02-18 02:30:00] Lovevery Alternatives Scraper — Starting
    [2026-02-18 02:30:00] Timezone      : America/Los_Angeles
    [2026-02-18 02:30:00] Cron schedule : 0 3 * * 1
    [2026-02-18 02:30:00] Cloning repository: gzxultra/loveveryfans...
    [2026-02-18 02:30:05] Repository ready at /app/repo
    [2026-02-18 02:30:05] Running scraper on startup...
    [2026-02-18 02:30:05] [scraper] ====== Scraper run started ======
    [2026-02-18 02:30:06] Pulling latest changes from origin/main...
    [2026-02-18 02:30:08] Running scraper with flags: --update --verbose --stats
    Extracting toy inventory from kits.ts...
    Found 14 kits with 196 toys
    ...
    ```
3.  **检查 GitHub 仓库**: 爬虫运行完毕后 (可能需要 1-2 小时)，访问您的 GitHub 仓库，您应该能看到一个由 `loveveryfans-bot` 推送的 commit，内容是更新的 `scripts/lovevery_alternatives.json` 文件。

## 日常管理

- **查看日志**: 随时点击容器图标 > `Logs` 查看最新运行状态和统计报告。
- **强制运行**: 如果您想立即手动触发一次爬取，可以点击容器图标 > `Console`，然后输入以下命令并回车：
  ```bash
  /app/run_scraper.sh
  ```
- **重启容器**: 点击容器图标 > `Restart`。
- **修改配置**: 点击容器图标 > `Edit`，修改环境变量后点击 `Apply`。

## 常见问题 (FAQ)

- **Q: 为什么日志里有很多 404 或 503 错误？**
  A: 这是正常的。404 表示亚马逊上某个产品链接已失效。503 表示亚马逊暂时拒绝了请求 (可能因为请求频率过高)。优化后的脚本有强大的重试机制，会自动处理这些问题。只要最终的成功率在可接受范围 (例如 >80%)，就无需担心。

- **Q: 我可以修改定时任务的频率吗？**
  A: 当然可以。修改 `CRON_SCHEDULE` 环境变量即可。您可以使用 [crontab.guru](https://crontab.guru/) 这个网站来轻松生成您想要的 cron 表达式。

- **Q: 我只想更新价格，不想用 OpenAI，怎么配置？**
  A: 将 `SCRAPER_FLAGS` 环境变量的值修改为 `--refresh-prices --verbose`。这样就不需要 `OPENAI_API_KEY` 了。

- **Q: Git 推送失败怎么办？**
  A: 请检查您的 `GITHUB_TOKEN` 是否正确，并且拥有 `repo` 权限。同时确认 `GITHUB_REPO` 的值是您自己的仓库。

- **Q: 容器无法启动怎么办？**
  A: 首先检查日志。最常见的原因是 `GITHUB_TOKEN` 未填写或无效。请确保所有必填环境变量都已正确配置。

如有其他问题，请在 GitHub 仓库中提交 Issue。

# 部署说明

## 开发环境配置

### 1. 环境准备

```bash
# 安装 Node.js (>= 18)
node -v

# 安装 pnpm (>= 8)
npm install -g pnpm
pnpm -v

# 安装 Rust (stable)
rustc --version

# 安装 Tauri CLI
pnpm add -D @tauri-apps/cli
```

### 2. macOS 额外依赖

```bash
# 安装 Xcode Command Line Tools
xcode-select --install

# 安装 Rust 后端依赖
brew install openssl
```

### 3. Windows 额外依赖

```powershell
# 安装 Visual Studio Build Tools
# 下载地址: https://visualstudio.microsoft.com/visual-cpp-build-tools/
# 需勾选 "使用 C++ 的桌面开发" 工作负载

# 安装 WebView2 (Windows 10 需要)
# 下载地址: https://developer.microsoft.com/microsoft-edge/webview2/
```

### 4. Linux 额外依赖

```bash
# Ubuntu / Debian
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install -y webkit2gtk4.1-devel openssl-devel curl wget file libxdo-devel libappindicator-gtk3-devel librsvg2-devel

# Arch Linux
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file xdotool openssl appmenu-gtk-module librsvg libayatana-appindicator
```

### 5. 启动开发服务器

```bash
# 安装项目依赖
pnpm install

# 启动 Tauri 开发模式
pnpm tauri:dev
```

开发模式下，前端热更新地址为 `http://localhost:6130`，Tauri 窗口会自动打开。

### 6. 环境变量配置

在项目根目录创建 `.env.development` 和 `.env.production` 文件：

```bash
# .env.development
VITE_SERVICE_URL=http://localhost:3000

# .env.production
VITE_SERVICE_URL=https://api.example.com
```

---

## 生产环境构建

### 构建命令

```bash
# 构建前端 + Tauri 打包
pnpm tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录下。

### 构建优化

项目已配置以下构建优化：

- **代码压缩**：使用 Terser 移除 console.log 和 debugger
- **CSS 代码拆分**：`cssCodeSplit: true`
- **依赖分包**：node_modules 统一打包为 `invariable` chunk
- **资源指纹**：文件名带 hash 缓存控制

---

## 平台打包说明

### macOS 打包

```bash
pnpm tauri:build
```

**产物格式**：

- `.app` — macOS 应用程序
- `.dmg` — macOS 磁盘映像安装包

**通用二进制（同时支持 Intel 和 Apple Silicon）**：

```bash
rustup target add x86_64-apple-darwin aarch64-apple-darwin
pnpm tauri:build --target universal-apple-darwin
```

**代码签名（可选）**：

在 `src-tauri/tauri.macos.conf.json` 中配置：

```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (XXXXXXXXXX)"
    }
  }
}
```

### Windows 打包

```bash
pnpm tauri:build
```

**产物格式**：

- `.exe` — NSIS 安装程序
- `.msi` — MSI 安装包

**交叉编译（从 macOS/Linux）**：

不推荐交叉编译 Windows，建议在 Windows 环境下打包。

**配置文件**（`src-tauri/tauri.windows.conf.json`）：

```json
{
  "bundle": {
    "windows": {
      "wix": {
        "language": "zh-CN"
      }
    }
  }
}
```

### Linux 打包

```bash
pnpm tauri:build
```

**产物格式**：

- `.deb` — Debian/Ubuntu 安装包
- `.rpm` — Fedora/RedHat 安装包
- `.AppImage` — 通用 Linux 应用

---

## 更新配置

### 1. 生成签名密钥

Tauri Updater 需要签名密钥来验证更新包的完整性：

```bash
# 生成密钥对
pnpm tauri signer generate -w ~/.tauri/ai-im.key

# 输出示例:
# Public Key: dW50cnVzdGVkIGNvbW1lbnQ6...
# Private Key: (保存在 ~/.tauri/ai-im.key)
```

### 2. 配置 Updater

在 `src-tauri/tauri.conf.json` 中配置：

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IFJFUExBQ0VfV0lUSF9BVFRBQ0hFRF9QVVBMSUNfS0VZCg==",
      "endpoints": [
        "https://github.com/your-org/ai-im/releases/latest/download/latest.json"
      ],
      "windows": {
        "installMode": "passive"
      }
    }
  }
}
```

### 3. 构建带签名的更新包

```bash
# 设置环境变量
export TAURI_PRIVATE_KEY=$(cat ~/.tauri/ai-im.key)
export TAURI_KEY_PASSWORD="your-password"

# 构建
pnpm tauri:build
```

构建完成后，`src-tauri/target/release/` 目录下会生成：

- `.sig` 签名文件（用于验证更新包）
- 安装包文件

### 4. 发布更新

将以下文件上传到更新服务器：

- 安装包文件（`.dmg` / `.exe` / `.AppImage`）
- 签名文件（`.sig`）
- `latest.json` 更新清单文件

**`latest.json` 格式示例**：

```json
{
  "version": "1.1.0",
  "notes": "修复已知问题，优化性能",
  "pub_date": "2025-06-01T12:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "dW50cnVzdGVk...",
      "url": "https://github.com/your-org/ai-im/releases/download/v1.1.0/AI-IM_1.1.0_aarch64.app.tar.gz"
    },
    "darwin-x86_64": {
      "signature": "dW50cnVzdGVk...",
      "url": "https://github.com/your-org/ai-im/releases/download/v1.1.0/AI-IM_1.1.0_x64.app.tar.gz"
    },
    "windows-x86_64": {
      "signature": "dW50cnVzdGVk...",
      "url": "https://github.com/your-org/ai-im/releases/download/v1.1.0/AI-IM_1.1.0_x64-setup.exe"
    },
    "linux-x86_64": {
      "signature": "dW50cnVzdGVk...",
      "url": "https://github.com/your-org/ai-im/releases/download/v1.1.0/ai-im_1.1.0_amd64.AppImage"
    }
  }
}
```

### 5. CI/CD 自动构建（GitHub Actions）

```yaml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-22.04, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: pnpm
      - uses: dtolnay/rust-toolchain@stable
      - name: Install dependencies (ubuntu)
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt update
          sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
      - run: pnpm install
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
          TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'AI-IM v__VERSION__'
          releaseBody: 'See the assets to download this version and install.'
          releaseDraft: false
          prerelease: false
```

---

## 常见问题

### 1. macOS 打包提示找不到 OpenSSL

```bash
# 使用 Homebrew 安装 OpenSSL 并设置环境变量
brew install openssl
export OPENSSL_DIR=$(brew --prefix openssl)
```

### 2. Windows 打包提示找不到 WebView2

Windows 11 已内置 WebView2。Windows 10 需要手动安装：

- 下载地址：https://developer.microsoft.com/microsoft-edge/webview2/

### 3. Linux 运行时白屏

确保系统已安装 WebKit2GTK 运行时：

```bash
# Ubuntu / Debian
sudo apt install libwebkit2gtk-4.1-0

# Fedora
sudo dnf install webkit2gtk4.1
```

### 4. Tauri 开发模式端口被占用

项目配置了 `strictPort: true`，端口 `6130` 被占用时会直接报错。可修改 `vite.config.ts` 中的 `port` 配置。

### 5. 构建产物体积过大

- 检查是否引入了不必要的依赖
- 确保 Terser 配置正确（已开启 `drop_console` 和 `drop_debugger`）
- 使用 `pnpm build` 分析前端打包体积

### 6. 更新签名验证失败

- 确认 `TAURI_PRIVATE_KEY` 环境变量已正确设置
- 确认 `tauri.conf.json` 中的 `pubkey` 与公钥匹配
- 确认 `latest.json` 中的 `signature` 字段与 `.sig` 文件内容一致

### 7. macOS 提示"无法验证开发者"

```bash
# 方案一：右键点击应用 → 打开
# 方案二：终端执行
xattr -cr /Applications/AI-IM.app
```

如需彻底解决，需要申请 Apple Developer 证书进行代码签名。

### 8. 跨平台编译问题

Tauri 不支持交叉编译，建议在对应平台上进行构建：

- macOS 构建 → 在 macOS 上运行
- Windows 构建 → 在 Windows 上运行
- Linux 构建 → 在 Linux 上运行

使用 GitHub Actions 可以在 CI 中自动完成多平台构建。

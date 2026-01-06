# 发布指南 / Publishing Guide

本文档说明如何将 `latex-to-omml` 发布到 npm。

This document explains how to publish `latex-to-omml` to npm.

## 📋 前置准备 / Prerequisites

### 1. 创建 npm 账号 / Create npm Account

如果你还没有 npm 账号，请访问 [npmjs.com](https://www.npmjs.com/signup) 注册。

If you don't have an npm account, please visit [npmjs.com](https://www.npmjs.com/signup) to sign up.

### 2. 登录 npm / Login to npm

在本地命令行中登录 npm：

Login to npm in your local terminal:

```bash
npm login
```

输入你的用户名、密码和邮箱。

Enter your username, password, and email.

### 3. 验证登录 / Verify Login

```bash
npm whoami
```

应该显示你的 npm 用户名。

Should display your npm username.

## 🚀 发布方式 / Publishing Methods

### 方式一：使用 GitHub Actions 自动发布（推荐）/ Method 1: Automatic Publishing via GitHub Actions (Recommended)

#### 设置 NPM Token / Setup NPM Token

1. **获取 npm Access Token** / Get npm Access Token:
   - 访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Visit https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - 点击 "Generate New Token" / Click "Generate New Token"
   - 选择 "Automation" 类型 / Select "Automation" type
   - 复制生成的 token / Copy the generated token

2. **在 GitHub 仓库中添加 Secret** / Add Secret to GitHub Repository:
   - 进入你的 GitHub 仓库 / Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - 点击 "New repository secret" / Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴你的 npm token / Paste your npm token
   - 点击 "Add secret" / Click "Add secret"

3. **更新 package.json** / Update package.json:
   - 将 `YOUR_USERNAME` 替换为你的 GitHub 用户名 / Replace `YOUR_USERNAME` with your GitHub username
   - 更新 repository URL / Update repository URL

#### 发布流程 / Publishing Process

**方法 A：通过 GitHub Release 发布** / Via GitHub Release:

1. 在 GitHub 仓库中创建新的 Release / Create a new Release in your GitHub repository
2. 标签格式：`v1.0.0`（以 `v` 开头）/ Tag format: `v1.0.0` (start with `v`)
3. GitHub Actions 会自动检测 Release 并发布到 npm / GitHub Actions will automatically detect the Release and publish to npm

**方法 B：手动触发工作流** / Manual Workflow Dispatch:

1. 进入 GitHub 仓库的 Actions 页面 / Go to Actions page of your GitHub repository
2. 选择 "Publish to npm" 工作流 / Select "Publish to npm" workflow
3. 点击 "Run workflow" / Click "Run workflow"
4. 选择版本类型（patch/minor/major）/ Select version type (patch/minor/major)
5. 点击 "Run workflow" 按钮 / Click "Run workflow" button

### 方式二：手动发布 / Method 2: Manual Publishing

#### 1. 更新版本号 / Update Version

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major
```

这会自动：
- 更新 `package.json` 中的版本号
- 创建 git commit
- 创建 git tag

#### 2. 运行测试 / Run Tests

```bash
npm test
```

#### 3. 发布到 npm / Publish to npm

```bash
npm publish --access public
```

> **注意** / **Note**: 如果包名包含作用域（如 `@username/package-name`），需要使用 `--access public` 标志。
> If your package name includes a scope (e.g., `@username/package-name`), you need to use the `--access public` flag.

#### 4. 推送到 Git / Push to Git

```bash
git push origin main
git push origin --tags
```

## 📝 版本号规则 / Version Number Rules

遵循 [语义化版本](https://semver.org/lang/zh-CN/) / Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (主版本号): 当你做了不兼容的 API 修改 / When you make incompatible API changes
- **MINOR** (次版本号): 当你做了向下兼容的功能性新增 / When you add functionality in a backwards compatible manner
- **PATCH** (修订号): 当你做了向下兼容的问题修正 / When you make backwards compatible bug fixes

示例 / Example:
- `1.0.0` → `1.0.1` (修复 bug / Bug fix)
- `1.0.0` → `1.1.0` (新功能 / New feature)
- `1.0.0` → `2.0.0` (重大变更 / Breaking change)

## ✅ 发布前检查清单 / Pre-Publish Checklist

- [ ] 所有测试通过 / All tests pass
- [ ] 更新了版本号 / Version number updated
- [ ] README.md 是最新的 / README.md is up to date
- [ ] package.json 中的信息正确 / Information in package.json is correct
- [ ] 已登录 npm / Logged in to npm
- [ ] 代码已提交到 Git / Code committed to Git

## 🔍 验证发布 / Verify Publication

发布后，可以通过以下方式验证：

After publishing, you can verify by:

1. **访问 npm 包页面** / Visit npm package page:
   ```
   https://www.npmjs.com/package/latex-to-omml
   ```

2. **测试安装** / Test installation:
   ```bash
   npm install latex-to-omml
   ```

3. **检查版本** / Check version:
   ```bash
   npm view latex-to-omml version
   ```

## 🐛 常见问题 / Common Issues

### 1. 包名已存在 / Package Name Already Exists

如果包名已被占用，你需要：
- 更改包名（在 `package.json` 中）
- 或使用作用域包名（如 `@username/latex-to-omml`）

If the package name is already taken, you need to:
- Change the package name (in `package.json`)
- Or use a scoped package name (e.g., `@username/latex-to-omml`)

### 2. 发布失败：需要登录 / Publish Failed: Login Required

```bash
npm login
```

### 3. 版本号冲突 / Version Conflict

如果版本号已存在，需要更新版本号：

If the version already exists, you need to update the version:

```bash
npm version patch  # 或其他版本类型 / or other version type
```

### 4. GitHub Actions 发布失败 / GitHub Actions Publish Failed

检查：
- NPM_TOKEN secret 是否正确设置 / Check if NPM_TOKEN secret is correctly set
- Token 是否有发布权限 / Check if token has publish permissions
- 版本号是否已存在 / Check if version already exists

## 📚 相关资源 / Related Resources

- [npm 发布文档](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry) / [npm Publishing Documentation](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [语义化版本规范](https://semver.org/lang/zh-CN/) / [Semantic Versioning](https://semver.org/)
- [GitHub Actions 文档](https://docs.github.com/en/actions) / [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🎉 完成！/ Done!

发布成功后，你的包就可以被全世界的开发者使用了！

After successful publication, your package can be used by developers worldwide!


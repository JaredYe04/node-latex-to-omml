# latex-to-omml

<div align="center">

**一个将 LaTeX 数学公式转换为 Microsoft Word OMML 格式的 Node.js 库**

[![Version](https://img.shields.io/badge/version-2.0.1-blue.svg)](https://www.npmjs.com/package/latex-to-omml)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Node.js-brightgreen.svg)](https://nodejs.org/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen.svg)](https://nodejs.org/)

**[English](README.md)** | **[中文](README.zh-CN.md)**

</div>

---

## 📑 目录

- [功能特性](#-功能特性)
- [安装](#-安装)
- [快速开始](#-快速开始)
- [使用方法](#-使用方法)
- [API 参考](#-api-参考)
- [示例](#-示例)
- [转换流程](#-转换流程)
- [支持的 LaTeX 特性](#-支持的-latex-特性)
- [限制](#-限制)
- [依赖项](#-依赖项)
- [注意事项](#-注意事项)
- [贡献](#-贡献)
- [许可证](#-许可证)
- [参考资源](#-参考资源)

---

## ✨ 功能特性

- ✅ **LaTeX 转 OMML** - 将 LaTeX 数学公式转换为 OMML 格式
- ✅ **行内与块级公式** - 支持行内公式和块级公式（display mode）
- ✅ **自动标签处理** - 自动处理并移除 `\tag` 命令
- ✅ **成熟库支持** - 基于成熟的第三方库（`mathjax-node` 和 `mathml2omml`）
- ✅ **简单 API** - 易于使用的基于 Promise 的 API
- ✅ **错误处理** - 完善的错误处理和验证

---

## 📦 安装

```bash
npm install latex-to-omml
```

---

## 🚀 快速开始

```javascript
const { latexToOMML } = require('latex-to-omml');

// 行内公式
const omml = await latexToOMML('\\frac{a}{b}');
console.log(omml);

// 块级公式
const ommlBlock = await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

---

## 📖 使用方法

### 基本用法

```javascript
const { latexToOMML } = require('latex-to-omml');

// 行内公式
const omml = await latexToOMML('\\frac{a}{b}');

// 块级公式
const ommlBlock = await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

### 选项说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `displayMode` | `boolean` | `false` | 是否为块级公式 |

---

## 📚 API 参考

### `latexToOMML(latex, options?)`

将 LaTeX 代码转换为 OMML 字符串。

**参数：**

- `latex` (`string`): LaTeX 数学公式代码
- `options` (`object`, 可选): 转换选项
  - `displayMode` (`boolean`): 是否为块级公式，默认 `false`

**返回：**

- `Promise<string>`: OMML XML 字符串

**抛出：**

- `TypeError`: 如果 `latex` 不是字符串
- `Error`: 如果 LaTeX 代码为空或转换失败

---

## 💡 示例

### 基础公式

```javascript
// 分数
await latexToOMML('\\frac{a}{b}');

// 根号
await latexToOMML('\\sqrt{x}');

// 幂
await latexToOMML('x^{2}');

// 下标
await latexToOMML('x_{i}');
```

### 复杂公式

```javascript
// 矩阵
await latexToOMML('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}');

// 积分
await latexToOMML('\\int_{0}^{\\infty} e^{-x} dx');

// 求和
await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

### 带标签的公式

```javascript
// \tag 命令会被自动移除
await latexToOMML('E = mc^2 \\tag{1}');
```

### 错误处理

```javascript
try {
  const omml = await latexToOMML('\\frac{a}{b}');
  console.log('成功:', omml);
} catch (error) {
  console.error('错误:', error.message);
}
```

---

## 🔄 转换流程

完整的转换流程如下：

```
LaTeX 代码
  ↓ [预处理：移除 \tag，处理换行符]
预处理后的 LaTeX
  ↓ [mathjax-node]
MathML XML
  ↓ [清理：移除 MathJax 特定属性]
清理后的 MathML
  ↓ [mathml2omml]
OMML XML
```

---

## 🎯 支持的 LaTeX 特性

- ✅ 基础数学符号和运算符
- ✅ 分数、根号、幂、下标、上标
- ✅ 矩阵和行列式
- ✅ 积分、求和、乘积
- ✅ 希腊字母和特殊符号
- ✅ AMS 数学扩展
- ✅ 括号和分隔符

---

## ⚠️ 限制

- ❌ 不支持 `\tag` 命令（会被自动移除）
- ⚠️ 某些复杂的 LaTeX 命令可能不被支持，取决于 MathJax 的支持情况

---

## 📦 依赖项

| 包名 | 版本 | 用途 |
|------|------|------|
| `mathjax-node` | ^2.1.1 | 将 LaTeX 转换为 MathML |
| `mathml2omml` | ^0.5.0 | 将 MathML 转换为 OMML |

---

## 📝 注意事项

### MathJax 初始化

库内部使用单例模式管理 MathJax 初始化，无需手动初始化。

### 错误处理

转换过程中可能出现以下错误：

- **LaTeX 语法错误**：会抛出包含 MathJax 错误信息的异常
- **转换失败**：会抛出包含详细错误信息的异常

### 性能优化

- 对于相同 LaTeX 代码，建议在应用层进行缓存
- 批量转换时建议使用并发控制（建议最大 10 个并发）

### 行内 vs 块级公式

- **块级公式**：通常居中显示，在 Word 中使用 `<m:oMathPara>` 包装
- **行内公式**：嵌入在文本中，在 Word 中使用 `<m:oMath>` 包装

---

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

---

## 📄 许可证

本项目采用 MIT 许可证。

---

## 📚 参考资源

- [MathJax 文档](https://docs.mathjax.org/)
- [MathML 规范](https://www.w3.org/TR/MathML3/)
- [OMML 规范](https://docs.microsoft.com/en-us/openspecs/office_standards/ms-omml/)
- [mathjax-node GitHub](https://github.com/mathjax/MathJax-node)
- [mathml2omml GitHub](https://github.com/benrbray/mathml2omml)

---

<div align="center">

**为 LaTeX 和 Word 社区而制作**

</div>


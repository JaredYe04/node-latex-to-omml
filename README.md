# latex-to-omml

<div align="center">

**A Node.js library for converting LaTeX mathematical formulas to Microsoft Word OMML format**

**一个将 LaTeX 数学公式转换为 Microsoft Word OMML 格式的 Node.js 库**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://www.npmjs.com/package/latex-to-omml)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Node.js-brightgreen.svg)](https://nodejs.org/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen.svg)](https://nodejs.org/)

</div>

---

## 📑 Table of Contents / 目录

- [Features / 功能特性](#-features--功能特性)
- [Installation / 安装](#-installation--安装)
- [Quick Start / 快速开始](#-quick-start--快速开始)
- [Usage / 使用方法](#-usage--使用方法)
- [API Reference / API 参考](#-api-reference--api-参考)
- [Examples / 示例](#-examples--示例)
- [Conversion Process / 转换流程](#-conversion-process--转换流程)
- [Supported LaTeX Features / 支持的 LaTeX 特性](#-supported-latex-features--支持的-latex-特性)
- [Limitations / 限制](#-limitations--限制)
- [Dependencies / 依赖项](#-dependencies--依赖项)
- [Notes / 注意事项](#-notes--注意事项)
- [Contributing / 贡献](#-contributing--贡献)
- [License / 许可证](#-license--许可证)
- [References / 参考资源](#-references--参考资源)

---

## ✨ Features / 功能特性

- ✅ **LaTeX to OMML Conversion** - Convert LaTeX mathematical formulas to OMML format
- ✅ **Inline & Display Mode** - Support both inline and display (block) formulas
- ✅ **Auto Tag Handling** - Automatically handle and remove `\tag` commands
- ✅ **Mature Libraries** - Built on proven third-party libraries (`mathjax-node` and `mathml2omml`)
- ✅ **Simple API** - Easy-to-use, promise-based API
- ✅ **Error Handling** - Comprehensive error handling and validation

- ✅ **LaTeX 转 OMML** - 将 LaTeX 数学公式转换为 OMML 格式
- ✅ **行内与块级公式** - 支持行内公式和块级公式（display mode）
- ✅ **自动标签处理** - 自动处理并移除 `\tag` 命令
- ✅ **成熟库支持** - 基于成熟的第三方库（`mathjax-node` 和 `mathml2omml`）
- ✅ **简单 API** - 易于使用的基于 Promise 的 API
- ✅ **错误处理** - 完善的错误处理和验证

---

## 📦 Installation / 安装

```bash
npm install latex-to-omml
```

---

## 🚀 Quick Start / 快速开始

### English

```javascript
const { latexToOMML } = require('latex-to-omml');

// Inline formula
const omml = await latexToOMML('\\frac{a}{b}');
console.log(omml);

// Display mode formula
const ommlBlock = await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

### 中文

```javascript
const { latexToOMML } = require('latex-to-omml');

// 行内公式
const omml = await latexToOMML('\\frac{a}{b}');
console.log(omml);

// 块级公式
const ommlBlock = await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

---

## 📖 Usage / 使用方法

### Basic Usage / 基本用法

```javascript
const { latexToOMML } = require('latex-to-omml');

// Inline formula / 行内公式
const omml = await latexToOMML('\\frac{a}{b}');

// Display mode formula / 块级公式
const ommlBlock = await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

### Options / 选项说明

| Option / 选项 | Type / 类型 | Default / 默认值 | Description / 说明 |
|--------------|------------|----------------|-------------------|
| `displayMode` | `boolean` | `false` | Whether the formula is in display mode (block-level) / 是否为块级公式 |

---

## 📚 API Reference / API 参考

### `latexToOMML(latex, options?)`

Converts LaTeX code to OMML string.

将 LaTeX 代码转换为 OMML 字符串。

**Parameters / 参数：**

- `latex` (`string`): LaTeX mathematical formula code / LaTeX 数学公式代码
- `options` (`object`, optional): Conversion options / 转换选项
  - `displayMode` (`boolean`): Whether the formula is in display mode, default `false` / 是否为块级公式，默认 `false`

**Returns / 返回：**

- `Promise<string>`: OMML XML string / OMML XML 字符串

**Throws / 抛出：**

- `TypeError`: If `latex` is not a string / 如果 `latex` 不是字符串
- `Error`: If LaTeX code is empty or conversion fails / 如果 LaTeX 代码为空或转换失败

---

## 💡 Examples / 示例

### Basic Formulas / 基础公式

```javascript
// Fraction / 分数
await latexToOMML('\\frac{a}{b}');

// Square root / 根号
await latexToOMML('\\sqrt{x}');

// Power / 幂
await latexToOMML('x^{2}');

// Subscript / 下标
await latexToOMML('x_{i}');
```

### Complex Formulas / 复杂公式

```javascript
// Matrix / 矩阵
await latexToOMML('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}');

// Integral / 积分
await latexToOMML('\\int_{0}^{\\infty} e^{-x} dx');

// Summation / 求和
await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

### Formulas with Tags / 带标签的公式

```javascript
// \tag command will be automatically removed
// \tag 命令会被自动移除
await latexToOMML('E = mc^2 \\tag{1}');
```

### Error Handling / 错误处理

```javascript
try {
  const omml = await latexToOMML('\\frac{a}{b}');
  console.log('Success:', omml);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔄 Conversion Process / 转换流程

The complete conversion process is as follows:

完整的转换流程如下：

```
LaTeX Code / LaTeX 代码
  ↓ [Preprocessing: Remove \tag, handle line breaks / 预处理：移除 \tag，处理换行符]
Preprocessed LaTeX / 预处理后的 LaTeX
  ↓ [mathjax-node]
MathML XML
  ↓ [Cleaning: Remove MathJax-specific attributes / 清理：移除 MathJax 特定属性]
Cleaned MathML / 清理后的 MathML
  ↓ [mathml2omml]
OMML XML
```

---

## 🎯 Supported LaTeX Features / 支持的 LaTeX 特性

- ✅ Basic mathematical symbols and operators / 基础数学符号和运算符
- ✅ Fractions, roots, powers, subscripts, superscripts / 分数、根号、幂、下标、上标
- ✅ Matrices and determinants / 矩阵和行列式
- ✅ Integrals, summations, products / 积分、求和、乘积
- ✅ Greek letters and special symbols / 希腊字母和特殊符号
- ✅ AMS math extensions / AMS 数学扩展
- ✅ Parentheses and delimiters / 括号和分隔符

---

## ⚠️ Limitations / 限制

- ❌ `\tag` command is not supported (will be automatically removed) / 不支持 `\tag` 命令（会被自动移除）
- ⚠️ Some complex LaTeX commands may not be supported, depending on MathJax support / 某些复杂的 LaTeX 命令可能不被支持，取决于 MathJax 的支持情况

---

## 📦 Dependencies / 依赖项

| Package | Version | Purpose / 用途 |
|---------|---------|---------------|
| `mathjax-node` | ^2.1.1 | Convert LaTeX to MathML / 将 LaTeX 转换为 MathML |
| `mathml2omml` | ^0.5.0 | Convert MathML to OMML / 将 MathML 转换为 OMML |

---

## 📝 Notes / 注意事项

### MathJax Initialization / MathJax 初始化

The library uses a singleton pattern to manage MathJax initialization internally, so you don't need to initialize it manually.

库内部使用单例模式管理 MathJax 初始化，无需手动初始化。

### Error Handling / 错误处理

The following errors may occur during conversion:

转换过程中可能出现以下错误：

- **LaTeX syntax errors** / LaTeX 语法错误: Will throw an exception containing MathJax error messages / 会抛出包含 MathJax 错误信息的异常
- **Conversion failures** / 转换失败: Will throw an exception with detailed error information / 会抛出包含详细错误信息的异常

### Performance Optimization / 性能优化

- For the same LaTeX code, caching is recommended at the application level / 对于相同 LaTeX 代码，建议在应用层进行缓存
- For batch conversions, concurrent control is recommended (suggested maximum 10 concurrent) / 批量转换时建议使用并发控制（建议最大 10 个并发）

### Inline vs Display Mode / 行内 vs 块级公式

- **Display mode** / 块级公式: Usually centered, wrapped with `<m:oMathPara>` in Word / 通常居中显示，在 Word 中使用 `<m:oMathPara>` 包装
- **Inline mode** / 行内公式: Embedded in text, wrapped with `<m:oMath>` in Word / 嵌入在文本中，在 Word 中使用 `<m:oMath>` 包装

---

## 🤝 Contributing / 贡献

Contributions are welcome! Please feel free to submit a Pull Request.

欢迎贡献！请随时提交 Pull Request。

---

## 📄 License / 许可证

This project is licensed under the MIT License.

本项目采用 MIT 许可证。

---

## 📚 References / 参考资源

- [MathJax Documentation](https://docs.mathjax.org/) / [MathJax 文档](https://docs.mathjax.org/)
- [MathML Specification](https://www.w3.org/TR/MathML3/) / [MathML 规范](https://www.w3.org/TR/MathML3/)
- [OMML Specification](https://docs.microsoft.com/en-us/openspecs/office_standards/ms-omml/) / [OMML 规范](https://docs.microsoft.com/en-us/openspecs/office_standards/ms-omml/)
- [mathjax-node GitHub](https://github.com/mathjax/MathJax-node)
- [mathml2omml GitHub](https://github.com/benrbray/mathml2omml)

---

<div align="center">

**Made with ❤️ for the LaTeX and Word community**

**为 LaTeX 和 Word 社区而制作**

</div>

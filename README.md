# latex-to-omml

<div align="center">

**A Node.js library for converting LaTeX mathematical formulas to Microsoft Word OMML format**

[![Version](https://img.shields.io/badge/version-2.0.1-blue.svg)](https://www.npmjs.com/package/latex-to-omml)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Node.js-brightgreen.svg)](https://nodejs.org/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen.svg)](https://nodejs.org/)

**[English](README.md)** | **[中文](README.zh-CN.md)**

</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Conversion Process](#-conversion-process)
- [Supported LaTeX Features](#-supported-latex-features)
- [Limitations](#-limitations)
- [Dependencies](#-dependencies)
- [Notes](#-notes)
- [Contributing](#-contributing)
- [License](#-license)
- [References](#-references)

---

## ✨ Features

- ✅ **LaTeX to OMML Conversion** - Convert LaTeX mathematical formulas to OMML format
- ✅ **Inline & Display Mode** - Support both inline and display (block) formulas
- ✅ **Auto Tag Handling** - Automatically handle and remove `\tag` commands
- ✅ **Mature Libraries** - Built on proven third-party libraries (`mathjax-node` and `mathml2omml`)
- ✅ **Simple API** - Easy-to-use, promise-based API
- ✅ **Error Handling** - Comprehensive error handling and validation

---

## 📦 Installation

```bash
npm install latex-to-omml
```

---

## 🚀 Quick Start

```javascript
const { latexToOMML } = require('latex-to-omml');

// Inline formula
const omml = await latexToOMML('\\frac{a}{b}');
console.log(omml);

// Display mode formula
const ommlBlock = await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

---

## 📖 Usage

### Basic Usage

```javascript
const { latexToOMML } = require('latex-to-omml');

// Inline formula
const omml = await latexToOMML('\\frac{a}{b}');

// Display mode formula
const ommlBlock = await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `displayMode` | `boolean` | `false` | Whether the formula is in display mode (block-level) |

---

## 📚 API Reference

### `latexToOMML(latex, options?)`

Converts LaTeX code to OMML string.

**Parameters:**

- `latex` (`string`): LaTeX mathematical formula code
- `options` (`object`, optional): Conversion options
  - `displayMode` (`boolean`): Whether the formula is in display mode, default `false`

**Returns:**

- `Promise<string>`: OMML XML string

**Throws:**

- `TypeError`: If `latex` is not a string
- `Error`: If LaTeX code is empty or conversion fails

---

## 💡 Examples

### Basic Formulas

```javascript
// Fraction
await latexToOMML('\\frac{a}{b}');

// Square root
await latexToOMML('\\sqrt{x}');

// Power
await latexToOMML('x^{2}');

// Subscript
await latexToOMML('x_{i}');
```

### Complex Formulas

```javascript
// Matrix
await latexToOMML('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}');

// Integral
await latexToOMML('\\int_{0}^{\\infty} e^{-x} dx');

// Summation
await latexToOMML('\\sum_{i=1}^{n} x_i', { displayMode: true });
```

### Formulas with Tags

```javascript
// \tag command will be automatically removed
await latexToOMML('E = mc^2 \\tag{1}');
```

### Error Handling

```javascript
try {
  const omml = await latexToOMML('\\frac{a}{b}');
  console.log('Success:', omml);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔄 Conversion Process

The complete conversion process is as follows:

```
LaTeX Code
  ↓ [Preprocessing: Remove \tag, handle line breaks]
Preprocessed LaTeX
  ↓ [mathjax-node]
MathML XML
  ↓ [Cleaning: Remove MathJax-specific attributes]
Cleaned MathML
  ↓ [mathml2omml]
OMML XML
```

---

## 🎯 Supported LaTeX Features

- ✅ Basic mathematical symbols and operators
- ✅ Fractions, roots, powers, subscripts, superscripts
- ✅ Matrices and determinants
- ✅ Integrals, summations, products
- ✅ Greek letters and special symbols
- ✅ AMS math extensions
- ✅ Parentheses and delimiters

---

## ⚠️ Limitations

- ❌ `\tag` command is not supported (will be automatically removed)
- ⚠️ Some complex LaTeX commands may not be supported, depending on MathJax support

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `mathjax-node` | ^2.1.1 | Convert LaTeX to MathML |
| `mathml2omml` | ^0.5.0 | Convert MathML to OMML |

---

## 📝 Notes

### MathJax Initialization

The library uses a singleton pattern to manage MathJax initialization internally, so you don't need to initialize it manually.

### Error Handling

The following errors may occur during conversion:

- **LaTeX syntax errors**: Will throw an exception containing MathJax error messages
- **Conversion failures**: Will throw an exception with detailed error information

### Performance Optimization

- For the same LaTeX code, caching is recommended at the application level
- For batch conversions, concurrent control is recommended (suggested maximum 10 concurrent)

### Inline vs Display Mode

- **Display mode**: Usually centered, wrapped with `<m:oMathPara>` in Word
- **Inline mode**: Embedded in text, wrapped with `<m:oMath>` in Word

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 📚 References

- [MathJax Documentation](https://docs.mathjax.org/)
- [MathML Specification](https://www.w3.org/TR/MathML3/)
- [OMML Specification](https://docs.microsoft.com/en-us/openspecs/office_standards/ms-omml/)
- [mathjax-node GitHub](https://github.com/mathjax/MathJax-node)
- [mathml2omml GitHub](https://github.com/benrbray/mathml2omml)

---

<div align="center">

**Made with ❤️ for the LaTeX and Word community**

</div>

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-XX-XX

### Added
- Initial release / 初始发布
- LaTeX to OMML conversion functionality / LaTeX 转 OMML 转换功能
- Support for inline and display mode formulas / 支持行内和块级公式
- Automatic `\tag` command handling / 自动处理 `\tag` 命令
- Comprehensive error handling / 完善的错误处理
- Bilingual documentation (English/Chinese) / 中英双语文档

### Technical Details
- Built on `mathjax-node` (^2.1.1) for LaTeX to MathML conversion
- Built on `mathml2omml` (^0.5.0) for MathML to OMML conversion
- Singleton pattern for MathJax initialization
- Promise-based async API

[1.0.0]: https://github.com/YOUR_USERNAME/latex-to-omml/releases/tag/v1.0.0


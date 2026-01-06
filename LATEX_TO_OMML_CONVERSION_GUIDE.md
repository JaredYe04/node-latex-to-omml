# LaTeX 到 OMML 转换流程梳理文档

本文档详细梳理了从 LaTeX 代码转换为 MathML，再转换为 OMML 的完整流程。该流程基于第三方库实现，适用于需要将 LaTeX 数学公式转换为 Microsoft Word OMML 格式的场景。

## 概述

转换流程分为两个主要阶段：
1. **LaTeX → MathML**：使用 `mathjax-node` 库将 LaTeX 代码转换为标准 MathML 格式
2. **MathML → OMML**：将 MathML 转换为 Office Math Markup Language（OMML），这是 Microsoft Word 的原生数学公式格式

## 阶段一：LaTeX → MathML 转换

### 使用的库

- **库名**：`mathjax-node`
- **版本**：`^2.1.1`
- **说明**：MathJax 的 Node.js 版本，用于在服务器端将 LaTeX 转换为 MathML

### 初始化配置

```javascript
const mjAPI = require('mathjax-node');

mjAPI.config({
  MathJax: {
    // 使用 NativeMML 输出格式（MathJax 2.x 生成 MathML 的方式）
    jax: ['input/TeX', 'output/NativeMML'],
    TeX: {
      extensions: [
        'AMSmath.js',      // AMS 数学扩展
        'AMSsymbols.js',   // AMS 符号扩展
        'noErrors.js',      // 错误处理
        'noUndefined.js'    // 未定义命令处理
      ]
    }
  }
});

mjAPI.start();
```

### LaTeX 预处理

在转换为 MathML 之前，需要对 LaTeX 代码进行预处理：

#### 1. 提取并移除 `\tag` 命令

`\tag` 命令用于为公式添加标签（如编号），但 MathJax 不支持此命令，需要提前提取并移除：

```javascript
function extractTagFromLatex(latex) {
  let processed = latex;
  let tag = null;
  
  // 匹配 \tag{...} 或 \tag*{...}
  const tagMatch = processed.match(/\\tag\*?\{([^}]*)\}/);
  if (tagMatch) {
    const tagContent = tagMatch[1].trim();
    const isTagStar = tagMatch[0].startsWith('\\tag*');
    
    if (isTagStar) {
      // \tag*{...}：不添加括号
      tag = tagContent;
    } else {
      // \tag{...}：需要添加括号（除非内容本身已包含括号）
      if (tagContent.startsWith('(') && tagContent.endsWith(')')) {
        tag = tagContent;
      } else {
        tag = `(${tagContent})`;
      }
    }
    
    // 移除 \tag 命令
    processed = processed.replace(/\\tag\*?\{[^}]*\}/g, '');
  }
  
  // 规范化空白字符
  processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  processed = processed.replace(/[ \t]+/g, ' ');
  processed = processed.trim();
  
  return { tag, processedLatex: processed };
}
```

#### 2. 处理块级公式的换行符

对于块级公式（display mode），需要将换行符替换为空格：

```javascript
if (displayMode) {
  preprocessedLatex = preprocessedLatex.replace(/\s*\n\s*/g, ' ');
}
```

### 执行转换

```javascript
async function convertLatexToMathML(latex, displayMode = false) {
  // 1. 预处理
  const { processedLatex } = extractTagFromLatex(latex);
  let preprocessedLatex = processedLatex;
  
  if (displayMode) {
    preprocessedLatex = preprocessedLatex.replace(/\s*\n\s*/g, ' ');
  }
  
  // 2. 调用 mathjax-node 进行转换
  const result = await new Promise((resolve, reject) => {
    mjAPI.typeset(
      {
        math: preprocessedLatex,
        format: 'TeX',
        mml: true,  // 请求 MathML 输出
        display: displayMode
      },
      (data) => {
        if (data.errors && data.errors.length > 0) {
          reject(new Error(data.errors.join(', ')));
        } else if (data.mml) {
          resolve(data);
        } else {
          reject(new Error('MathJax 转换返回空结果'));
        }
      }
    );
  });
  
  return result.mml;
}
```

### 返回的 MathML 格式

`mathjax-node` 返回的 MathML 是标准的 XML 格式，例如：

```xml
<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mfrac>
    <mi>a</mi>
    <mi>b</mi>
  </mfrac>
</math>
```

## 阶段二：MathML → OMML 转换

### 方案选择

有两种实现方案：

#### 方案 A：使用第三方库 `mathml2omml`（推荐，稳定）

- **库名**：`mathml2omml`
- **版本**：`^0.5.0`
- **使用方式**：

```javascript
const { mml2omml } = require('mathml2omml');

// 清理 MathML（移除 MathJax 特定属性）
let cleanedMathml = mathml
  .replace(/<!--[\s\S]*?-->/g, '')           // 移除 HTML 注释
  .replace(/\s+class="[^"]*"/g, '')          // 移除 class 属性
  .replace(/\s+scriptlevel="[^"]*"/g, '')   // 移除 scriptlevel
  .replace(/\s+maxsize="[^"]*"/g, '')        // 移除 maxsize
  .replace(/\s+minsize="[^"]*"/g, '')        // 移除 minsize
  .replace(/>\s+</g, '><')                    // 移除标签间空白
  .replace(/\s{2,}/g, ' ')                   // 规范化空白
  .trim();

// 转换为 OMML
const omml = mml2omml(cleanedMathml);
```

#### 方案 B：自定义转换器（三层架构）

如果选择自己实现，可以采用三层架构：

##### 第一层：MathML 规范化（Normalize）

**目标**：将 MathML 标准化，为后续解析做准备

**主要处理**：
1. **展平嵌套 `<mrow>`**：移除不必要的嵌套层级
2. **拆分文本节点**：将 `<mi>abc</mi>` 拆分为 `<mi>a</mi><mi>b</mi><mi>c</mi>`
3. **识别 fence（括号）**：标记括号、分隔符等字符
4. **删除 MathJax 私有节点**：移除 `MJX-TeXAtom-*` 类的元素

**实现要点**：
- 使用 `@xmldom/xmldom` 进行 XML 解析
- 递归处理所有元素
- 对于 `<munder>`、`<mover>`、`<munderover>`、`<msubsup>` 等特殊结构，需要特殊处理（base 不拆分）

##### 第二层：MathML → 数学 AST（Parse）

**目标**：将规范化的 MathML 解析为内部数学 AST

**AST 节点类型**：
- `Fraction`：分数（`<mfrac>`）
- `Sqrt`：根号（`<msqrt>`、`<mroot>`）
- `Power`：幂（`<msup>`）
- `Subscript`：下标（`<msub>`）
- `SubSup`：上下标组合（`<msubsup>`）
- `Over`：上标（`<mover>`）
- `Under`：下标（`<munder>`）
- `UnderOver`：上下标（`<munderover>`）
- `Delimiter`：分隔符（括号等）
- `Matrix`：矩阵（`<mtable>`）
- `Operator`：运算符（`<mo>`）
- `Text`：文本（`<mi>`、`<mn>`、`<mtext>`）
- `Row`：行（`<mrow>`）

**实现要点**：
- 递归解析所有 MathML 元素
- 识别并配对括号（Delimiter）
- 处理矩阵结构（`<mtable>` → `<mtr>` → `<mtd>`）

##### 第三层：AST → OMML（Convert）

**目标**：将数学 AST 转换为 OMML XML 格式

**OMML 硬规则**（必须遵守）：

1. **一个 `<m:t>` 不能包含多个数学 token**
   - 所有文本和运算符必须拆分为单个字符
   - 每个字符使用独立的 `<m:r><m:t>char</m:t></m:r>` 结构

2. **运算符不能当普通字符**
   - 运算符必须使用 `<m:r><m:t>` 结构，每个字符单独处理

3. **fence 必须用 `<m:d>`**
   - 所有分隔符（括号、大括号等）必须使用 `<m:d>` 结构：
   ```xml
   <m:d>
     <m:dPr>
       <m:begChr m:val="("/>
       <m:endChr m:val=")"/>
     </m:dPr>
     <m:e>...</m:e>
   </m:d>
   ```

4. **matrix 必须 `<m:m>` + `<m:mr>`**
   - 矩阵必须使用以下结构：
   ```xml
   <m:m>
     <m:mPr></m:mPr>
     <m:mr>
       <m:e>...</m:e>
       <m:e>...</m:e>
     </m:mr>
     <m:mr>...</m:mr>
   </m:m>
   ```

**AST 到 OMML 映射表**：

| AST 节点 | OMML 模板 |
|---------|-----------|
| `Fraction` | `<m:f><m:num>...</m:num><m:den>...</m:den></m:f>` |
| `Sqrt`（平方根） | `<m:rad><m:radPr></m:radPr><m:e>...</m:e></m:rad>` |
| `Sqrt`（n次根） | `<m:rad><m:radPr><m:degHide m:val="0"/></m:radPr><m:deg>...</m:deg><m:e>...</m:e></m:rad>` |
| `Power` | `<m:sSup><m:e>...</m:e><m:sup>...</m:sup></m:sSup>` |
| `Subscript` | `<m:sSub><m:e>...</m:e><m:sub>...</m:sub></m:sSub>` |
| `SubSup` | `<m:sSubSup><m:e>...</m:e><m:sub>...</m:sub><m:sup>...</m:sup></m:sSubSup>` |
| `Delimiter` | `<m:d><m:dPr><m:begChr m:val="..."/><m:endChr m:val="..."/></m:dPr><m:e>...</m:e></m:d>` |
| `Matrix` | `<m:m><m:mPr></m:mPr><m:mr>...</m:mr>...</m:m>` |
| `Operator` | `<m:r><m:t>...</m:t></m:r>`（每个字符单独） |
| `Text` | `<m:r><m:t>...</m:t></m:r>`（每个字符单独） |

**特殊处理**：
- 积分和求和运算符（∫、∑）使用 `<m:nary>` 结构
- 上标/下标使用 `<m:groupChr>` 结构

**OMML 命名空间**：
```xml
<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">
  ...
</m:oMath>
```

## 完整转换流程示例

```javascript
// 1. LaTeX → MathML
const mathml = await convertLatexToMathML('\\frac{a}{b}', false);

// 2. MathML 清理（如果使用 mathml2omml 库）
const cleanedMathml = mathml
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\s+class="[^"]*"/g, '')
  .replace(/\s+scriptlevel="[^"]*"/g, '')
  .replace(/>\s+</g, '><')
  .trim();

// 3. MathML → OMML
// 方案 A：使用 mathml2omml 库
const { mml2omml } = require('mathml2omml');
const omml = mml2omml(cleanedMathml);

// 或方案 B：使用自定义转换器
const { convertMathMLToOMML } = require('./mml2omml-converter');
const omml = convertMathMLToOMML(cleanedMathml);
```

## 依赖项清单

### LaTeX → MathML 阶段

```json
{
  "dependencies": {
    "mathjax-node": "^2.1.1"
  }
}
```

### MathML → OMML 阶段

**方案 A（使用第三方库）**：
```json
{
  "dependencies": {
    "mathml2omml": "^0.5.0"
  }
}
```

**方案 B（自定义实现）**：
```json
{
  "dependencies": {
    "@xmldom/xmldom": "^0.8.11"
  }
}
```

## 注意事项

1. **MathJax 初始化**：`mathjax-node` 需要先调用 `mjAPI.start()` 进行初始化，建议使用单例模式，避免重复初始化。

2. **错误处理**：转换过程中可能出现以下错误：
   - LaTeX 语法错误：MathJax 会返回错误信息
   - MathML 解析错误：XML 解析失败
   - OMML 生成错误：AST 转换失败

3. **性能优化**：
   - 对于相同 LaTeX 代码，可以缓存转换结果
   - 批量转换时可以使用并发控制（建议最大 10 个并发）

4. **特殊字符处理**：
   - LaTeX 中的 `<`、`>`、`&` 等字符在 XML 中需要转义
   - 建议在转换为 MathML 之前进行预处理

5. **块级 vs 行内公式**：
   - 块级公式（display mode）：通常居中显示，使用 `<m:oMathPara>` 包装
   - 行内公式（inline mode）：嵌入在文本中，使用 `<m:oMath>` 包装

## 测试建议

建议创建以下测试用例：

1. **基础公式**：分数、根号、幂、下标、上标
2. **复杂公式**：矩阵、积分、求和、多行公式
3. **特殊字符**：希腊字母、运算符、括号
4. **边界情况**：空公式、单个字符、嵌套结构
5. **错误处理**：无效 LaTeX、无效 MathML

## 参考资源

- [MathJax 文档](https://docs.mathjax.org/)
- [MathML 规范](https://www.w3.org/TR/MathML3/)
- [OMML 规范](https://docs.microsoft.com/en-us/openspecs/office_standards/ms-omml/)
- [mathjax-node GitHub](https://github.com/mathjax/MathJax-node)
- [mathml2omml GitHub](https://github.com/benrbray/mathml2omml)

## 总结

完整的转换流程为：

```
LaTeX 代码
  ↓ [预处理：移除 \tag，处理换行符]
预处理后的 LaTeX
  ↓ [mathjax-node]
MathML XML
  ↓ [清理：移除 MathJax 特定属性]
清理后的 MathML
  ↓ [mathml2omml 或自定义转换器]
OMML XML
```

该流程已经过实际项目验证，可以稳定地将 LaTeX 公式转换为 Word 可识别的 OMML 格式。


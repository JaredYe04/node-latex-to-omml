const mjAPI = require('mathjax-node');

// MathJax 初始化标志
let isInitialized = false;

/**
 * 初始化 MathJax（单例模式）
 */
function initializeMathJax() {
  if (isInitialized) {
    return;
  }

  mjAPI.config({
    MathJax: {
      // 使用 NativeMML 输出格式（MathJax 2.x 生成 MathML 的方式）
      jax: ['input/TeX', 'output/NativeMML'],
      TeX: {
        extensions: [
          'AMSmath.js',      // AMS 数学扩展
          'AMSsymbols.js',   // AMS 符号扩展
          'noErrors.js',      // 错误处理
          'noUndefined.js'   // 未定义命令处理
        ]
      }
    }
  });

  mjAPI.start();
  isInitialized = true;
}

/**
 * 提取并移除 \tag 命令
 * @param {string} latex - LaTeX 代码
 * @returns {{tag: string|null, processedLatex: string}} - 提取的标签和处理后的 LaTeX
 */
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

/**
 * 将 LaTeX 转换为 MathML
 * @param {string} latex - LaTeX 代码
 * @param {boolean} displayMode - 是否为块级公式（display mode）
 * @returns {Promise<string>} - MathML XML 字符串
 */
async function convertLatexToMathML(latex, displayMode = false) {
  // 确保 MathJax 已初始化
  initializeMathJax();

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

/**
 * 清理 MathML（移除 MathJax 特定属性）
 * @param {string} mathml - MathML XML 字符串
 * @returns {string} - 清理后的 MathML
 */
function cleanMathML(mathml) {
  return mathml
    .replace(/<!--[\s\S]*?-->/g, '')           // 移除 HTML 注释
    .replace(/\s+class="[^"]*"/g, '')          // 移除 class 属性
    .replace(/\s+scriptlevel="[^"]*"/g, '')   // 移除 scriptlevel
    .replace(/\s+maxsize="[^"]*"/g, '')        // 移除 maxsize
    .replace(/\s+minsize="[^"]*"/g, '')        // 移除 minsize
    .replace(/>\s+</g, '><')                    // 移除标签间空白
    .replace(/\s{2,}/g, ' ')                   // 规范化空白
    .trim();
}

/**
 * 将 LaTeX 转换为 OMML
 * @param {string} latex - LaTeX 代码
 * @param {Object} options - 转换选项
 * @param {boolean} options.displayMode - 是否为块级公式（默认 false）
 * @returns {Promise<string>} - OMML XML 字符串
 */
async function convertLatexToOMML(latex, options = {}) {
  const { displayMode = false } = options;

  try {
    // 1. LaTeX → MathML
    const mathml = await convertLatexToMathML(latex, displayMode);

    // 2. 清理 MathML
    const cleanedMathml = cleanMathML(mathml);

    // 3. MathML → OMML (使用动态 import 因为 mathml2omml 是 ES Module)
    const { mml2omml } = await import('mathml2omml');
    const omml = mml2omml(cleanedMathml);

    return omml;
  } catch (error) {
    throw new Error(`LaTeX 转 OMML 转换失败: ${error.message}`);
  }
}

module.exports = {
  convertLatexToOMML,
  convertLatexToMathML,
  cleanMathML,
  extractTagFromLatex,
  initializeMathJax
};


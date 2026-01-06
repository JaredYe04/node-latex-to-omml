const mjAPI = require('mathjax-node');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

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
 * 修复求和符号、积分符号等运算符的表达式位置
 * 将运算符后面的表达式包装到运算符内部
 * @param {string} mathml - MathML XML 字符串
 * @returns {string} - 修复后的 MathML
 */
function fixOperatorExpressions(mathml) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mathml, 'text/xml');
    
    // 检查解析错误
    const parserError = doc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      // 如果解析失败，返回原始 MathML
      return mathml;
    }
    
    const mathElement = doc.documentElement;
    if (!mathElement) {
      return mathml;
    }
    
    // 查找所有需要处理的运算符节点
    const operators = [];
    function findOperators(node) {
      if (node.nodeType === 1) { // Element node
        const tagName = node.tagName;
        if (tagName === 'munderover' || tagName === 'msubsup') {
          const firstChild = node.firstChild;
          if (firstChild && firstChild.nodeType === 1 && firstChild.tagName === 'mo') {
            const operatorText = firstChild.textContent || '';
            const operatorSymbols = ['∑', '∫', '∏', '∐', '⋂', '⋃', '∮', '∯', '∰'];
            if (operatorSymbols.some(sym => operatorText.includes(sym))) {
              operators.push(node);
            }
          }
        }
        
        // 递归查找
        let child = node.firstChild;
        while (child) {
          findOperators(child);
          child = child.nextSibling;
        }
      }
    }
    
    findOperators(mathElement);
    
    // 从后往前处理，避免索引变化
    for (let i = operators.length - 1; i >= 0; i--) {
      const operatorNode = operators[i];
      const parent = operatorNode.parentNode;
      
      if (!parent) continue;
      
      // 查找下一个兄弟元素节点
      let nextSibling = operatorNode.nextSibling;
      while (nextSibling && (nextSibling.nodeType !== 1)) {
        nextSibling = nextSibling.nextSibling;
      }
      
      if (nextSibling && nextSibling.nodeType === 1) {
        // 检查下一个元素是否是分隔符（等号、逗号等）
        const nextTag = nextSibling.tagName;
        let shouldWrap = true;
        
        if (nextTag === 'mo') {
          const moText = nextSibling.textContent || '';
          // 如果遇到等号、逗号、分号等，不包装
          if (moText.match(/^[=,;]$/)) {
            shouldWrap = false;
          }
        }
        
        if (shouldWrap) {
          // 收集后续表达式元素
          let currentSibling = nextSibling;
          const elementsToMove = [];
          
          while (currentSibling) {
            if (currentSibling.nodeType === 1) {
              const siblingTag = currentSibling.tagName;
              
              // 如果遇到分隔符，停止收集
              if (siblingTag === 'mo') {
                const moText = currentSibling.textContent || '';
                if (moText.match(/^[=,;]$/)) {
                  break;
                }
              }
              
              elementsToMove.push(currentSibling);
              currentSibling = currentSibling.nextSibling;
            } else {
              currentSibling = currentSibling.nextSibling;
            }
          }
          
          if (elementsToMove.length > 0) {
            // 将后续表达式包装到一个 <mrow> 中
            // mathml2omml 库的 mrow 函数会检查 previousSibling.isNary，
            // 如果前一个兄弟节点是 nary 运算符，会将内容添加到 nary 的 <m:e> 中
            const mrow = doc.createElement('mrow');
            for (const elem of elementsToMove) {
              mrow.appendChild(elem);
            }
            
            // 将 <mrow> 插入到运算符节点之后
            if (operatorNode.nextSibling) {
              parent.insertBefore(mrow, operatorNode.nextSibling);
            } else {
              parent.appendChild(mrow);
            }
          }
        }
      }
    }
    
    // 序列化回 XML 字符串
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  } catch (error) {
    // 如果处理失败，返回原始 MathML
    console.warn('修复运算符表达式时出错:', error.message);
    return mathml;
  }
}

/**
 * 清理 MathML（移除 MathJax 特定属性）
 * @param {string} mathml - MathML XML 字符串
 * @returns {string} - 清理后的 MathML
 */
function cleanMathML(mathml) {
  let cleaned = mathml
    .replace(/<!--[\s\S]*?-->/g, '')           // 移除 HTML 注释
    .replace(/\s+class="[^"]*"/g, '')          // 移除 class 属性
    .replace(/\s+scriptlevel="[^"]*"/g, '')   // 移除 scriptlevel
    .replace(/\s+maxsize="[^"]*"/g, '')        // 移除 maxsize
    .replace(/\s+minsize="[^"]*"/g, '')        // 移除 minsize
    .replace(/>\s+</g, '><')                    // 移除标签间空白
    .replace(/\s{2,}/g, ' ')                   // 规范化空白
    .trim();
  
  // 修复运算符表达式位置
  cleaned = fixOperatorExpressions(cleaned);
  
  return cleaned;
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


const { convertLatexToOMML } = require('./lib/converter');

/**
 * 将 LaTeX 数学公式转换为 OMML 格式
 * 
 * @param {string} latex - LaTeX 代码
 * @param {Object} options - 转换选项
 * @param {boolean} options.displayMode - 是否为块级公式（默认 false，即行内公式）
 * @returns {Promise<string>} - OMML XML 字符串
 * 
 * @example
 * const { latexToOMML } = require('latex-to-omml');
 * 
 * // 行内公式
 * const omml = await latexToOMML('\\frac{a}{b}');
 * 
 * // 块级公式
 * const ommlBlock = await latexToOMML('\\frac{a}{b}', { displayMode: true });
 */
async function latexToOMML(latex, options = {}) {
  if (typeof latex !== 'string') {
    throw new TypeError('第一个参数必须是字符串类型的 LaTeX 代码');
  }

  if (latex.trim() === '') {
    throw new Error('LaTeX 代码不能为空');
  }

  return await convertLatexToOMML(latex, options);
}

module.exports = {
  latexToOMML
};


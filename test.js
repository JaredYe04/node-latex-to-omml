const { latexToOMML } = require('./index');

async function runTests() {
  console.log('开始测试...\n');

  const testCases = [
    // 基础测试
    {
      name: '基础分数',
      latex: '\\frac{a}{b}',
      displayMode: false
    },
    {
      name: '根号',
      latex: '\\sqrt{x}',
      displayMode: false
    },
    {
      name: '幂',
      latex: 'x^{2}',
      displayMode: false
    },
    {
      name: '下标',
      latex: 'x_{i}',
      displayMode: false
    },
    {
      name: '块级公式 - 求和',
      latex: '\\sum_{i=1}^{n} x_i',
      displayMode: true
    },
    {
      name: '带 tag 的公式',
      latex: 'E = mc^2 \\tag{1}',
      displayMode: false
    },
    // 修复后的测试用例
    {
      name: '求和符号 + 分式（修复测试）',
      latex: 'e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}',
      displayMode: true
    },
    {
      name: '积分符号 + 分式（修复测试）',
      latex: '\\int_{0}^{\\infty} \\frac{e^{-x^2}}{1+x^2}\\,dx',
      displayMode: true
    },
    // 复杂测试用例
    {
      name: '1. 深度嵌套分式 + 上下标（行内）',
      latex: '\\frac{a_{i+1}^{2k}}{\\sqrt{\\frac{b_{j}^{n+1}}{c_{m-1}}}}',
      displayMode: false
    },
    {
      name: '1. 深度嵌套分式 + 上下标（块级）',
      latex: '\\frac{\\left( a_{i+1}^{2k} + \\sum_{j=1}^{n} b_j \\right)^2}{\\sqrt{\\frac{\\prod_{m=1}^{M} c_m^{\\alpha_m}}{d_{k-1}^{\\beta}}}}',
      displayMode: true
    },
    {
      name: '2. 极限 + 分段函数（行内）',
      latex: '\\lim_{x \\to 0^+} f(x) = \\begin{cases} x^2, & x > 0 \\\\ 0, & x = 0 \\end{cases}',
      displayMode: false
    },
    {
      name: '2. 极限 + 分段函数（块级）',
      latex: 'f(x) = \\begin{cases} \\displaystyle \\lim_{n \\to \\infty} \\frac{1}{n} \\sum_{k=1}^{n} x_k, & x > 0 \\\\[6pt] \\displaystyle \\int_{0}^{1} t^2 \\, dt, & x = 0 \\\\[6pt] \\text{undefined}, & x < 0 \\end{cases}',
      displayMode: true
    },
    {
      name: '3. 大型运算符 + 上下限 + 嵌套（行内）',
      latex: '\\sum\\limits_{i=1}^{n} \\prod\\limits_{j=1}^{m} a_{ij}',
      displayMode: false
    },
    {
      name: '3. 大型运算符 + 上下限 + 嵌套（块级）',
      latex: '\\sum_{i=1}^{n} \\left( \\prod_{j=1}^{m} \\frac{a_{ij}^{(k+1)}}{1 + \\exp(-x_j)} \\right)',
      displayMode: true
    },
    {
      name: '4. 积分 + 多重上下限 + 分式被积函数（行内）',
      latex: '\\int_{0}^{\\infty} \\frac{e^{-x^2}}{1+x^2}\\,dx',
      displayMode: false
    },
    {
      name: '4. 积分 + 多重上下限 + 分式被积函数（块级）',
      latex: '\\int_{0}^{\\infty} \\int_{-\\infty}^{\\infty} \\frac{e^{-(x^2 + y^2)}}{1 + \\sqrt{x^2 + y^2}} \\, dx \\, dy',
      displayMode: true
    },
    {
      name: '5. 矩阵 + 分式 + 行内文本（行内）',
      latex: '\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}',
      displayMode: false
    },
    {
      name: '5. 矩阵 + 分式 + 行内文本（块级）',
      latex: 'A = \\begin{pmatrix} \\frac{1}{n} & \\cdots & \\frac{1}{n} \\\\ \\vdots & \\ddots & \\vdots \\\\ \\frac{1}{n} & \\cdots & \\frac{1}{n} \\end{pmatrix}, \\quad \\text{rank}(A) = 1',
      displayMode: true
    },
    {
      name: '6. 对齐环境（块级）',
      latex: '\\begin{aligned} \\nabla \\cdot \\vec{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\ \\nabla \\cdot \\vec{B} &= 0 \\\\ \\nabla \\times \\vec{E} &= -\\frac{\\partial \\vec{B}}{\\partial t} \\\\ \\nabla \\times \\vec{B} &= \\mu_0 \\vec{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\vec{E}}{\\partial t} \\end{aligned}',
      displayMode: true
    },
    {
      name: '7. 箭头 + 上标 + 文字注释（行内）',
      latex: '\\xrightarrow{\\text{Fourier}} \\hat{f}(\\omega)',
      displayMode: false
    },
    {
      name: '7. 箭头 + 上标 + 文字注释（块级）',
      latex: 'X_n \\xrightarrow[n \\to \\infty]{\\text{a.s.}} X \\quad \\text{and} \\quad \\mathbb{E}[X_n] \\to \\mathbb{E}[X]',
      displayMode: true
    },
    {
      name: '8. 多层括号 + 自动尺寸（行内）',
      latex: '\\left( \\frac{a}{b} \\right)^{\\left( \\frac{c}{d} \\right)}',
      displayMode: false
    },
    {
      name: '8. 多层括号 + 自动尺寸（块级）',
      latex: '\\left[ \\left( \\frac{\\sum_{i=1}^{n} a_i}{\\prod_{j=1}^{m} b_j} \\right)^{\\frac{1}{k}} \\right]',
      displayMode: true
    },
    {
      name: '9. 特殊符号 + 黑板体 + 花体（行内）',
      latex: '\\mathbb{R} \\subseteq \\mathbb{C},\\; \\forall x \\in \\mathbb{R}',
      displayMode: false
    },
    {
      name: '9. 特殊符号 + 黑板体 + 花体（块级）',
      latex: '\\mathcal{L}(\\theta) = \\mathbb{E}_{x \\sim \\mathcal{D}} \\left[ \\log p_\\theta(x) \\right]',
      displayMode: true
    },
    {
      name: '10. 混合文本 + 数学（行内）',
      latex: '\\text{loss} = \\frac{1}{N}\\sum_{i=1}^{N} (y_i - \\hat{y}_i)^2',
      displayMode: false
    },
    {
      name: '10. 混合文本 + 数学（块级）',
      latex: '\\text{Accuracy} = \\frac{\\text{Number of correct predictions}}{\\text{Total number of samples}}',
      displayMode: true
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`测试: ${testCase.name}`);
      console.log(`LaTeX: ${testCase.latex}`);
      const omml = await latexToOMML(testCase.latex, { displayMode: testCase.displayMode });
      console.log(`OMML 长度: ${omml.length} 字符`);
      console.log(`✅ 成功\n`);
    } catch (error) {
      console.error(`❌ 失败: ${error.message}\n`);
    }
  }

  // 测试错误处理
  console.log('测试错误处理...\n');
  
  try {
    await latexToOMML('');
    console.error('❌ 应该抛出空字符串错误');
  } catch (error) {
    console.log(`✅ 正确捕获空字符串错误: ${error.message}\n`);
  }

  try {
    await latexToOMML(123);
    console.error('❌ 应该抛出类型错误');
  } catch (error) {
    console.log(`✅ 正确捕获类型错误: ${error.message}\n`);
  }

  console.log('测试完成！');
}

runTests().catch(console.error);


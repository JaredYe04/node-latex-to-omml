const { latexToOMML } = require('./index');

async function runTests() {
  console.log('开始测试...\n');

  const testCases = [
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


// pages/ability/ability.js
import * as echarts from '../../miniprogram/ec-canvas/echarts';

function initRadarChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr 
  });
  canvas.setChart(chart);

  const option = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '专业知识', max: 100 },
        { name: '技能匹配', max: 100 },
        { name: '语言表达', max: 100 },
        { name: '逻辑思维', max: 100 },
        { name: '创新能力', max: 100 }
      ],
      radius: '60%' // 关键：让雷达图占满容器（可按需调百分比/具体数值）
    },
    series: [{
      name: '能力雷达',
      type: 'radar',
      data: [
        {
          value: [80, 70, 85, 75, 60],
          name: '评分'
        }
      ]
    }]
  };

  chart.setOption(option);
  return chart;
}

Page({
  data: {
    ec: {
      onInit: initRadarChart
    },
    // 替换图标字符为图片路径（需确保图片存在于对应目录）
    abilities: [
      { 
        icon: '/images/knowledge.png', // 专业知识图标
        title: '专业知识水平', 
        progress: '80%', 
        suggestion: '建议定期学习行业前沿技术，参与专业认证考试提升竞争力' 
      },
      { 
        icon: '/images/skills.png', // 技能匹配图标
        title: '技能匹配度', 
        progress: '70%', 
        suggestion: '针对目标岗位需求，系统学习Axure、SQL等工具技能，增加实战项目经验' 
      },
      { 
        icon: '/images/speech.png', // 语言表达图标
        title: '语言表达能力', 
        progress: '85%', 
        suggestion: '保持公众演讲练习，学习结构化表达方法，提升技术方案讲解逻辑性' 
      },
      { 
        icon: '/images/logic.png', // 逻辑思维图标
        title: '逻辑思维能力', 
        progress: '75%', 
        suggestion: '通过流程图绘制、需求拆解练习强化逻辑链，学习SWOT分析等方法论' 
      },
      { 
        icon: '/images/innovation.png', // 创新能力图标
        title: '创新能力', 
        progress: '60%', 
        suggestion: '培养用户需求洞察习惯，定期参与头脑风暴，学习设计思维创新方法' 
      }
    ],
    summarySuggestions: [
      '制定季度技能提升计划，结合岗位JD明确能力短板',
      '参与开源项目或企业实习，将理论知识转化为实战经验',
      '定期复盘项目成果，形成可复用的方法论文档'
    ],
    userInfo: {
      avatarUrl: '/images/touxiang.png' // 用户头像路径
    }
  },

  // 图片加载失败时的回调（显示默认图标）
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const abilities = this.data.abilities;
    // 示例：加载失败时显示默认图标
    abilities[index].icon = '/images/touxiang.png';
    this.setData({ abilities });
  }
})
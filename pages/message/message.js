Page({
    data: {
      title: '报告库',
      matchList: [
        { jobName: "互联网产品经理", tagImg: "/images/yuyin.png", date: "2025.6.23", matchRate: "匹配度:86.6%", id: 1 },
        { jobName: "高级前端开发工程师", tagImg: "/images/yuyin.png", date: "2025.6.22", matchRate: "匹配度:92.3%", id: 2 },
        { jobName: "算法工程师", tagImg: "/images/yuyin.png", date: "2025.6.21", matchRate: "匹配度:78.5%", id: 3 },
        { jobName: "数据分析师", tagImg: "/images/yuyin.png", date: "2025.6.20", matchRate: "匹配度:81.9%", id: 4 },
        { jobName: "UI设计师", tagImg: "/images/yuyin.png", date: "2025.6.19", matchRate: "匹配度:75.2%", id: 5 },
        { jobName: "人力资源经理", tagImg: "/images/yuyin.png", date: "2025.6.18", matchRate: "匹配度:68.7%", id: 6 }
      ],
    },
  
    onLoad() {
        const processedList = this.data.matchList.map(item => ({
          ...item,
          matchValue: item.matchRate.split(':')[1] // 提取“86.6%”
        }));
        this.setData({ matchList: processedList });
      },
  
    // 点击职位项跳转到详情页
    goToDetail(e) {
      const index = e.currentTarget.dataset.index; // 获取点击的职位索引
      const jobItem = this.data.matchList[index];   // 获取职位数据
      
      // 方式1：通过URL参数传递职位ID（推荐，适合真实项目）
      wx.navigateTo({
        url: `/pages/seeing/seeing?id=${jobItem.id}`
      });
    },
  });
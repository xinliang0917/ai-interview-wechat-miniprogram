Page({
    data: {
      currentQuestion: 1,
      totalQuestions: 16,
      progressWidth: 0,
      countdown: '24:00:00', // 初始24小时倒计时
    },
  
    onLoad() {
      this.updateProgress();
      this.start24hCountdown(); // 启动24小时倒计时
    },
  
    // 进度条更新
    updateProgress() {
      const width = (this.data.currentQuestion / this.data.totalQuestions) * 100;
      this.setData({ progressWidth: width  + '%'});
    },
  
    // 24小时倒计时核心逻辑
    start24hCountdown() {
      let totalSeconds = 24 * 60 * 60; // 24小时总秒数
      const timer = setInterval(() => {
        totalSeconds--;
        if (totalSeconds < 0) {
          clearInterval(timer);
          return;
        }
        // 格式化时间：时:分:秒
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        this.setData({
          countdown: `${hours}:${minutes}:${seconds}`
        });
      }, 1000);
    },
  
    // 上一题
    prevQuestion() {
      if (this.data.currentQuestion === 1) {
        wx.showToast({ title: '已是第一题', icon: 'none' });
        return;
      }
      this.setData({ currentQuestion: this.data.currentQuestion - 1 }, () => {
        this.updateProgress();
      });
    },
  
    // 下一题
    nextQuestion() {
      if (this.data.currentQuestion === this.data.totalQuestions) {
        wx.showToast({ title: '已是最后一题', icon: 'none' });
        return;
      }
      this.setData({ currentQuestion: this.data.currentQuestion + 1 }, () => {
        this.updateProgress();
      });
    },
  
    // 上传文件（演示）
    // uploadFile() {
    //   wx.showToast({ title: '文件上传触发', icon: 'none' });
    // },
    // 上传文件（支持任意类型文件）
uploadFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'all', // 支持所有文件类型
      success: res => {
        const file = res.tempFiles[0];
        console.log('选择的文件:', file);
  
        wx.uploadFile({
          url: 'https://your-server/upload', // 你自己的文件上传服务器地址
          filePath: file.path,
          name: 'file', // 后端接收字段名
          formData: {
            // 这里可以加额外信息，如 userId、token 等
            user: 'demo-user'
          },
          success: uploadRes => {
            console.log('上传成功:', uploadRes);
            wx.showToast({ title: '上传成功', icon: 'success' });
          },
          fail: err => {
            console.error('上传失败:', err);
            wx.showToast({ title: '上传失败', icon: 'none' });
          }
        });
      },
      fail: err => {
        console.error('选择文件失败:', err);
        wx.showToast({ title: '选择文件失败', icon: 'none' });
      }
    });
  }
  });
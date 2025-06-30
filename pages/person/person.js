// page.js - 页面逻辑代码
Page({
    data: {
      title: "我的",
      name: '',
      baseInfos: ['', '', ''], // 学历、年龄、院校
      analysisCount: 0,
      doneCount: 0,
      expectation: '',
      advantage: '',
      awards: ['', ''],
      educations: ['', ''],
      works: ['', ''],
      userInfo: {},
      isLoggedIn: false, // 用户是否已登录
      userId: null, // 用户唯一标识
      isLoading: false // 加载状态
    },
  
    onLoad() {
      this.checkLoginStatus();
    },
  
    onShow() {
      // 页面显示时再次检查登录状态，处理可能的登出情况
      this.checkLoginStatus();
    },
  
    // 检查登录状态
    checkLoginStatus() {
      const app = getApp();
      const userInfo = wx.getStorageSync('userInfo');
      
      if (userInfo && userInfo.openId) {
        // 用户已登录，获取用户信息和简历数据
        this.setData({
          isLoggedIn: true,
          userInfo: userInfo,
          userId: userInfo.openId
        });
        
        this.loadResumeData();
      } else {
        // 用户未登录，跳转到登录页
        this.setData({ isLoggedIn: false });
        // this.navigateToLogin();
      }
    },
  
    // 加载简历数据（优先从数据库加载，再本地缓存）
    loadResumeData() {
      const app = getApp();
      const userId = this.data.userId;
      
      if (!userId) return;
      
      this.setData({ isLoading: true });
      
      app.loadResumeDataFromDB(userId).then(resumeData => {
        // 如果数据库有数据，使用数据库数据
        if (Object.keys(resumeData).length > 0) {
          this.setData(resumeData);
          wx.setStorageSync('resumeData', resumeData); // 同时保存到本地缓存
        } else {
          // 数据库无数据，尝试从本地缓存加载
          try {
            const localData = wx.getStorageSync('resumeData');
            if (localData) {
              this.setData(localData);
            }
          } catch (e) {
            console.error('加载本地简历数据失败', e);
          }
        }
        
        // 计算已完成字段数
        this.calculateProgress();
        this.setData({ isLoading: false });
      });
    },
  
    // 计算进度
    calculateProgress() {
      const { name, baseInfos, expectation, advantage, awards, educations, works } = this.data;
      const filledFields = [
        name,
        ...baseInfos,
        expectation,
        advantage,
        ...awards,
        ...educations,
        ...works
      ].filter(value => value && value.trim() !== '').length;
      
      this.setData({ doneCount: filledFields });
    },
  
    // 各种输入框的变更处理函数（保持不变）
    onNameChange(e) {
      this.setData({ name: e.detail.value });
    },
  
    onBaseInfoChange(e) {
      const index = e.currentTarget.dataset.index;
      const value = e.detail.value;
      const baseInfos = this.data.baseInfos;
      baseInfos[index] = value;
      this.setData({ baseInfos });
    },
  
    onExpectationChange(e) {
      this.setData({ expectation: e.detail.value });
    },
  
    onAdvantageChange(e) {
      this.setData({ advantage: e.detail.value });
    },
  
    onAwardChange(e) {
      const index = e.currentTarget.dataset.index;
      const value = e.detail.value;
      const awards = this.data.awards;
      awards[index] = value;
      this.setData({ awards });
    },
  
    onEducationChange(e) {
      const index = e.currentTarget.dataset.index;
      const value = e.detail.value;
      const educations = this.data.educations;
      educations[index] = value;
      this.setData({ educations });
    },
  
    onWorkChange(e) {
      const index = e.currentTarget.dataset.index;
      const value = e.detail.value;
      const works = this.data.works;
      works[index] = value;
      this.setData({ works });
    },
  
    chooseAvatar() {
      wx.chooseAvatar({
        success: (res) => {
          const userInfo = this.data.userInfo;
          userInfo.avatarUrl = res.avatarUrl;
          this.setData({ userInfo });
          wx.setStorageSync('userInfo', userInfo);
        }
      });
    },
  
    // 添加各种项目的函数（保持不变）
    addAward() {
      const awards = this.data.awards;
      awards.push('');
      this.setData({ awards });
    },
  
    addEducation() {
      const educations = this.data.educations;
      educations.push('');
      this.setData({ educations });
    },
  
    addWork() {
      const works = this.data.works;
      works.push('');
      this.setData({ works });
    },
  
    // 保存简历到数据库
    saveResume() {
      if (!this.data.isLoggedIn) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }
      
      this.setData({ isLoading: true });
      
      // 构建简历数据对象
      const resumeData = {
        name: this.data.name,
        baseInfos: this.data.baseInfos,
        expectation: this.data.expectation,
        advantage: this.data.advantage,
        awards: this.data.awards.filter(item => item.trim() !== ''),
        educations: this.data.educations.filter(item => item.trim() !== ''),
        works: this.data.works.filter(item => item.trim() !== '')
      };
      
      const app = getApp();
      const userId = this.data.userId;
      
      app.saveResumeDataToDB(userId, resumeData).then(success => {
        this.setData({ isLoading: false });
        
        if (success) {
          // 保存到数据库成功后，也保存到本地缓存
          wx.setStorageSync('resumeData', resumeData);
          
          // 计算并更新进度
          this.calculateProgress();
          
          wx.showToast({ title: '保存成功', icon: 'success' });
        } else {
          wx.showToast({ title: '保存失败，请重试', icon: 'error' });
        }
      }).catch(err => {
        this.setData({ isLoading: false });
        console.error('保存简历数据出错', err);
        wx.showToast({ title: '保存失败，请重试', icon: 'error' });
      });
    },
  
    // 登出功能实现
    handleLogout() {
      wx.showModal({
        title: '确认登出',
        content: '确定要退出当前账号吗？',
        success: (res) => {
          if (res.confirm) {
            this.doLogout();
          }
        }
      });
    },
  
    // 执行登出操作
    doLogout() {
      const app = getApp();
      this.setData({ isLoading: true });
      
      // 清除本地存储的用户信息和简历数据
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('resumeData');
      
      // 更新页面状态
      this.setData({
        isLoggedIn: false,
        userInfo: {},
        userId: null,
        name: '',
        baseInfos: ['', '', ''],
        expectation: '',
        advantage: '',
        awards: ['', ''],
        educations: ['', ''],
        works: ['', '']
      }, () => {
        // 跳转到登录页
        this.navigateToLogin();
        this.setData({ isLoading: false});
      });
    },
  
    // 跳转到登录页
    navigateToLogin() {
      // 判断当前页面是否为tabBar页面
      const isTabBarPage = getCurrentPages().some(page => 
        page.route.includes('person') // 根据实际情况修改
      );
      
      if (isTabBarPage) {
        // 是tabBar页面，使用switchTab
        wx.switchTab({
          url: '/pages/home/home',
          fail: () => {
            // 备选方案：使用navigateTo
            wx.navigateTo({ url: '/pages/home/home' });
          }
        });
      } else {
        // 不是tabBar页面，使用navigateTo
        wx.navigateTo({ url: '/pages/home/home' });
      }
    }
  });
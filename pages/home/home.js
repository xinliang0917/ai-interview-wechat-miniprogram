const app = getApp();
Page({
  data: {
    title:'AI面试',
    navBarHeight: app.globalData.navBarHeight,
    //   isLoggedIn: false,      // 用户是否已登录
    //   showMask: true,         // 控制遮罩层显示
      isLoggedIn: true,      // 用户已登录
      showMask: false,         // 屏蔽遮罩层
      loginApi: '',           // 动态获取的登录API
      loading: false          // 加载状态
    },
  
    onLoad() {
      // 检查是否已登录
      this.checkLoginStatus();
      
      // 获取当前登录API配置
      this.getLoginApiConfig();
    },
  
    onShow() {
      // 页面显示时再次检查登录状态
      this.checkLoginStatus();
    },
  
    // 检查登录状态
    checkLoginStatus() {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ 
          isLoggedIn: true, 
          showMask: false 
        });
      }
    },
  
    // 获取登录API配置（动态获取）
    getLoginApiConfig() {
      // 优先从本地存储获取API配置
      const apiConfig = wx.getStorageSync('apiConfig');
      if (apiConfig && apiConfig.loginApi && Date.now() - apiConfig.timestamp < 24*60*60*1000) {
        // 本地有有效配置
        this.setData({
          loginApi: apiConfig.loginApi
        });
        return;
      }
      
      // 从服务器获取API配置
      wx.request({
        url: 'https://your-config-api.com/getLoginApi', // 替换为实际的配置API
        success: (res) => {
          if (res.data.code === 0 && res.data.data.loginApi) {
            this.setData({
              loginApi: res.data.data.loginApi
            });
            // 保存到本地存储，24小时有效期
            wx.setStorageSync('apiConfig', {
              loginApi: res.data.data.loginApi,
              timestamp: Date.now()
            });
          } else {
            console.error('获取登录API失败，使用默认API');
            this.setData({
              loginApi: 'https://your-api.com/login' // 默认API
            });
          }
        },
        fail: (err) => {
          console.error('获取登录API请求失败，使用默认API', err);
          this.setData({
            loginApi: 'https://your-api.com/login' // 默认API
          });
        }
      });
    },
  
    // 微信快捷登录（处理用户授权）
    onGetUserInfo(e) {
      if (!e.detail.userInfo) {
        // 用户拒绝授权
        wx.showToast({
          title: '登录需要授权',
          icon: 'none'
        });
        return;
      }
      
      this.setData({ loading: true });
      
      // 获取用户信息
      const userInfo = e.detail.userInfo;
      
      // 调用 wx.login 获取 code
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            // 发送 code 和用户信息到服务器
            this.loginToServer(loginRes.code, userInfo);
          } else {
            this.setData({ loading: false });
            wx.showToast({
              title: '获取登录凭证失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          this.setData({ loading: false });
          wx.showToast({
            title: '登录调用失败：' + err.errMsg,
            icon: 'none'
          });
        }
      });
    },
  
    // 登录到服务器
    loginToServer(code, userInfo) {
      const loginApi = this.data.loginApi;
      
      wx.request({
        url: loginApi,
        method: 'POST',
        data: {
          code: code,
          userInfo: userInfo
        },
        success: (res) => {
          this.setData({ loading: false });
          
          if (res.data.code === 0) {
            // 登录成功
            const userData = res.data.data;
            
            // 保存用户信息到本地存储
            wx.setStorageSync('userInfo', {
              openId: userData.openId,
              avatarUrl: userInfo.avatarUrl,
              nickName: userInfo.nickName,
              // 可添加更多用户信息
            });
            
            // 更新登录状态
            this.setData({ 
              isLoggedIn: true, 
              showMask: false 
            });
            
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            });
          } else {
            // 登录失败
            wx.showToast({
              title: res.data.msg || '登录失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          this.setData({ loading: false });
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          console.error('登录请求失败', err);
        }
      });
    },
  
    // 跳转到下一页
    gotoNextPage() {
      if (this.data.isLoggedIn) {
        // 已登录，跳转到相应页面
        wx.navigateTo({
          url: '/pages/report/report' // 替换为实际的页面路径
        });
      } else {
        // 未登录，提示用户先登录
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
      }
    }
  });
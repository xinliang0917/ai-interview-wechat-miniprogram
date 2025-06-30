// app.js - 微信小程序全局配置
// 在app.js中获取系统信息
App({
  onLaunch() {
    wx.getSystemInfo({
      success: res => {
        this.globalData.statusBarHeight = res.statusBarHeight
        this.globalData.navBarHeight = res.statusBarHeight + 44
      }
    })
      // 修改此处：调用正确的方法名
      this.loadResumeDataFromDB()
        .then(() => {
          console.log("简历数据加载完成");
        })
        .catch(err => {
          console.error("加载简历数据失败", err);
        });
        
      this.initCloudEnv();
    },
    
    // 初始化云开发环境
    initCloudEnv() {
      try {
        wx.cloud.init({
          env: "yunkaifa1hao-1gxvzzba5f70215f", // 替换为你的云开发环境ID
          traceUser: true
        });
        
        // 初始化云数据库引用
        this.globalData.db = wx.cloud.database();
        this.globalData.resumeCollection = this.globalData.db.collection('resumes');
        console.log("云开发环境初始化成功");
      } catch (e) {
        console.error("云开发环境初始化失败", e);
      }
    },
    
    // 从数据库加载简历数据
    loadResumeDataFromDB() {
      const app = this;
      return new Promise((resolve, reject) => {
        // 获取用户ID（假设已经登录）
        const userId = wx.getStorageSync('userId');
        if (!userId) {
          console.log("用户未登录，无法加载数据库中的简历数据");
          return resolve();
        }
        
        app.globalData.resumeCollection.where({
          userId: userId
        }).get({
          success: res => {
            if (res.data.length > 0) {
              // 从数据库加载成功
              const resumeData = res.data[0].data;
              app.globalData.resumeData = resumeData;
              wx.setStorageSync('resumeData', resumeData); // 同步到本地存储
              resolve(resumeData);
            } else {
              // 数据库中没有数据，使用本地存储（如果有）
              const localData = wx.getStorageSync('resumeData');
              if (localData) {
                app.globalData.resumeData = localData;
              }
              resolve(localData || {});
            }
          },
          fail: err => {
            console.error("从数据库加载简历数据失败", err);
            // 尝试从本地存储加载
            const localData = wx.getStorageSync('resumeData');
            if (localData) {
              app.globalData.resumeData = localData;
            }
            resolve(localData || {});
          }
        });
      });
    },
    
    // 保存简历数据到数据库
    saveResumeDataToDB(userId, data) {
      const app = this;
      return new Promise((resolve, reject) => {
        if (!userId) return reject(new Error("用户ID不存在"));
        
        app.globalData.resumeCollection.where({
          userId: userId
        }).get({
          success: res => {
            if (res.data.length > 0) {
              // 更新现有记录
              app.globalData.resumeCollection.doc(res.data[0]._id).update({
                data: {
                  data: data,
                  updatedAt: app.globalData.db.serverDate()
                },
                success: () => {
                  console.log("更新简历数据成功");
                  resolve(true);
                },
                fail: err => {
                  console.error("更新简历数据失败", err);
                  resolve(false);
                }
              });
            } else {
              // 创建新记录
              app.globalData.resumeCollection.add({
                data: {
                  userId: userId,
                  data: data,
                  createdAt: app.globalData.db.serverDate(),
                  updatedAt: app.globalData.db.serverDate()
                },
                success: () => {
                  console.log("创建简历数据成功");
                  resolve(true);
                },
                fail: err => {
                  console.error("创建简历数据失败", err);
                  resolve(false);
                }
              });
            }
          },
          fail: err => {
            console.error("查询简历数据失败", err);
            resolve(false);
          }
        });
      });
    },
    
    globalData: {
      db: null,
      resumeCollection: null,
      resumeData: {},
      userInfo: null,
      isLoggedIn: false
    }
  });
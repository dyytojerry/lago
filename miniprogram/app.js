/**
 * 丁家乐园 - 微信小程序入口文件
 */

App({
  /**
   * 小程序初始化
   */
  onLaunch(options) {
    console.log('丁家乐园小程序启动', options);
    
    // 检查更新
    this.checkForUpdate();
    
    // 初始化全局数据
    this.initGlobalData();
  },

  /**
   * 小程序显示
   */
  onShow(options) {
    console.log('丁家乐园小程序显示', options);
  },

  /**
   * 小程序隐藏
   */
  onHide() {
    console.log('丁家乐园小程序隐藏');
  },

  /**
   * 小程序错误
   */
  onError(error) {
    console.error('丁家乐园小程序错误:', error);
  },

  /**
   * 页面不存在
   */
  onPageNotFound(res) {
    console.log('页面不存在:', res);
    // 重定向到首页
    wx.redirectTo({
      url: '/pages/webview/webview'
    });
  },

  /**
   * 检查小程序更新
   */
  checkForUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        console.log('检查更新结果:', res.hasUpdate);
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(() => {
        console.log('新版本下载失败');
      });
    }
  },

  /**
   * 初始化全局数据
   */
  initGlobalData() {
    this.globalData = {
      userInfo: null,
      hasLogin: false,
      systemInfo: null,
      version: '1.0.0'
    };

    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.log('系统信息:', res);
      }
    });
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo);
        return;
      }

      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.globalData.userInfo = res.userInfo;
          this.globalData.hasLogin = true;
          resolve(res.userInfo);
        },
        fail: (error) => {
          console.error('获取用户信息失败:', error);
          reject(error);
        }
      });
    });
  },

  /**
   * 登录
   */
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            console.log('登录成功，code:', res.code);
            resolve(res.code);
          } else {
            reject(new Error('登录失败'));
          }
        },
        fail: (error) => {
          console.error('登录失败:', error);
          reject(error);
        }
      });
    });
  },

  /**
   * 显示加载提示
   */
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  /**
   * 隐藏加载提示
   */
  hideLoading() {
    wx.hideLoading();
  },

  /**
   * 显示消息提示
   */
  showToast(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration
    });
  },

  /**
   * 显示模态对话框
   */
  showModal(title, content, showCancel = true) {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        content: content,
        showCancel: showCancel,
        success: (res) => {
          resolve(res);
        }
      });
    });
  }
});

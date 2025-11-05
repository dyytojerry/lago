/**
 * 微信小程序 WebView 页面
 * 用于嵌套 Next.js 应用
 */

Page({
  data: {
    webviewUrl: '',
    loading: true,
    error: false,
    errorMessage: '',
    shareData: null,
    pendingShareRequest: null
  },

  onLoad(options) {
    console.log('WebView 页面加载，参数:', options);
    
    // 获取要加载的 URL
    const url = options.url || this.getDefaultUrl();
    const encodedUrl = decodeURIComponent(url);
    
    this.setData({
      webviewUrl: encodedUrl,
      loading: false
    });

    // 监听 WebView 消息
    this.setupWebViewCommunication();
  },

  onShow() {
    console.log('WebView 页面显示');
    
    // 如果有待处理的分享请求，通知 Web 更新分享数据
    if (this.pendingShareRequest) {
      const request = this.pendingShareRequest;
      this.pendingShareRequest = null;
      
      // 通过重新加载 URL 参数或使用其他方式通知 Web
      // 由于小程序限制，我们只能通过 URL 参数传递
      // 实际实现中，Web 应该监听页面显示并主动请求分享数据
    }
  },

  onHide() {
    console.log('WebView 页面隐藏');
  },

  /**
   * 获取默认的 WebView URL
   */
  getDefaultUrl() {
    // 开发环境使用本地服务（用户端应用端口 3002）
    const isDev = wx.getAccountInfoSync().miniProgram.envVersion === 'develop';
    
    if (isDev) {
      return 'http://localhost:3002';
    }
    
    // 生产环境使用部署的服务器
    // TODO: 替换为实际的生产环境 URL
    return 'https://app.lago.example.com';
  },

  /**
   * 设置 WebView 通信
   */
  setupWebViewCommunication() {
    // 监听来自 WebView 的消息
    wx.onMessage((message) => {
      console.log('收到 WebView 消息:', message);
      this.handleWebViewMessage(message);
    });
  },

  /**
   * 处理来自 WebView 的消息
   */
  handleWebViewMessage(message) {
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      
      switch (data.type) {
        case 'navigate':
          this.handleNavigation(data);
          break;
        case 'share':
          this.handleShare(data);
          break;
        case 'setTitle':
          this.handleSetTitle(data);
          break;
        case 'login':
          this.handleLogin(data);
          break;
        case 'getUserInfo':
          this.getUserInfo();
          break;
        default:
          console.log('未知消息类型:', data.type);
      }
    } catch (error) {
      console.error('处理 WebView 消息失败:', error);
    }
  },

  /**
   * 处理导航请求
   */
  handleNavigation(data) {
    const { page, params } = data;
    
    wx.navigateTo({
      url: `/pages/${page}/index?${new URLSearchParams(params).toString()}`
    });
  },

  /**
   * 处理分享请求
   */
  handleShare(data) {
    const { title, desc, path, imageUrl } = data;
    
    // 设置分享内容
    this.setData({
      shareData: {
        title: title || '来购',
        desc: desc || '社区化二手与租赁平台',
        path: path || '/pages/webview/webview',
        imageUrl: imageUrl || '/images/share-logo.png'
      }
    });
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  /**
   * 请求分享数据
   */
  requestShareData(shareType) {
    // 如果有缓存的分享数据，直接返回
    if (this.data.shareData) {
      return this.data.shareData;
    }

    // 向 WebView 发送请求分享数据的消息
    // 注意：小程序无法直接向 WebView 发送消息，需要通过其他方式
    // 这里我们使用一个延迟机制，让 Web 主动设置分享数据
    // 如果 Web 没有及时响应，使用默认数据
    return null;
  },

  /**
   * 处理登录请求
   */
  handleLogin(data) {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 将登录码发送给 WebView
          this.sendMessageToWebView({
            type: 'loginSuccess',
            code: res.code
          });
        }
      },
      fail: (error) => {
        console.error('登录失败:', error);
        this.sendMessageToWebView({
          type: 'loginError',
          error: error.errMsg
        });
      }
    });
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.sendMessageToWebView({
          type: 'userInfo',
          userInfo: res.userInfo
        });
      },
      fail: (error) => {
        console.error('获取用户信息失败:', error);
        this.sendMessageToWebView({
          type: 'userInfoError',
          error: error.errMsg
        });
      }
    });
  },

  /**
   * 向 WebView 发送消息
   */
  sendMessageToWebView(message) {
    // 注意：小程序无法直接向 WebView 发送消息
    // 需要通过 URL 参数或其他方式传递数据
    console.log('发送消息到 WebView:', message);
  },

  /**
   * WebView 加载完成
   */
  onWebViewLoad() {
    console.log('WebView 加载完成');
    this.setData({
      loading: false
    });
  },

  /**
   * WebView 加载错误
   */
  onWebViewError(e) {
    console.error('WebView 加载错误:', e);
    this.setData({
      loading: false,
      error: true,
      errorMessage: '页面加载失败，请检查网络连接'
    });
  },

  /**
   * 刷新 WebView
   */
  refreshWebView() {
    this.setData({
      loading: true,
      error: false,
      errorMessage: ''
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 处理设置标题请求
   */
  handleSetTitle(data) {
    const { title } = data;
    if (title) {
      wx.setNavigationBarTitle({
        title: title
      });
    }
  },

  /**
   * 分享配置 - 分享给好友
   */
  onShareAppMessage(options) {
    const shareData = this.data.shareData;
    
    // 如果 Web 已经设置了分享数据，使用它
    if (shareData) {
      return {
        title: shareData.title || '来购',
        path: shareData.path || '/pages/webview/webview',
        imageUrl: shareData.imageUrl || '/images/share-logo.png'
      };
    }

    // 否则，向 Web 发送请求获取分享数据
    // 由于 onShareAppMessage 需要同步返回，我们使用一个 Promise 机制
    // 但微信小程序不支持异步，所以我们需要在页面加载时预加载分享数据
    // 这里返回默认数据，同时向 Web 发送消息请求更新
    this.requestShareFromWeb('appMessage', options);
    
    return {
      title: '来购',
      path: '/pages/webview/webview',
      imageUrl: '/images/share-logo.png'
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline(options) {
    const shareData = this.data.shareData;
    
    // 如果 Web 已经设置了分享数据，使用它
    if (shareData) {
      return {
        title: shareData.title || '来购',
        imageUrl: shareData.imageUrl || '/images/share-logo.png'
      };
    }

    // 向 Web 发送请求获取分享数据
    this.requestShareFromWeb('timeline', options);
    
    return {
      title: '来购 - 社区化二手与租赁平台',
      imageUrl: '/images/share-logo.png'
    };
  },

  /**
   * 向 Web 请求分享数据
   */
  requestShareFromWeb(shareType, options) {
    // 由于小程序无法直接向 WebView 发送消息
    // 我们需要通过 URL 参数或其他方式通知 Web
    // 这里我们使用一个全局变量或者在页面 onShow 时处理
    console.log('请求分享数据:', shareType, options);
    
    // 设置一个标记，让 Web 知道需要更新分享数据
    this.pendingShareRequest = {
      type: shareType,
      options: options,
      timestamp: Date.now()
    };
  },
});

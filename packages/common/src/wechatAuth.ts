/**
 * 微信授权登录工具函数
 */

export interface WechatUserInfo {
  openid: string;
  nickname: string;
  headimgurl?: string;
  sex?: number;
  city?: string;
  province?: string;
  country?: string;
}

/**
 * 微信网页授权登录
 * 注意：这需要配置微信公众号的网页授权域名
 */
export class WechatAuth {
  private static readonly APP_ID = process.env.NEXT_PUBLIC_WECHAT_APP_ID || '';
  
  /**
   * 获取微信授权URL
   * @param redirectUri 授权后的回调地址
   * @param state 状态参数，用于防止CSRF攻击
   */
  static getAuthUrl(redirectUri: string, state?: string): string {
    const baseUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    const params = new URLSearchParams({
      appid: this.APP_ID,
      redirect_uri: encodeURIComponent(redirectUri),
      response_type: 'code',
      scope: 'snsapi_userinfo', // 获取用户信息
      state: state || 'wechat_auth'
    });
    
    return `${baseUrl}?${params.toString()}#wechat_redirect`;
  }
  
  /**
   * 处理微信授权回调
   * @param url 当前页面URL
   */
  static handleCallback(url: string): { code: string; state: string } | null {
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const state = urlObj.searchParams.get('state');
    
    if (code && state === 'wechat_auth') {
      return { code, state };
    }
    
    return null;
  }
  
  /**
   * 模拟微信授权（用于开发环境）
   * 在生产环境中，应该通过微信服务器获取真实的用户信息
   */
  static async mockWechatAuth(): Promise<WechatUserInfo> {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 生成模拟的openid
    const openid = `mock_openid_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      openid,
      nickname: `微信用户${Math.floor(Math.random() * 1000)}`,
      headimgurl: 'https://via.placeholder.com/100x100?text=微信头像',
      sex: Math.floor(Math.random() * 2) + 1, // 1-男，2-女
      city: '深圳',
      province: '广东',
      country: '中国'
    };
  }
  
  /**
   * 检查是否在微信浏览器中
   */
  static isWechatBrowser(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('micromessenger');
  }
  
  /**
   * 启动微信授权登录
   * @param onSuccess 成功回调
   * @param onError 错误回调
   */
  static async startAuth(
    onSuccess: (userInfo: WechatUserInfo) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      // 检查是否有AppId配置
      if (!this.APP_ID) {
        throw new Error('微信AppId未配置，请设置NEXT_PUBLIC_WECHAT_APP_ID环境变量');
      }
      
      // 检查是否在微信浏览器中
      if (this.isWechatBrowser()) {
        // 在微信浏览器中，直接跳转到授权页面
        const currentUrl = window.location.href;
        const callbackUrl = `${window.location.origin}/auth/wechat-callback?returnUrl=${encodeURIComponent(currentUrl)}`;
        const authUrl = this.getAuthUrl(callbackUrl);
        
        // 重定向到微信授权页面
        window.location.href = authUrl;
      } else {
        // 不在微信浏览器中，打开微信授权二维码页面
        const currentUrl = window.location.href;
        const qrPageUrl = `${window.location.origin}/auth/wechat-qr?returnUrl=${encodeURIComponent(currentUrl)}`;
        
        // 在新窗口中打开微信授权二维码页面
        const authWindow = window.open(
          qrPageUrl,
          'wechat_auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        if (!authWindow) {
          throw new Error('无法打开授权窗口，请检查浏览器弹窗设置');
        }
        
        // 监听授权窗口关闭
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            // 窗口关闭，检查是否有授权结果
            this.checkAuthResult(onSuccess, onError);
          }
        }, 1000);
        
        // 监听授权结果
        this.listenForAuthResult(onSuccess, onError);
      }
      
    } catch (error) {
      console.error('微信授权启动失败:', error);
      onError(error instanceof Error ? error.message : '微信授权失败');
    }
  }
  
  /**
   * 处理授权回调页面
   * 这个函数应该在授权回调页面中调用
   */
  static async handleAuthCallback(
    onSuccess: (userInfo: WechatUserInfo) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const callback = this.handleCallback(window.location.href);
      
      if (!callback) {
        throw new Error('无效的授权回调');
      }
      
      // 调用后端API获取微信用户信息
      const userInfo = await this.getWechatUserInfo(callback.code);
      onSuccess(userInfo);
      
    } catch (error) {
      console.error('处理微信授权回调失败:', error);
      onError(error instanceof Error ? error.message : '授权回调处理失败');
    }
  }

  /**
   * 通过微信授权码获取用户信息
   * @param code 微信授权码
   */
  static async getWechatUserInfo(code: string): Promise<WechatUserInfo> {
    try {
      // 调用后端API，通过code获取用户信息
      const response = await fetch('/api/auth/wechat/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          appId: this.APP_ID,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '获取微信用户信息失败');
      }

      return {
        openid: data.openid,
        nickname: data.nickname,
        headimgurl: data.headimgurl,
        sex: data.sex,
        city: data.city,
        province: data.province,
        country: data.country,
      };

    } catch (error) {
      console.error('获取微信用户信息失败:', error);
      
      // 如果API调用失败，在开发环境下使用模拟数据
      if (process.env.NODE_ENV === 'development') {
        console.warn('API调用失败，使用模拟数据');
        return await this.mockWechatAuth();
      }
      
      throw error;
    }
  }

  /**
   * 监听授权结果（用于非微信浏览器环境）
   */
  static listenForAuthResult(
    onSuccess: (userInfo: WechatUserInfo) => void,
    onError: (error: string) => void
  ): void {
    // 监听来自授权窗口的消息
    const handleMessage = (event: MessageEvent) => {
      // 验证消息来源
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'WECHAT_AUTH_SUCCESS') {
        onSuccess(event.data.userInfo);
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'WECHAT_AUTH_ERROR') {
        onError(event.data.error);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // 设置超时，防止无限等待
    setTimeout(() => {
      window.removeEventListener('message', handleMessage);
    }, 300000); // 5分钟超时
  }

  /**
   * 检查授权结果（用于非微信浏览器环境）
   */
  static checkAuthResult(
    onSuccess: (userInfo: WechatUserInfo) => void,
    onError: (error: string) => void
  ): void {
    // 检查localStorage中是否有授权结果
    const authResult = localStorage.getItem('wechat_auth_result');
    if (authResult) {
      try {
        const result = JSON.parse(authResult);
        if (result.success) {
          onSuccess(result.userInfo);
        } else {
          onError(result.error || '授权失败');
        }
        // 清除结果
        localStorage.removeItem('wechat_auth_result');
      } catch (error) {
        console.error('授权结果解析失败:', error);
        onError('授权结果解析失败');
        localStorage.removeItem('wechat_auth_result');
      }
    }
  }
}

/**
 * React Hook for 微信授权登录
 */
export function useWechatAuth() {
  const startAuth = async (
    onSuccess: (userInfo: WechatUserInfo) => void,
    onError: (error: string) => void
  ) => {
    await WechatAuth.startAuth(onSuccess, onError);
  };
  
  const handleCallback = async (
    onSuccess: (userInfo: WechatUserInfo) => void,
    onError: (error: string) => void
  ) => {
    await WechatAuth.handleAuthCallback(onSuccess, onError);
  };
  
  return {
    startAuth,
    handleCallback,
    isWechatBrowser: WechatAuth.isWechatBrowser()
  };
}

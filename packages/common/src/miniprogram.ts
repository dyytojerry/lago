/**
 * 微信小程序 WebView 通信工具
 * 用于与小程序原生功能通信
 */

// 扩展 Window 接口
declare global {
  interface Window {
    wx?: any;
  }
}

// ==================== 环境检测 ====================

/**
 * 检测是否在微信小程序环境中
 * 兼容两种检测方式：window.wx 和 userAgent + wx.miniProgram
 */
export function isInMiniProgram(): boolean {
  if (typeof window === 'undefined') return false;
  
  // 方式1：直接检查 window.wx（适用于某些小程序环境）
  if (typeof window.wx !== 'undefined') {
    return true;
  }
  
  // 方式2：检查 userAgent 和 wx.miniProgram（微信官方方式）
  const ua = navigator.userAgent.toLowerCase();
  const isWeChat = /micromessenger/i.test(ua);
  return isWeChat && typeof (window as any).wx !== 'undefined';
}

/**
 * 兼容旧版本函数名
 * @deprecated 使用 isInMiniProgram() 代替
 */
export function isInMiniprogram(): boolean {
  return isInMiniProgram();
}

/**
 * 检查是否有微信小程序 API
 */
export function hasMiniProgramAPI(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as any).wx !== 'undefined' && 
         typeof (window as any).wx.miniProgram !== 'undefined';
}

// ==================== 消息通信 ====================

/**
 * 小程序通信消息类型
 */
export interface MiniprogramMessage {
  type: 'navigate' | 'share' | 'setTitle' | 'pageLoaded' | 'login' | 'getUserInfo' | 'requestShare';
  data?: any;
}

/**
 * 向小程序发送消息（通过 postMessage）
 * 适用于 window.parent.postMessage 方式
 */
export function sendMessageToMiniprogram(message: MiniprogramMessage): void {
  if (!isInMiniProgram()) {
    console.warn('不在小程序环境中，无法发送消息');
    return;
  }

  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(JSON.stringify(message), '*');
    }
  } catch (error) {
    console.error('发送消息到小程序失败:', error);
  }
}

/**
 * 向小程序发送消息（通过 wx.miniProgram.postMessage）
 * 适用于微信官方 API 方式
 */
export function postMessageToMiniProgram(data: any): void {
  if (!hasMiniProgramAPI()) {
    console.warn('不在微信小程序环境中，无法发送消息');
    return;
  }

  try {
    (window as any).wx.miniProgram.postMessage({
      data: data
    });
    
    // 通知小程序消息已发送
    (window as any).wx.miniProgram.navigateBack();
  } catch (error) {
    console.error('发送消息到小程序失败:', error);
  }
}

/**
 * 监听来自小程序的消息
 */
export function listenMiniprogramMessages(callback: (message: any) => void): () => void {
  if (!isInMiniProgram()) {
    return () => {};
  }

  const handleMessage = (event: MessageEvent) => {
    try {
      const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      callback(message);
    } catch (error) {
      console.error('解析小程序消息失败:', error);
    }
  };

  window.addEventListener('message', handleMessage);
  
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}

/**
 * 兼容旧版本函数名
 */
export function listenMiniProgramMessages(callback: (message: any) => void): () => void {
  return listenMiniprogramMessages(callback);
}

/**
 * 处理来自小程序的消息
 */
function handleMiniProgramMessage(message: any): void {
  console.log('收到小程序消息:', message);

  switch (message.type) {
    case 'requestShare':
      // 小程序请求分享数据
      updateShareData(message.shareType, message.options);
      break;
    default:
      console.log('未知消息类型:', message.type);
  }
}

// ==================== 导航功能 ====================

/**
 * 小程序导航
 */
export function navigateInMiniprogram(page: string, params?: Record<string, any>): void {
  sendMessageToMiniprogram({
    type: 'navigate',
    data: { page, params }
  });
}

// ==================== 分享功能 ====================

/**
 * 设置分享数据
 */
export interface ShareData {
  title: string;
  desc?: string;
  path?: string;
  imageUrl: string;
}

/**
 * 小程序分享（通过 postMessage 方式）
 */
export function shareInMiniprogram(shareData: {
  title: string;
  desc?: string;
  path?: string;
  imageUrl?: string;
}): void {
  sendMessageToMiniprogram({
    type: 'share',
    data: shareData
  });
}

/**
 * 设置小程序分享数据（通过 wx.miniProgram.postMessage 方式）
 */
export function setShareData(shareData: ShareData): void {
  if (!hasMiniProgramAPI()) {
    console.warn('不在微信小程序环境中，无法设置分享数据');
    return;
  }

  postMessageToMiniProgram({
    type: 'share',
    title: shareData.title,
    desc: shareData.desc || shareData.title,
    path: shareData.path || '/pages/webview/webview',
    imageUrl: shareData.imageUrl
  });
}

/**
 * 请求分享数据（从后端获取）
 */
export async function requestShareData(
  shareType: 'appMessage' | 'timeline',
  options?: {
    from?: string;
    target?: string;
    [key: string]: any;
  }
): Promise<ShareData | null> {
  try {
    // 获取当前页面路径和参数
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const fullPath = currentPath + currentSearch;

    // 调用后端 API 获取分享数据
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_URL}/api/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: shareType,
        path: fullPath,
        options: options
      })
    });

    if (!response.ok) {
      throw new Error('获取分享数据失败');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求分享数据失败:', error);
    return null;
  }
}

/**
 * 更新分享数据
 */
async function updateShareData(
  shareType?: 'appMessage' | 'timeline',
  options?: any
): Promise<void> {
  if (!hasMiniProgramAPI()) {
    return;
  }

  // 如果没有指定分享类型，默认获取两种类型
  const types: Array<'appMessage' | 'timeline'> = shareType 
    ? [shareType] 
    : ['appMessage', 'timeline'];

  for (const type of types) {
    try {
      const shareData = await requestShareData(type, options);
      
      if (shareData) {
        setShareData(shareData);
      } else {
        // 使用默认分享数据
        setShareData({
          title: '来购 - 社区化二手与租赁平台',
          desc: '发现身边的优质商品，轻松租售',
          path: '/pages/webview/webview',
          imageUrl: '/images/share-logo.png'
        });
      }
    } catch (error) {
      console.error(`获取${type}分享数据失败:`, error);
    }
  }
}

// ==================== 页面标题 ====================

/**
 * 设置小程序页面标题
 */
export function setMiniprogramTitle(title: string): void {
  if (isInMiniProgram()) {
    // 设置document.title
    document.title = title;
    
    // 通知小程序更新标题（通过 postMessage）
    sendMessageToMiniprogram({
      type: 'setTitle',
      data: { title }
    });
  } else {
    // 普通web环境
    document.title = title;
  }
}

// ==================== 用户信息 ====================

/**
 * 获取小程序用户信息
 */
export function getMiniprogramUserInfo(): void {
  sendMessageToMiniprogram({
    type: 'getUserInfo'
  });
}

// ==================== 登录功能 ====================

/**
 * 小程序登录
 */
export function loginInMiniprogram(): void {
  sendMessageToMiniprogram({
    type: 'login'
  });
}

// ==================== 页面加载 ====================

/**
 * 页面加载完成通知
 */
export function notifyPageLoaded(title?: string, url?: string): void {
  if (isInMiniProgram()) {
    sendMessageToMiniprogram({
      type: 'pageLoaded',
      data: {
        title: title || document.title,
        url: url || window.location.href,
        timestamp: Date.now()
      }
    });
  }
}

// ==================== 初始化 ====================

/**
 * 小程序环境初始化
 * 禁用右键菜单、文本选择、长按菜单等
 */
export function initMiniprogramEnvironment(): void {
  if (!isInMiniProgram()) {
    return;
  }

  // 禁用右键菜单
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 禁用文本选择
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
  });

  // 禁用长按菜单
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  });

  // 通知页面加载完成
  notifyPageLoaded();
}

/**
 * 初始化小程序通信
 * 监听消息、自动更新分享数据等
 */
export function initMiniProgramCommunication(): void {
  if (!isInMiniProgram()) {
    return;
  }

  console.log('初始化微信小程序通信');

  // 监听小程序返回的消息
  window.addEventListener('message', (event) => {
    // 小程序会通过 postMessage 发送消息
    if (event.data && event.data.type) {
      handleMiniProgramMessage(event.data);
    }
  });

  // 页面加载时，主动获取并设置分享数据
  if (typeof window !== 'undefined') {
    // 延迟一下，确保页面内容已加载
    setTimeout(() => {
      updateShareData();
    }, 1000);
  }

  // 监听路由变化，更新分享数据
  if (typeof window !== 'undefined') {
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        updateShareData();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

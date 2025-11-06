/**
 * 微信小程序 WebView 通信工具
 * 用于与小程序原生功能通信
 */

// 检测是否在微信小程序 WebView 中
export function isInMiniProgram(): boolean {
  if (typeof window === 'undefined') return false;
  
  // 检查是否在微信环境中
  const ua = navigator.userAgent.toLowerCase();
  const isWeChat = /micromessenger/i.test(ua);
  
  // 检查是否有微信小程序的 API
  return isWeChat && typeof (window as any).wx !== 'undefined';
}

// 检查是否有微信小程序 API
export function hasMiniProgramAPI(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as any).wx !== 'undefined' && 
         typeof (window as any).wx.miniProgram !== 'undefined';
}

/**
 * 向小程序发送消息
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
 * 设置分享数据
 */
export interface ShareData {
  title: string;
  desc?: string;
  path?: string;
  imageUrl: string;
}

/**
 * 设置小程序分享数据
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
 * 初始化小程序通信
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


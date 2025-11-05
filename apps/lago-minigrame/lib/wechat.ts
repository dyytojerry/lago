// 微信小程序API封装

// 微信登录
export async function wxLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    // @ts-ignore - 微信小程序API
    wx.login({
      success: (res: any) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error('微信登录失败'));
        }
      },
      fail: (err: any) => {
        reject(err);
      },
    });
  });
}

// 获取用户信息
export async function wxGetUserInfo(): Promise<any> {
  return new Promise((resolve, reject) => {
    // @ts-ignore - 微信小程序API
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res: any) => {
        resolve(res.userInfo);
      },
      fail: (err: any) => {
        reject(err);
      },
    });
  });
}

// 获取手机号
export async function wxGetPhoneNumber(e: any): Promise<string> {
  return new Promise((resolve, reject) => {
    // 需要调用后端API解密手机号
    // 这里返回code，由后端处理
    if (e.detail.code) {
      resolve(e.detail.code);
    } else {
      reject(new Error('获取手机号失败'));
    }
  });
}


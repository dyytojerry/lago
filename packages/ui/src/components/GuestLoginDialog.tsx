"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, LogIn, X } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import LoginMethod from "./LoginMethod";
import toast from "react-hot-toast";

interface GuestLoginDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function GuestLoginDialog({
  isOpen,
  onClose,
}: GuestLoginDialogProps) {
  const [showLoginMethod, setShowLoginMethod] = useState(false);
  const [isGuestLoggingIn, setIsGuestLoggingIn] = useState(false);
  const { login } = useAuth();

  // 生成设备唯一ID
  const generateDeviceId = (): string => {
    // 尝试从localStorage获取已有的设备ID
    let deviceId = localStorage.getItem("deviceId");

    if (!deviceId) {
      // 收集设备特征信息
      const deviceFingerprint = generateDeviceFingerprint();
      deviceId = `guest_${deviceFingerprint}`;
      localStorage.setItem("deviceId", deviceId);
    }

    return deviceId;
  };

  // 生成设备指纹
  const generateDeviceFingerprint = (): string => {
    // 基础设备信息（最稳定的特征）
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const screenResolution = `${screen.width}x${screen.height}`;
    const colorDepth = screen.colorDepth.toString();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 硬件信息
    const hardwareInfo = [
      navigator.hardwareConcurrency?.toString() || "unknown",
      navigator.maxTouchPoints?.toString() || "0",
      window.devicePixelRatio?.toString() || "1",
      (navigator as any).deviceMemory?.toString() || "unknown",
      screen.availWidth?.toString() || "unknown",
      screen.availHeight?.toString() || "unknown",
    ].join("|");

    // Canvas指纹（简化版）
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let canvasFingerprint = "";
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprint", 2, 2);
      canvasFingerprint = canvas.toDataURL().substring(0, 100); // 只取前100个字符
    }

    // WebGL基础信息（简化版）
    let webglInfo = "";
    try {
      const gl =
        canvas.getContext("webgl") ||
        (canvas.getContext(
          "experimental-webgl"
        ) as WebGLRenderingContext | null);
      if (gl) {
        const vendor = gl.getParameter(gl.VENDOR) || "";
        const renderer = gl.getParameter(gl.RENDERER) || "";
        webglInfo = `${vendor}_${renderer}`.substring(0, 50);
      }
    } catch (e) {
      // 忽略WebGL错误，使用默认值
      webglInfo = "no_webgl";
    }

    // 组合所有特征（移除已弃用的platform和plugins）
    const fingerprintData = [
      userAgent,
      language,
      screenResolution,
      timezone,
      colorDepth,
      hardwareInfo,
      canvasFingerprint,
      webglInfo,
    ].join("|");

    // 生成哈希值
    return hashString(fingerprintData);
  };

  // 简单的字符串哈希函数
  const hashString = (str: string): string => {
    let hash = 0;
    if (str.length === 0) return hash.toString();

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // 转换为36进制并添加时间戳确保唯一性
    const timestamp = Date.now().toString(36);
    const hashStr = Math.abs(hash).toString(36);

    return `${hashStr}_${timestamp}`;
  };

  // 游客身份登录
  const handleGuestLogin = async () => {
    try {
      setIsGuestLoggingIn(true);

      const deviceId = generateDeviceId();

      // 调用登录接口，使用设备ID作为微信OpenID
      await login(
        {
          password: deviceId,
          nickname: "游客" + deviceId.split('_').pop(),
        },
        onClose
      );
    } catch (error: any) {
      console.error("游客登录失败:", error);
      toast.error(error.message || "游客登录失败，请重试");
    } finally {
      setIsGuestLoggingIn(false);
    }
  };

  const [account, setAccount] = useState<any>({});

  // 处理已有账号登录
  const handleExistingAccountLogin = async (loginData: any) => {
    await login(loginData, onClose);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md border border-neutral-200"
          >
            {!showLoginMethod ? (
              // 选择登录方式
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-700">
                    请先登录
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-neutral-600 hover:text-neutral-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 游客身份登录 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGuestLogin}
                    disabled={isGuestLoggingIn}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary-500 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-neutral-100 rounded-lg group-hover:bg-primary-50 transition-colors">
                        <User className="w-5 h-5 text-neutral-600 group-hover:text-primary-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-neutral-700">
                          游客身份登录
                        </div>
                        <div className="text-sm text-text-secondary">
                          快速体验，无需注册
                        </div>
                      </div>
                    </div>
                    {isGuestLoggingIn && (
                      <div className="mt-2 text-xs text-primary-coral">
                        正在登录...
                      </div>
                    )}
                  </motion.button>

                  {/* 已有账号登录 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLoginMethod(true)}
                    className="w-full p-4 rounded-xl border-2 border-solid border-gray-300 hover:border-primary-coral transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-primary-coral/10 transition-colors">
                        <LogIn className="w-5 h-5 text-gray-600 group-hover:text-primary-coral" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-text-primary">
                          已有账号登录
                        </div>
                        <div className="text-sm text-text-secondary">
                          使用手机号、邮箱等方式登录
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </div>

                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Users className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <div className="font-medium">提示</div>
                      <div>
                        游客身份登录后，您可以选择创建家庭或加入已有家庭来体验完整功能。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 已有账号登录表单
              <div>
                <LoginMethod
                  onClose={() => setShowLoginMethod(false)}
                  onSubmit={handleExistingAccountLogin}
                  onChange={setAccount}
                  account={account}
                  titleClassName="text-xl font-bold"
                  quickLogin={true}
                />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

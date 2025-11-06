// WebSocket Provider 组件
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useWebSocketChat, type WebSocketHook } from "../hooks/useWebSocket";
import { useAuth } from "./AuthProvider";
import { toast } from "react-hot-toast";

// WebSocket Context
const WebSocketContext = createContext<WebSocketHook | null>(null);

// WebSocket Provider Props
interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  // 初始化 WebSocket
  const wsHook = useWebSocketChat({
    autoConnect: !!user,
    reconnectAttempts: 5,
    reconnectDelay: 2000,
    heartbeatInterval: 30000,
  });

  const { subscribe, isConnected } = wsHook;

  // 处理实时通知
  useEffect(() => {
    if (!isConnected) return;

    // 订阅任务通知
    const unsubscribeTask = subscribe("task_notification", (data) => {
      const { action, taskTitle, fromUserRole } = data;

      let message = "";
      switch (action) {
        case "created":
          message = `${
            fromUserRole === "parent" ? "家长" : "孩子"
          }创建了新任务: ${taskTitle}`;
          break;
        case "completed":
          message = `任务已完成: ${taskTitle}`;
          break;
        case "approved":
          message = `任务已通过审核: ${taskTitle}`;
          break;
        case "rejected":
          message = `任务被拒绝: ${taskTitle}`;
          break;
        default:
          message = `任务更新: ${taskTitle}`;
      }

      toast.success(message, {
        duration: 4000,
        position: "top-right",
      });

      setNotifications((prev) => [...prev, { ...data, id: Date.now() }]);
    });

    // 订阅存钱宝更新
    const unsubscribePiggyBank = subscribe("piggybank_update", (data) => {
      const { action, amount } = data;

      let message = "";
      switch (action) {
        case "deposit":
          message = `存钱宝存入 ¥${amount}`;
          break;
        case "withdraw":
          message = `存钱宝取出 ¥${amount}`;
          break;
        case "goal_reached":
          message = "🎉 储蓄目标达成！";
          break;
        default:
          message = "存钱宝有更新";
      }

      toast.success(message, {
        duration: 4000,
        position: "top-right",
        icon: "💰",
      });

      setNotifications((prev) => [...prev, { ...data, id: Date.now() }]);
    });

    // 订阅奖励通知
    const unsubscribeReward = subscribe("reward_notification", (data) => {
      const { rewardType, amount, reason } = data;

      let message = "";
      let icon = "🎉";

      switch (rewardType) {
        case "points":
          message = `获得积分奖励 +${amount}`;
          icon = "⭐";
          break;
        case "money":
          message = `获得现金奖励 ¥${amount}`;
          icon = "💰";
          break;
        case "badge":
          message = `获得新徽章: ${reason}`;
          icon = "🏆";
          break;
        default:
          message = `获得奖励 +${amount}`;
      }

      toast.success(message, {
        duration: 3000,
        position: "top-right",
        icon,
      });

      setNotifications((prev) => [...prev, { ...data, id: Date.now() }]);
    });

    // 订阅日程提醒
    const unsubscribeSchedule = subscribe("schedule_reminder", (data) => {
      const { title } = data;

      toast(`📅 日程提醒: ${title}`, {
        duration: 6000,
        position: "top-right",
      });

      setNotifications((prev) => [...prev, { ...data, id: Date.now() }]);
    });

    // 订阅实时聊天
    const unsubscribeChat = subscribe("real_time_chat", (data) => {
      const { message, fromUserRole } = data;

      toast(`💬 ${fromUserRole === "parent" ? "家长" : "孩子"}: ${message}`, {
        duration: 4000,
        position: "top-right",
      });

      setNotifications((prev) => [...prev, { ...data, id: Date.now() }]);
    });

    // 订阅在线状态
    const unsubscribeStats = subscribe("online_stats", (data) => {
      console.log("📊 在线状态更新:", data);
      // 这里可以更新全局状态或显示在线用户数
    });

    // 返回清理函数
    return () => {
      unsubscribeTask();
      unsubscribePiggyBank();
      unsubscribeReward();
      unsubscribeSchedule();
      unsubscribeChat();
      unsubscribeStats();
    };
  }, [isConnected, subscribe]);

  // 显示连接状态变化
  useEffect(() => {
    if (isConnected) {
      toast.success("🔗 实时连接已建立", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  }, [isConnected]);

  // 扩展的 WebSocket Hook，添加通知功能
  const extendedWsHook = {
    ...wsHook,
    notifications,
    clearNotifications: () => setNotifications([]),

    // 便捷方法：发送不同类型的消息
    sendTaskNotification: (
      targetUserId: string,
      taskId: string,
      action: string,
      taskTitle: string
    ) => {
      return wsHook.send({
        type: "task_notification",
        data: { targetUserId, taskId, action, taskTitle },
      });
    },

    sendPiggyBankUpdate: (
      targetUserId: string,
      piggyBankId: string,
      action: string,
      amount: number
    ) => {
      return wsHook.send({
        type: "piggybank_update",
        data: { targetUserId, piggyBankId, action, amount },
      });
    },

    sendRewardNotification: (
      targetUserId: string,
      rewardType: string,
      amount: number,
      reason: string
    ) => {
      return wsHook.send({
        type: "reward_notification",
        data: { targetUserId, rewardType, amount, reason },
      });
    },

    sendChatMessage: (
      targetUserId: string,
      message: string,
      messageType = "text"
    ) => {
      return wsHook.send({
        type: "real_time_chat",
        data: { targetUserId, message, messageType },
      });
    },

    sendScheduleReminder: (
      targetUserId: string,
      scheduleId: string,
      title: string,
      reminderTime: string
    ) => {
      return wsHook.send({
        type: "schedule_reminder",
        data: { targetUserId, scheduleId, title, reminderTime },
      });
    },
  };

  return (
    <WebSocketContext.Provider value={extendedWsHook}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook 来使用 WebSocket Context
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext 必须在 WebSocketProvider 内使用");
  }
  return context;
}

// 实时通知组件
export function RealTimeNotifications() {
  const { isConnected, error } = useWebSocketContext();

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
        连接错误: {error}
      </div>
    );
  }

  return (
    <div className="fixed right-4 z-50" style={{ bottom: "90px" }}>
      <div
        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isConnected
            ? "bg-green-100 text-green-700 border border-green-200"
            : "bg-gray-100 text-gray-700 border border-gray-200"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span>{isConnected ? "实时连接" : "离线"}</span>
      </div>
    </div>
  );
}

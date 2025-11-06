"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useNavigationRouter } from "./NavigationLink";
import GuestLoginDialog from "./GuestLoginDialog";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "parent" | "child";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isLoggedIn, isLoading, user } = useAuth();
  const router = useNavigationRouter();
  const [showGuestLogin, setShowGuestLogin] = useState(false);

  useEffect(() => {
    if (isLoading === false && !isLoggedIn) {
      // 不再自动跳转到登录页，而是显示游客登录对话框
      setShowGuestLogin(true);
    }
  }, [isLoggedIn, isLoading]);

  useEffect(() => {
    if (
      !isLoading &&
      isLoggedIn &&
      requiredRole &&
      user?.role !== requiredRole
    ) {
      router.push("/");
    }
  }, [isLoggedIn, isLoading, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-coral mx-auto mb-4"></div>
          <p className="text-text-secondary">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary">请先登录</p>
          </div>
        </div>
        <GuestLoginDialog
          isOpen={showGuestLogin}
          onClose={() => setShowGuestLogin(false)}
        />
      </>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">您没有权限访问此页面</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import {
  StorageManager,
  defaultRequestOptions,
  HTTPResponse,
  redirectToLogin,
  setFamilyId,
} from "@lago/common";
import { useAudio } from "../hooks/useAudio";

export const setRequestOptions = (
  authRefresh: (
    data: { refreshToken: string },
    noAuthorize?: boolean
  ) => Promise<HTTPResponse<any>>,
  storage: StorageManager
) => {
  defaultRequestOptions.fallback = async (
    statusCode: number,
    retry: () => Promise<any>
  ) => {
    if (statusCode === 401) {
      redirectToLogin();
    } else if (statusCode === 422) {
      const refreshToken = await storage.getItem<string>("refreshToken");
      if (refreshToken) {
        return authRefresh(
          {
            refreshToken,
          },
          true
        ).then(async (res) => {
          if (res.data) {
            // Update tokens in storage
            await storage.setItem("authToken", res.data.accessToken);
            await storage.setItem("refreshToken", res.data.refreshToken);

            return retry();
          } else {
            redirectToLogin();
            throw new Error("Authentication required. Please log in again.");
          }
        });
      } else {
        redirectToLogin();
        throw new Error("Authentication required. Please log in again.");
      }
    }
  };
  defaultRequestOptions.storage = storage;
};

interface AuthResponse<T = any> {
  user: T;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType<T = any> {
  user?: T;
  updateUser: (user: T) => void;
  setUser: (user: T) => void;
  login: (loginData: any, onSuccess?: () => void) => Promise<void>;
  logout: (onSuccess?: () => void) => void;
  isLoading: boolean;
  token?: string | null;
  isLoggedIn: boolean;
  audio: ReturnType<typeof useAudio>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  authApi,
  prefix,
  name = "user",
}: {
  children: ReactNode;
  authApi: any;
  prefix: string;
  name?: string;
}) {
  const { authMe, authLogin, authLogout, authRefresh } = authApi;
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const audio = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const storage = useMemo(() => {
    const storage = new StorageManager("lago_" + prefix);
    setRequestOptions(authRefresh, storage);
    return storage;
  }, []);

  const onceRef = useRef<boolean>();

  const handleAuth = useCallback(
    async (auth: AuthResponse | null, onSuccess?: () => void) => {
      if (auth) {
        await storage.setItem("authToken", auth.accessToken);
        await storage.setItem("refreshToken", auth.refreshToken);
        setAuth({ ...auth, user: auth[name as keyof AuthResponse] } as any);
        if (location.pathname.endsWith("/login")) {
          toast.success("登录成功！");
        }
        if (onSuccess) {
          onSuccess();
        } else {
          setTimeout(() => {
            const searchParams = new URLSearchParams(location.search);
            const pathname =
              searchParams.get("callback_url") ||
              (location.pathname.endsWith("/login") ? "/" : "");
            if (pathname) {
              location.href = pathname;
            }
          }, 1000);
        }
      } else {
        await storage.removeItem("authToken");
        await storage.removeItem("refreshToken");
        setAuth(null);
      }
      setIsLoading(false);
    },
    []
  );

  useEffect(() => {
    // Check for existing token on mount
    const checkToken = async () => {
      const hasToken = await storage.hasItem("authToken");
      let promise: Promise<HTTPResponse<any>>;
      if (hasToken) {
        // Verify token and get user data
        promise = authMe(true);
      } else {
        promise = authMe(true);
      }

      // Verify token and get user data
      promise.then(
        async (res) => {
          if (res.data) {
            handleAuth(res.data as AuthResponse);
          } else {
            handleAuth(null);
          }
        },
        async (error) => {
          console.error("Failed to fetch user profile:", error);
          handleAuth(null);
        }
      );
    };
    if (!onceRef.current) {
      onceRef.current = true;
      checkToken();
    }
  }, []);

  const login = async (loginData: any, onSuccess?: () => void) => {
    try {
      setIsLoading(true);
      return authLogin(loginData, true).then(
        async (res: any) => {
          if (res.data) {
            handleAuth(res.data as AuthResponse, onSuccess);
          } else {
            handleAuth(null);
            throw new Error(res.error || "登录失败");
          }
        },
        async (err: Error) => {
          handleAuth(null);
          console.error("登录失败:", err);
          throw err;
        }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
      throw error;
    }
  };

  const logout = async (onSuccess?: () => void) => {
    // 清理父级上下文标记
    await storage.removeItem("authToken");
    await storage.removeItem("refreshToken");
    await storage.removeItem("parent_context");
    await authLogout();
    handleAuth(null);
    toast.success("已退出登录");
    if (onSuccess) {
      onSuccess();
    } else {
      location.reload();
    }
  };
  const updateUser = (user: any) => {
    if (auth) {
      setAuth({ ...auth, user: { ...auth.user, ...user } });
    }
  };

  const value = {
    user: auth?.user,
    updateUser,
    setUser: updateUser,
    login,
    logout,
    audio,
    isLoading,
    isLoggedIn: !!auth?.user,
    token: auth && auth.accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

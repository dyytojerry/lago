"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useNavigationRouter } from "@/components/NavigationLink";
import toast from "react-hot-toast";
import { storage } from "@/lib/storage";
import {
  authMe,
  authLogin,
  AuthLoginDTO,
  authRefresh,
  publicAllDictionaries,
  usePetUser,
  authLogout,
  AuthMeResponse,
  pets,
  petUserCreate,
} from "@/lib/apis";
import * as Types from "@/lib/apis/types";
import {
  defaultRequestOptions,
  HTTPResponse,
  redirectToLogin,
  setFamilyId,
} from "@/lib/api-request";
import { userSwitchToChild, userSwitchToParent } from "@/lib/apis/users";
import { setLoadingEmoji, removeLoadingEmoji } from "./LoadingProvider";
import { useAudio } from "@/hooks/useAudio";
import { useRouter } from "next/navigation";

defaultRequestOptions.fallback = async (statusCode, retry) => {
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

interface AuthResponse {
  user: Types.User;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user?: Types.User;
  updateUser: (user: Types.User) => void;
  login: (loginData: AuthLoginDTO, onSuccess?: () => void) => Promise<void>;
  logout: (onSuccess?: () => void) => void;
  switchToChild: (childId: string) => Promise<void>;
  switchToParent: () => Promise<void>;
  isLoading: boolean;
  token?: string | null;
  isLoggedIn: boolean;
  hasParentContext: boolean;
  allDictionaries: Record<Types.DictionaryType, undefined | Types.Dictionary[]>;
  pet?: Types.Pet & { coverImage?: string };
  setPetCover: (coverImage: string) => void;
  audio: ReturnType<typeof useAudio>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<(AuthResponse & { pet?: any }) | null>(null);
  const audio = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const { data: petData } = usePetUser({ enabled: !!auth?.user } as any);
  const [hasParentContext, setHasParentContext] = useState(false);
  const [allDictionaries, setAllDictionaries] = useState(
    {} as Record<Types.DictionaryType, Types.Dictionary[]>
  );
  const router = useRouter();
  const onceRef = useRef<boolean>();
  if (petData?.data?.pet) {
    setLoadingEmoji(petData?.data?.pet?.emoji);
  } else {
    removeLoadingEmoji();
  }

  const handleAuth = useCallback(
    async (auth: AuthResponse | null, onSuccess?: () => void) => {
      if (auth) {
        await storage.setItem("authToken", auth.accessToken);
        await storage.setItem("refreshToken", auth.refreshToken);
        setAuth(auth);
        setFamilyId(auth.user.familyId);
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
              router.push(pathname);
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
      let promise: Promise<HTTPResponse<AuthMeResponse>>;
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
    publicAllDictionaries().then((res) => {
      const allDictionaries = res.data.dictionaries ?? {};
      Object.keys(allDictionaries).forEach((key) => {
        allDictionaries[key as Types.DictionaryType] = allDictionaries[
          key as Types.DictionaryType
        ]?.sort((a, b) => a.content.localeCompare(b.content));
      });
      setAllDictionaries(allDictionaries);
    });
  }, []);

  const login = async (loginData: AuthLoginDTO, onSuccess?: () => void) => {
    try {
      setIsLoading(true);
      return authLogin(loginData, true).then(
        async (res) => {
          if (res.data) {
            handleAuth(res.data as AuthResponse, onSuccess);
          } else {
            handleAuth(null);
            throw new Error(res.error || "登录失败");
          }
        },
        async (err) => {
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
    setHasParentContext(false);
    handleAuth(null);
    toast.success("已退出登录");
    if (onSuccess) {
      onSuccess();
    } else {
      location.reload();
      // redirectToLogin();
    }
  };

  const switchToChild = async (childId: string) => {
    try {
      setIsLoading(true);
      const response = await userSwitchToChild({ childId });

      if (response.data) {
        // 保存父级上下文
        await storage.setItem("parent_context", {
          parentId: response.data.originalParent?.id,
          parentNickname: response.data.originalParent?.nickname,
        });
        setHasParentContext(true);

        // 更新认证状态
        await handleAuth({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        toast.success(`已切换到 ${response.data.user.nickname} 的视角`);
      } else {
        throw new Error("切换失败");
      }
    } catch (error) {
      console.error("Switch to child failed:", error);
      toast.error("切换到儿童视角失败");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchToParent = async () => {
    try {
      setIsLoading(true);
      const response = await userSwitchToParent();

      if (response.data) {
        // 清理父级上下文
        await storage.removeItem("parent_context");
        setHasParentContext(false);

        // 更新认证状态
        await handleAuth({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        toast.success(`已切换回家长视角`);
      } else {
        throw new Error("切换失败");
      }
    } catch (error) {
      console.error("Switch to parent failed:", error);
      toast.error("切换回家长视角失败");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 检查父级上下文
  useEffect(() => {
    const checkParentContext = async () => {
      if (auth?.user?.role === "child") {
        const context = await storage.getItem("parent_context");
        setHasParentContext(!!context);
      } else if (auth) {
        setHasParentContext(false);
      }
    };
    checkParentContext();
  }, [auth]);

  useEffect(() => {
    if (petData?.data && !petData.data.pet) {
      pets().then((res) => {
        const pet = res.data?.pets?.find((pet) => pet.emoji === "🐷");
        if (pet) {
          setLoadingEmoji(pet?.emoji);
          setAuth({ ...auth, pet });
          petUserCreate({ petId: pet.id });
        }
      });
    }
  }, [petData]);

  const pet = petData?.data?.pet;
  const value = {
    user: auth?.user,
    updateUser: (user: Types.User) => {
      if (auth) {
        setAuth({ ...auth, user: { ...auth.user, ...user } });
      }
    },
    login,
    logout,
    switchToChild,
    switchToParent,
    audio,
    isLoading,
    isLoggedIn: !!auth?.user,
    token: auth && auth.accessToken,
    hasParentContext,
    allDictionaries,
    pet: auth?.pet || pet,
    setPetCover: (coverImage: string) => {
      if (pet) {
        Object.assign(pet, { coverImage });
      }
      setAuth({ ...auth });
    },
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

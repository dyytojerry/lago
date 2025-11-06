"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { PageLoading } from "../components/Loading";

let loadingEmoji =
  typeof window !== "undefined"
    ? localStorage?.getItem("loadingEmoji") || "🛍️"
    : "🛍️";

export function setLoadingEmoji(emoji?: string) {
  if (typeof window === "undefined") {
    return;
  }
  if (emoji) {
    loadingEmoji = emoji;
    localStorage.setItem("loadingEmoji", emoji);
  }
}

export function removeLoadingEmoji(emoji?: string) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem("loadingEmoji");
}

export function getLoadingEmoji() {
  return loadingEmoji;
}

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const startLoading = () => {
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{ isLoading, setLoading, startLoading, stopLoading }}
    >
      {children}
      {isLoading && <PageLoading emoji={loadingEmoji} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

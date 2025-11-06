"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  emoji?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  message = "加载中...",
  emoji = "🐷",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "text-4xl",
    md: "text-6xl",
    lg: "text-8xl",
  };

  const containerClasses = {
    sm: "min-h-32",
    md: "min-h-48",
    lg: "min-h-64",
  };

  return (
    <div
      className={`${containerClasses[size]} flex items-center justify-center`}
    >
      <div className="text-center">
        <motion.div
          className={`${sizeClasses[size]} mb-4 ${className}`}
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {emoji}
        </motion.div>

        <div className="loading-dots mb-4">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <p className="text-lg text-text-secondary font-medium">{message}</p>
      </div>
    </div>
  );
}

export function PageLoading({
  message = "加载中...",
  emoji = "🐷",
}: Omit<LoadingSpinnerProps, "size">) {
  return (
    <div className="fixed top-0 left-0 size-full min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 opacity-80 animate-pulse flex items-center justify-center">
      <LoadingSpinner
        size="lg"
        message={message}
        emoji={emoji}
        className="animate-bounce"
      />
    </div>
  );
}

export function CardLoading({ message = "加载中..." }: { message?: string }) {
  return (
    <div className="card-magic p-8">
      <LoadingSpinner size="sm" message={message} />
    </div>
  );
}

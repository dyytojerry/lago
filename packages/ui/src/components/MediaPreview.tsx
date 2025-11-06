"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface MediaItem {
  url: string;
  type: "image" | "video";
  name?: string;
}

interface MediaPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: MediaItem[];
  initialIndex?: number;
}

export default function MediaPreview({
  isOpen,
  onClose,
  mediaItems,
  initialIndex = 0,
}: MediaPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // 重置状态当组件打开时
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsVideoPlaying(false);
    }
  }, [isOpen, initialIndex]);

  // 处理键盘事件
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case " ":
          e.preventDefault();
          if (mediaItems[currentIndex]?.type === "video") {
            toggleVideoPlay();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, mediaItems]);

  // 处理触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < mediaItems.length - 1) {
      goToNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsVideoPlaying(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < mediaItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleVideoClick = () => {
    toggleVideoPlay();
  };

  const currentMedia = mediaItems[currentIndex];

  if (!isOpen || !currentMedia) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <X size={24} />
        </button>

        {/* 左侧导航按钮 */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* 右侧导航按钮 */}
        {currentIndex < mediaItems.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* 媒体内容 */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentMedia.type === "image" ? (
            <motion.img
              key={currentIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={currentMedia.url}
              alt={currentMedia.name || `图片 ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-full max-h-full"
            >
              <video
                ref={videoRef}
                src={currentMedia.url}
                className="max-w-full max-h-full object-contain"
                onClick={handleVideoClick}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                controls={false}
                loop
                muted
              />
              
              {/* 视频播放控制按钮 */}
              <button
                onClick={handleVideoClick}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
              >
                {!isVideoPlaying && (
                  <div className="p-4 bg-black/50 rounded-full">
                    <Play size={32} className="text-white ml-1" />
                  </div>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* 底部信息栏 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
          <div className="text-xs text-gray-300">
            {currentIndex + 1} / {mediaItems.length}
          </div>
        </div>

        {/* 缩略图导航 */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-2">
            {mediaItems.map((item, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  setIsVideoPlaying(false);
                }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-white"
                    : "border-transparent opacity-60 hover:opacity-80"
                }`}
              >
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt={`缩略图 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Play size={16} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

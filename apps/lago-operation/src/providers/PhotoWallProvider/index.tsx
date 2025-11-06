"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Work,
  CanvasState,
  CanvasActions,
  LayoutType,
} from "@/providers/PhotoWallProvider/photoWall";

interface PhotoWallContextType {
  // 画布状态
  canvasState: CanvasState;
  canvasActions: CanvasActions;

  // 布局状态
  currentLayout: LayoutType;
  setCurrentLayout: (layout: LayoutType) => void;

  // 作品管理
  works: Work[];
  setWorks: (works: Work[]) => void;
  updateWork: (id: string, updates: Partial<Work>) => void;

  // 选择管理
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;

  // 拖拽状态
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;

  // 画布操作方法
  updateZoom: (zoom: number) => void;
  updatePan: (pan: { x: number; y: number }) => void;
}

const PhotoWallContext = createContext<PhotoWallContextType | undefined>(
  undefined
);

interface PhotoWallProviderProps {
  children: ReactNode;
  initialWorks?: Work[];
  initialLayout?: LayoutType;
}

export function PhotoWallProvider({
  children,
  initialWorks = [],
  initialLayout = "masonry",
}: Readonly<PhotoWallProviderProps>) {
  const [works, setWorks] = useState<Work[]>(initialWorks);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(initialLayout);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: 0,
    height: 0,
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedItems: [],
    clipboard: [],
  });

  const updateWork = useCallback((id: string, updates: Partial<Work>) => {
    setWorks((prev) =>
      prev.map((work) => (work.id === id ? { ...work, ...updates } : work))
    );
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const canvasActions: CanvasActions = {
    zoomIn: () => {
      setCanvasState((prev) => ({
        ...prev,
        zoom: Math.min(prev.zoom * 1.2, 3),
      }));
    },
    zoomOut: () => {
      setCanvasState((prev) => ({
        ...prev,
        zoom: Math.max(prev.zoom / 1.2, 0.1),
      }));
    },
    resetView: () => {
      setCanvasState((prev) => ({
        ...prev,
        zoom: 1,
        pan: { x: 0, y: 0 },
      }));
    },
    selectAll: () => {
      setSelectedItems(works.map((work) => work.id));
    },
    copy: () => {
      const selectedWorks = works.filter((work) =>
        selectedItems.includes(work.id)
      );
      setCanvasState((prev) => ({
        ...prev,
        clipboard: selectedWorks,
      }));
    },
    paste: () => {
      // 实现粘贴逻辑
      console.log("Paste functionality to be implemented");
    },
    delete: () => {
      // 实现删除逻辑
      console.log("Delete functionality to be implemented");
    },
  };

  // 扩展的canvas操作方法
  const updateZoom = useCallback((zoom: number) => {
    setCanvasState((prev) => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, zoom)),
    }));
  }, []);

  const updatePan = useCallback((pan: { x: number; y: number }) => {
    setCanvasState((prev) => ({
      ...prev,
      pan,
    }));
  }, []);

  const value: PhotoWallContextType = useMemo(
    () => ({
      canvasState,
      canvasActions,
      currentLayout,
      setCurrentLayout,
      works,
      setWorks,
      updateWork,
      selectedItems,
      setSelectedItems,
      toggleSelection,
      clearSelection,
      isDragging,
      setIsDragging,
      updateZoom,
      updatePan,
    }),
    [
      canvasState,
      canvasActions,
      currentLayout,
      works,
      selectedItems,
      isDragging,
      updateWork,
      toggleSelection,
      clearSelection,
      updateZoom,
      updatePan,
    ]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <PhotoWallContext.Provider value={value}>
        {children}
      </PhotoWallContext.Provider>
    </DndProvider>
  );
}

export function usePhotoWall() {
  const context = useContext(PhotoWallContext);
  if (context === undefined) {
    throw new Error("usePhotoWall must be used within a PhotoWallProvider");
  }
  return context;
}

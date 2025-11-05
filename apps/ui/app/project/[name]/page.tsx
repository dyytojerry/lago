'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface DesignSystemConfig {
  colors?: Record<string, any>;
  fontFamily?: Record<string, any>;
  fontWeight?: Record<string, any>;
  borderRadius?: Record<string, any>;
  boxShadow?: Record<string, any>;
  spacing?: Record<string, any>;
  backgroundImage?: Record<string, any>;
  transitionDuration?: Record<string, any>;
  screens?: Record<string, any>;
}

interface Project {
  name: string;
  displayName: string;
  path: string;
  config: DesignSystemConfig;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectName = params.name as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [editing, setEditing] = useState<DesignSystemConfig | null>(null);
  const [activeTab, setActiveTab] = useState<string>('colors');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<Array<{ name: string; displayName: string }>>([]);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectName}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setEditing(data.config || {});
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching project:', err);
        setLoading(false);
      });
    
    // 获取所有项目列表
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data.map((p: Project) => ({ name: p.name, displayName: p.displayName })));
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
      });
  }, [projectName]);

  const handleSave = async () => {
    if (!editing || !project) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: editing }),
      });

      if (response.ok) {
        alert('配置已保存！');
        // 重新加载项目配置
        const data = await fetch(`/api/projects/${projectName}`).then(res => res.json());
        setProject(data);
        setEditing(data.config || {});
      } else {
        alert('保存失败，请重试');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!editing || !project) return;
    
    try {
      const response = await fetch(`/api/projects/${projectName}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          config: editing, // 传递当前编辑的配置
        }),
      });

      const data = await response.json();
      if (data.success && data.config) {
        await navigator.clipboard.writeText(data.config);
        alert('配置已复制到剪贴板！');
      } else {
        alert('复制失败，请重试');
      }
    } catch (error) {
      console.error('Error copying:', error);
      alert('复制失败，请重试');
    }
  };

  const handleCopyToProject = async (targetProjectName: string) => {
    if (!editing || !project) return;
    
    setCopying(true);
    try {
      const response = await fetch(`/api/projects/${projectName}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          targetProject: targetProjectName,
          config: editing, // 传递当前编辑的配置
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || '配置已复制成功！');
        setShowCopyDialog(false);
      } else {
        alert('复制失败，请重试');
      }
    } catch (error) {
      console.error('Error copying to project:', error);
      alert('复制失败，请重试');
    } finally {
      setCopying(false);
    }
  };

  const updateConfig = (key: string, value: any) => {
    if (!editing) return;
    setEditing({
      ...editing,
      [key]: value,
    });
  };

  const updateNestedConfig = (category: string, subKey: string, value: any) => {
    if (!editing) return;
    setEditing({
      ...editing,
      [category]: {
        ...(editing[category as keyof DesignSystemConfig] || {}),
        [subKey]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">项目未找到</div>
      </div>
    );
  }

  const tabs = [
    { id: 'colors', label: '颜色', icon: '🎨' },
    { id: 'typography', label: '字体', icon: '🔤' },
    { id: 'spacing', label: '间距', icon: '📏' },
    { id: 'borderRadius', label: '圆角', icon: '⭕' },
    { id: 'shadows', label: '阴影', icon: '🌑' },
    { id: 'other', label: '其他', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← 返回项目列表
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{project.displayName}</h1>
            <p className="text-gray-600 mt-1">{project.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCopyDialog(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              复制到项目
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              复制配置
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存更改'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Copy Dialog */}
        {showCopyDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">复制配置到其他项目</h3>
              <div className="space-y-2 mb-4">
                {projects
                  .filter(p => p.name !== projectName)
                  .map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handleCopyToProject(p.name)}
                      disabled={copying}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <div className="font-medium">{p.displayName}</div>
                      <div className="text-sm text-gray-500">{p.name}</div>
                    </button>
                  ))}
              </div>
              <button
                onClick={() => setShowCopyDialog(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'colors' && (
            <ColorsEditor
              colors={editing?.colors}
              onChange={(colors) => updateConfig('colors', colors)}
            />
          )}
          {activeTab === 'typography' && (
            <TypographyEditor
              fontFamily={editing?.fontFamily}
              fontWeight={editing?.fontWeight}
              onFontFamilyChange={(fontFamily) => updateConfig('fontFamily', fontFamily)}
              onFontWeightChange={(fontWeight) => updateConfig('fontWeight', fontWeight)}
            />
          )}
          {activeTab === 'spacing' && (
            <SpacingEditor
              spacing={editing?.spacing}
              onChange={(spacing) => updateConfig('spacing', spacing)}
            />
          )}
          {activeTab === 'borderRadius' && (
            <BorderRadiusEditor
              borderRadius={editing?.borderRadius}
              onChange={(borderRadius) => updateConfig('borderRadius', borderRadius)}
            />
          )}
          {activeTab === 'shadows' && (
            <ShadowsEditor
              boxShadow={editing?.boxShadow}
              onChange={(boxShadow) => updateConfig('boxShadow', boxShadow)}
            />
          )}
          {activeTab === 'other' && (
            <OtherEditor
              config={editing}
              onChange={setEditing}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Color Editor Component
function ColorsEditor({ colors, onChange }: { colors?: Record<string, any>; onChange: (colors: Record<string, any>) => void }) {
  const [localColors, setLocalColors] = useState(colors || {});

  useEffect(() => {
    setLocalColors(colors || {});
  }, [colors]);

  const updateColor = (key: string, value: any) => {
    const newColors = { ...localColors, [key]: value };
    setLocalColors(newColors);
    onChange(newColors);
  };

  const updateColorValue = (colorKey: string, shade: string, value: string) => {
    const colorObj = localColors[colorKey] || {};
    const newColorObj = typeof colorObj === 'object' && !Array.isArray(colorObj)
      ? { ...colorObj, [shade]: value }
      : value;
    updateColor(colorKey, newColorObj);
  };

  const renderColorValue = (colorKey: string, colorValue: any) => {
    if (typeof colorValue === 'string') {
      return (
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded border border-gray-300"
            style={{ backgroundColor: colorValue }}
          />
          <input
            type="text"
            value={colorValue}
            onChange={(e) => updateColor(colorKey, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
        </div>
      );
    }

    if (typeof colorValue === 'object' && colorValue !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(colorValue).map(([shade, value]) => (
            <div key={shade} className="flex items-center gap-3">
              <span className="w-16 text-sm text-gray-600">{shade}:</span>
              <div
                className="w-12 h-12 rounded border border-gray-300"
                style={{ backgroundColor: value as string }}
              />
              <input
                type="text"
                value={value as string}
                onChange={(e) => updateColorValue(colorKey, shade, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">颜色配置</h2>
      {Object.keys(localColors).length === 0 ? (
        <p className="text-gray-500">暂无颜色配置</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(localColors).map(([key, value]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{key}</h3>
              {renderColorValue(key, value)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Typography Editor Component
function TypographyEditor({
  fontFamily,
  fontWeight,
  onFontFamilyChange,
  onFontWeightChange,
}: {
  fontFamily?: Record<string, any>;
  fontWeight?: Record<string, any>;
  onFontFamilyChange: (fontFamily: Record<string, any>) => void;
  onFontWeightChange: (fontWeight: Record<string, any>) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">字体配置</h2>
      
      {fontFamily && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">字体族</h3>
          {Object.entries(fontFamily).map(([key, value]) => (
            <div key={key} className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">{key}</label>
              <input
                type="text"
                value={Array.isArray(value) ? value.join(', ') : String(value)}
                onChange={(e) => {
                  const newValue = e.target.value.split(',').map(v => v.trim());
                  onFontFamilyChange({ ...fontFamily, [key]: newValue });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      )}

      {fontWeight && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">字重</h3>
          {Object.entries(fontWeight).map(([key, value]) => (
            <div key={key} className="mb-3 flex items-center gap-3">
              <label className="w-24 text-sm text-gray-600">{key}:</label>
              <input
                type="text"
                value={String(value)}
                onChange={(e) => {
                  onFontWeightChange({ ...fontWeight, [key]: e.target.value });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Spacing Editor Component
function SpacingEditor({ spacing, onChange }: { spacing?: Record<string, any>; onChange: (spacing: Record<string, any>) => void }) {
  const [localSpacing, setLocalSpacing] = useState(spacing || {});

  useEffect(() => {
    setLocalSpacing(spacing || {});
  }, [spacing]);

  const updateSpacing = (key: string, value: string) => {
    const newSpacing = { ...localSpacing, [key]: value };
    setLocalSpacing(newSpacing);
    onChange(newSpacing);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">间距配置</h2>
      {Object.keys(localSpacing).length === 0 ? (
        <p className="text-gray-500">暂无间距配置</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(localSpacing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <label className="w-32 text-sm text-gray-600">{key}:</label>
              <input
                type="text"
                value={String(value)}
                onChange={(e) => updateSpacing(key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Border Radius Editor Component
function BorderRadiusEditor({
  borderRadius,
  onChange,
}: {
  borderRadius?: Record<string, any>;
  onChange: (borderRadius: Record<string, any>) => void;
}) {
  const [localBorderRadius, setLocalBorderRadius] = useState(borderRadius || {});

  useEffect(() => {
    setLocalBorderRadius(borderRadius || {});
  }, [borderRadius]);

  const updateBorderRadius = (key: string, value: string) => {
    const newBorderRadius = { ...localBorderRadius, [key]: value };
    setLocalBorderRadius(newBorderRadius);
    onChange(newBorderRadius);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">圆角配置</h2>
      {Object.keys(localBorderRadius).length === 0 ? (
        <p className="text-gray-500">暂无圆角配置</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(localBorderRadius).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <label className="w-32 text-sm text-gray-600">{key}:</label>
              <input
                type="text"
                value={String(value)}
                onChange={(e) => updateBorderRadius(key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Shadows Editor Component
function ShadowsEditor({
  boxShadow,
  onChange,
}: {
  boxShadow?: Record<string, any>;
  onChange: (boxShadow: Record<string, any>) => void;
}) {
  const [localShadows, setLocalShadows] = useState(boxShadow || {});

  useEffect(() => {
    setLocalShadows(boxShadow || {});
  }, [boxShadow]);

  const updateShadow = (key: string, value: string) => {
    const newShadows = { ...localShadows, [key]: value };
    setLocalShadows(newShadows);
    onChange(newShadows);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">阴影配置</h2>
      {Object.keys(localShadows).length === 0 ? (
        <p className="text-gray-500">暂无阴影配置</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(localShadows).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3">
              <label className="w-32 text-sm text-gray-600">{key}:</label>
              <input
                type="text"
                value={String(value)}
                onChange={(e) => updateShadow(key, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Other Editor Component
function OtherEditor({
  config,
  onChange,
}: {
  config: DesignSystemConfig | null;
  onChange: (config: DesignSystemConfig) => void;
}) {
  const otherConfigs = ['backgroundImage', 'transitionDuration', 'screens'];
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">其他配置</h2>
      {otherConfigs.map((key) => {
        const value = config?.[key as keyof DesignSystemConfig];
        if (!value) return null;
        
        return (
          <div key={key} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">{key}</h3>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        );
      })}
    </div>
  );
}

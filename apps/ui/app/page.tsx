'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  name: string;
  displayName: string;
  path: string;
  config: any;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lago 设计系统管理器
          </h1>
          <p className="text-gray-600">
            管理和编辑所有前端项目的 Tailwind CSS 设计系统
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.name}
              href={`/project/${project.name}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {project.displayName}
              </h2>
              <p className="text-sm text-gray-500 mb-4">{project.name}</p>
              
              <div className="flex flex-wrap gap-2">
                {project.config?.colors && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    颜色
                  </span>
                )}
                {project.config?.fontFamily && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    字体
                  </span>
                )}
                {project.config?.borderRadius && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    圆角
                  </span>
                )}
                {project.config?.spacing && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    间距
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

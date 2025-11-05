import fs from 'fs';
import path from 'path';

export interface DesignSystemConfig {
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

export interface ProjectConfig {
  name: string;
  path: string;
  configPath: string;
  config: DesignSystemConfig;
}

const PROJECTS = [
  { name: 'lago', path: '../lago', displayName: '白皮书/静态页面' },
  { name: 'lago-app', path: '../lago-app', displayName: '用户端应用' },
  { name: 'lago-operation', path: '../lago-operation', displayName: '运营/管理端' },
];

export function getProjects(): Array<{ name: string; path: string; displayName: string }> {
  return PROJECTS;
}

export function readTailwindConfig(projectPath: string): DesignSystemConfig {
  const configPath = path.resolve(process.cwd(), projectPath, 'tailwind.config.js');
  
  try {
    if (!fs.existsSync(configPath)) {
      return {};
    }

    // 读取配置文件内容
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    // 使用 vm 模块安全地执行配置
    const vm = require('vm');
    const context = {
      module: { exports: {} },
      require: require,
      __dirname: path.dirname(configPath),
      __filename: configPath,
    };
    
    vm.createContext(context);
    vm.runInContext(configContent, context);
    
    const config = context.module.exports as any;
    const theme = config?.theme?.extend || {};
    
    return {
      colors: theme.colors,
      fontFamily: theme.fontFamily,
      fontWeight: theme.fontWeight,
      borderRadius: theme.borderRadius,
      boxShadow: theme.boxShadow,
      spacing: theme.spacing,
      backgroundImage: theme.backgroundImage,
      transitionDuration: theme.transitionDuration,
      screens: theme.screens,
    };
  } catch (error) {
    console.error(`Error reading config for ${projectPath}:`, error);
    return {};
  }
}

export function generateTailwindConfig(designSystem: DesignSystemConfig): string {
  const formatValue = (value: any, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'string') {
      // 转义单引号
      const escaped = value.replace(/'/g, "\\'");
      return `'${escaped}'`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return `[\n${value.map((v) => `${'  '.repeat(indent + 1)}${formatValue(v, indent + 1)}`).join(',\n')}\n${spaces}]`;
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) return '{}';
      return `{\n${entries.map(([k, v]) => {
        // 处理对象键（如果包含特殊字符需要加引号）
        const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k.replace(/'/g, "\\'")}'`;
        return `${'  '.repeat(indent + 1)}${key}: ${formatValue(v, indent + 1)}`;
      }).join(',\n')}\n${spaces}}`;
    }
    return String(value);
  };

  const config = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: designSystem,
    },
    plugins: [],
  };

  return `/** @type {import('tailwindcss').Config} */
module.exports = ${formatValue(config, 0)};
`;
}

export function writeTailwindConfig(projectPath: string, config: string): void {
  const configPath = path.join(process.cwd(), projectPath, 'tailwind.config.js');
  fs.writeFileSync(configPath, config, 'utf-8');
}

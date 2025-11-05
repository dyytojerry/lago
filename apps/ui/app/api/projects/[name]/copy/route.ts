import { NextResponse } from 'next/server';
import { getProjects, readTailwindConfig, generateTailwindConfig, writeTailwindConfig } from '@/lib/design-system';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const { targetProject, config: providedConfig } = body;

    const projects = getProjects();
    const sourceProject = projects.find(p => p.name === name);
    const target = targetProject 
      ? projects.find(p => p.name === targetProject)
      : null;

    if (!sourceProject) {
      return NextResponse.json(
        { error: 'Source project not found' },
        { status: 404 }
      );
    }

    // 如果提供了配置，使用提供的配置；否则读取源项目的配置
    const sourceConfig = providedConfig || readTailwindConfig(sourceProject.path);
    
    // 生成配置字符串
    const configString = generateTailwindConfig(sourceConfig);

    // 如果指定了目标项目，直接写入
    if (target) {
      writeTailwindConfig(target.path, configString);
      return NextResponse.json({ 
        success: true, 
        message: `配置已复制到 ${target.displayName}`,
        config: configString 
      });
    }

    // 否则只返回配置字符串
    return NextResponse.json({ 
      success: true, 
      config: configString 
    });
  } catch (error) {
    console.error('Error copying config:', error);
    return NextResponse.json(
      { error: 'Failed to copy config' },
      { status: 500 }
    );
  }
}

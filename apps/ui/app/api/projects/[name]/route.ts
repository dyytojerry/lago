import { NextResponse } from 'next/server';
import { getProjects, readTailwindConfig, generateTailwindConfig, writeTailwindConfig } from '@/lib/design-system';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const projects = getProjects();
    const project = projects.find(p => p.name === name);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const config = readTailwindConfig(project.path);

    return NextResponse.json({
      ...project,
      config,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const projects = getProjects();
    const project = projects.find(p => p.name === name);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { config } = body;

    const configString = generateTailwindConfig(config);
    writeTailwindConfig(project.path, configString);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

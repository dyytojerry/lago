import { NextResponse } from 'next/server';
import { getProjects, readTailwindConfig } from '@/lib/design-system';

export async function GET() {
  try {
    const projects = getProjects();
    const projectsWithConfig = projects.map(project => ({
      ...project,
      config: readTailwindConfig(project.path),
    }));

    return NextResponse.json(projectsWithConfig);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

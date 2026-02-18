import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

import { ProjectData } from '@/types/store';

const DB_PATH = path.join(process.cwd(), 'data', 'projects.json');

async function ensureDb() {
    const dir = path.dirname(DB_PATH);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.writeFile(DB_PATH, JSON.stringify([]));
    }
}

export async function GET() {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
}

export async function POST(req: Request) {
    await ensureDb();
    const project = await req.json();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const projects: ProjectData[] = JSON.parse(data);
    
    const index = projects.findIndex((p: ProjectData) => p.id === project.id);
    if (index > -1) {
        projects[index] = { ...projects[index], ...project, lastModified: Date.now() };
    } else {
        projects.push({ ...project, lastModified: Date.now() });
    }
    
    await fs.writeFile(DB_PATH, JSON.stringify(projects, null, 2));
    return NextResponse.json({ success: true, project });
}


import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface VideoEditorDB extends DBSchema {
  assets: {
    key: string;
    value: Blob;
  };
  projects: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'video-editor-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<VideoEditorDB>>;

if (typeof window !== 'undefined') {
  dbPromise = openDB<VideoEditorDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets');
      }
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects');
      }
    },
  });
}

export const saveAsset = async (id: string, file: Blob) => {
  const db = await dbPromise;
  await db.put('assets', file, id);
};

export const getAsset = async (id: string): Promise<Blob | undefined> => {
  const db = await dbPromise;
  return db.get('assets', id);
};

export const saveProject = async (project: any) => {
  const db = await dbPromise;
  await db.put('projects', project, project.id);
};

export const getProject = async (id: string) => {
  const db = await dbPromise;
  return db.get('projects', id);
};

export const getAllProjects = async () => {
  const db = await dbPromise;
  return db.getAll('projects');
};

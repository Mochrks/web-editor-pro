import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { ProjectData } from '@/types/store';

interface VideoEditorDB extends DBSchema {
  assets: {
    key: string;
    value: Blob;
  };
  thumbnails: {
    key: string;
    value: string; // Base64 or Blob URL
  };
  projects: {
    key: string;
    value: ProjectData;
  };
  settings: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'video-editor-db';
const DB_VERSION = 2;

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
      if (!db.objectStoreNames.contains('thumbnails')) {
        db.createObjectStore('thumbnails');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
}

// Assets
export const saveAsset = async (id: string, file: Blob) => {
  const db = await dbPromise;
  await db.put('assets', file, id);
};

export const getAsset = async (id: string): Promise<Blob | undefined> => {
  const db = await dbPromise;
  return db.get('assets', id);
};

export const deleteAsset = async (id: string) => {
  const db = await dbPromise;
  await db.delete('assets', id);
};

// Thumbnails
export const saveThumbnail = async (id: string, dataUrl: string) => {
  const db = await dbPromise;
  await db.put('thumbnails', dataUrl, id);
};

export const getThumbnail = async (id: string): Promise<string | undefined> => {
  const db = await dbPromise;
  return db.get('thumbnails', id);
};

// Projects
export const saveProject = async (project: ProjectData) => {
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

export const deleteProject = async (id: string) => {
  const db = await dbPromise;
  await db.delete('projects', id);
};

// Settings
export const saveSetting = async (key: string, value: unknown) => {
  const db = await dbPromise;
  await db.put('settings', value, key);
};

export const getSetting = async (key: string) => {
  const db = await dbPromise;
  return db.get('settings', key);
};

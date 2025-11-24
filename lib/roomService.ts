import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Room, Furniture } from '@/types';

export interface SavedRoomData {
  id: string;
  name: string;
  room: Room;
  furniture: Furniture[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomTemplate {
  id: string;
  name: string;
  room: Room;
  createdAt: Date;
  updatedAt: Date;
}

export interface FurnitureTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}

// Firebaseが設定されているかチェック
const isFirebaseConfigured = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== undefined;
};

// 部屋データを保存
export const saveRoomData = async (
  roomId: string,
  roomName: string,
  room: Room,
  furniture: Furniture[]
): Promise<void> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    const roomData: Omit<SavedRoomData, 'id'> = {
      name: roomName,
      room,
      furniture,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'rooms', roomId), {
      ...roomData,
      createdAt: Timestamp.fromDate(roomData.createdAt),
      updatedAt: Timestamp.fromDate(roomData.updatedAt),
    });
  } catch (error) {
    console.error('部屋データの保存エラー:', error);
    throw error;
  }
};

// 部屋データを読み込み
export const loadRoomData = async (roomId: string): Promise<SavedRoomData | null> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    const docRef = doc(db, 'rooms', roomId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        room: data.room,
        furniture: data.furniture,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error('部屋データの読み込みエラー:', error);
    throw error;
  }
};

// すべての保存された部屋を取得
export const getAllSavedRooms = async (): Promise<SavedRoomData[]> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    const roomsQuery = query(
      collection(db, 'rooms'),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(roomsQuery);
    const rooms: SavedRoomData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      rooms.push({
        id: doc.id,
        name: data.name,
        room: data.room,
        furniture: data.furniture,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return rooms;
  } catch (error) {
    console.error('部屋リストの取得エラー:', error);
    throw error;
  }
};

// 部屋データを削除
export const deleteRoomData = async (roomId: string): Promise<void> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    await deleteDoc(doc(db, 'rooms', roomId));
  } catch (error) {
    console.error('部屋データの削除エラー:', error);
    throw error;
  }
};

// Firebaseが設定されているかチェック
export const checkFirebaseConfig = (): boolean => {
  return isFirebaseConfigured();
};

// 部屋テンプレートを保存
export const saveRoomTemplate = async (
  templateId: string,
  templateName: string,
  room: Room
): Promise<void> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    const templateData: Omit<RoomTemplate, 'id'> = {
      name: templateName,
      room,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'roomTemplates', templateId), {
      ...templateData,
      createdAt: Timestamp.fromDate(templateData.createdAt),
      updatedAt: Timestamp.fromDate(templateData.updatedAt),
    });
  } catch (error) {
    console.error('部屋テンプレートの保存エラー:', error);
    throw error;
  }
};

// 部屋テンプレートを読み込み
export const loadRoomTemplate = async (templateId: string): Promise<RoomTemplate | null> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    const docRef = doc(db, 'roomTemplates', templateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        room: data.room,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }

    return null;
  } catch (error) {
    console.error('部屋テンプレートの読み込みエラー:', error);
    throw error;
  }
};

// すべての部屋テンプレートを取得
export const getAllRoomTemplates = async (): Promise<RoomTemplate[]> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    const templatesQuery = query(
      collection(db, 'roomTemplates'),
      orderBy('updatedAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(templatesQuery);
    const templates: RoomTemplate[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      templates.push({
        id: doc.id,
        name: data.name,
        room: data.room,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return templates;
  } catch (error) {
    console.error('部屋テンプレートリストの取得エラー:', error);
    throw error;
  }
};

// 部屋テンプレートを削除
export const deleteRoomTemplate = async (templateId: string): Promise<void> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    await deleteDoc(doc(db, 'roomTemplates', templateId));
  } catch (error) {
    console.error('部屋テンプレートの削除エラー:', error);
    throw error;
  }
};

// 家具テンプレートを保存
export const saveFurnitureTemplate = async (
  templateId: string,
  name: string,
  width: number,
  height: number
): Promise<void> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    const templateData: Omit<FurnitureTemplate, 'id'> = {
      name,
      width,
      height,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'furnitureTemplates', templateId), {
      ...templateData,
      createdAt: Timestamp.fromDate(templateData.createdAt),
      updatedAt: Timestamp.fromDate(templateData.updatedAt),
    });
  } catch (error) {
    console.error('家具テンプレートの保存エラー:', error);
    throw error;
  }
};

// すべての家具テンプレートを取得
export const getAllFurnitureTemplates = async (): Promise<FurnitureTemplate[]> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    const templatesQuery = query(
      collection(db, 'furnitureTemplates'),
      orderBy('name', 'asc'),
      limit(100)
    );

    const querySnapshot = await getDocs(templatesQuery);
    const templates: FurnitureTemplate[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      templates.push({
        id: doc.id,
        name: data.name,
        width: data.width,
        height: data.height,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return templates;
  } catch (error) {
    console.error('家具テンプレートリストの取得エラー:', error);
    throw error;
  }
};

// 家具テンプレートを削除
export const deleteFurnitureTemplate = async (templateId: string): Promise<void> => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebaseが設定されていません。.env.localファイルを確認してください。');
  }

  try {
    await deleteDoc(doc(db, 'furnitureTemplates', templateId));
  } catch (error) {
    console.error('家具テンプレートの削除エラー:', error);
    throw error;
  }
};

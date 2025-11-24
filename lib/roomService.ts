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

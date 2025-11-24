'use client';

import { useState, useEffect } from 'react';
import { useRoom } from '@/context/RoomContext';
import {
  saveRoomData,
  loadRoomData,
  getAllSavedRooms,
  deleteRoomData,
  checkFirebaseConfig,
  SavedRoomData,
} from '@/lib/roomService';

export default function SaveLoadPanel() {
  const { state, loadRoomWithFurniture } = useRoom();
  const [savedRooms, setSavedRooms] = useState<SavedRoomData[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);

  useEffect(() => {
    setIsFirebaseConfigured(checkFirebaseConfig());
  }, []);

  useEffect(() => {
    if (showLoadDialog && isFirebaseConfigured) {
      loadSavedRooms();
    }
  }, [showLoadDialog, isFirebaseConfigured]);

  const loadSavedRooms = async () => {
    try {
      const rooms = await getAllSavedRooms();
      setSavedRooms(rooms);
    } catch (error) {
      alert('保存された部屋の読み込みに失敗しました');
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!state.room) {
      alert('保存する部屋がありません');
      return;
    }

    if (!saveName.trim()) {
      alert('保存名を入力してください');
      return;
    }

    setIsSaving(true);

    try {
      const roomId = `room_${Date.now()}`;
      await saveRoomData(roomId, saveName, state.room, state.furniture);
      alert('保存しました！');
      setShowSaveDialog(false);
      setSaveName('');
    } catch (error: any) {
      alert(error.message || '保存に失敗しました');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (roomId: string) => {
    setIsLoading(true);

    try {
      const data = await loadRoomData(roomId);

      if (data) {
        // 既存の部屋がある場合は確認
        if (state.room) {
          const furnitureCount = state.furniture.length;
          let message = '現在の部屋が置き換えられます。';

          if (furnitureCount > 0) {
            message += `\n配置されている家具（${furnitureCount}個）も削除されます。`;
          }

          message += '\n\n続けますか？';

          if (!confirm(message)) {
            setIsLoading(false);
            return;
          }
        }

        // 部屋と家具を読み込み
        loadRoomWithFurniture(data.room, data.furniture);

        alert('読み込みました！');
        setShowLoadDialog(false);
      } else {
        alert('部屋が見つかりませんでした');
      }
    } catch (error: any) {
      alert(error.message || '読み込みに失敗しました');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (roomId: string, roomName: string) => {
    if (!confirm(`「${roomName}」を削除しますか？`)) {
      return;
    }

    try {
      await deleteRoomData(roomId);
      alert('削除しました');
      loadSavedRooms();
    } catch (error: any) {
      alert(error.message || '削除に失敗しました');
      console.error(error);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">データの保存・読み込み</h2>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800 mb-2">
            Firebaseが設定されていません
          </p>
          <p className="text-xs text-amber-700">
            .env.local.exampleをコピーして.env.localを作成し、<br />
            Firebase設定を追加してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">データの保存・読み込み</h2>

      <div className="space-y-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!state.room}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed"
        >
          保存
        </button>

        <button
          onClick={() => setShowLoadDialog(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          読み込み
        </button>
      </div>

      {/* 保存ダイアログ */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">部屋を保存</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                保存名
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="例: リビングレイアウトv1"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                }}
                className="flex-1 bg-gray-500 text-white py-2.5 px-4 rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 読み込みダイアログ */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">保存された部屋</h3>

            {savedRooms.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                保存された部屋がありません
              </p>
            ) : (
              <div className="space-y-2">
                {savedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{room.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          家具: {room.furniture.length}個 |
                          更新: {new Date(room.updatedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(room.id)}
                        disabled={isLoading}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                      >
                        読み込み
                      </button>
                      <button
                        onClick={() => handleDelete(room.id, room.name)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLoadDialog(false)}
              className="w-full mt-4 bg-gray-500 text-white py-2.5 px-4 rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

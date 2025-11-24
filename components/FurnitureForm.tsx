'use client';

import { useState } from 'react';
import { useRoom } from '@/context/RoomContext';

export default function FurnitureForm() {
  const { addFurniture, state } = useRoom();
  const [name, setName] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !width || !height) {
      alert('すべての項目を入力してください');
      return;
    }

    if (!state.room) {
      alert('先に部屋を作成してください');
      return;
    }

    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);

    if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      alert('正しいサイズを入力してください');
      return;
    }

    const centerX = state.room.points.reduce((sum, p) => sum + p.x, 0) / state.room.points.length;
    const centerY = state.room.points.reduce((sum, p) => sum + p.y, 0) / state.room.points.length;

    addFurniture({
      name,
      width: widthNum,
      height: heightNum,
      position: { x: centerX, y: centerY },
      rotation: 0,
    });

    setName('');
    setWidth('');
    setHeight('');
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">家具を追加</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            家具の名前
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="例: ソファ、テーブル"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-2">
              横幅 (cm)
            </label>
            <input
              type="number"
              id="width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="200"
              step="0.1"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
              奥行き (cm)
            </label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="90"
              step="0.1"
              min="0"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed"
          disabled={!state.room}
        >
          家具を追加
        </button>
      </form>

      {!state.room && (
        <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
          先に部屋を作成してください
        </p>
      )}
    </div>
  );
}

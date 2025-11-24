'use client';

import { useRoom } from '@/context/RoomContext';
import { useEffect, useState } from 'react';

export default function FurnitureControls() {
  const { state, updateFurniture, deleteFurniture, selectFurniture } = useRoom();
  const [rotation, setRotation] = useState(0);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [isEditingSize, setIsEditingSize] = useState(false);

  const selectedFurniture = state.furniture.find(
    (f) => f.id === state.selectedFurnitureId
  );

  useEffect(() => {
    if (selectedFurniture) {
      setRotation(selectedFurniture.rotation);
      setWidth(selectedFurniture.width.toString());
      setHeight(selectedFurniture.height.toString());
    }
  }, [selectedFurniture]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedFurniture) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (e.target instanceof HTMLInputElement) return;
          if (confirm(`${selectedFurniture.name}を削除しますか？`)) {
            deleteFurniture(selectedFurniture.id);
          }
          break;
        case 'r':
        case 'R':
          if (e.target instanceof HTMLInputElement) return;
          const newRotation = (selectedFurniture.rotation + 90) % 360;
          updateFurniture(selectedFurniture.id, { rotation: newRotation });
          break;
        case 'Escape':
          selectFurniture(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFurniture, deleteFurniture, updateFurniture, selectFurniture]);

  if (!selectedFurniture) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">家具の操作</h2>
        <p className="text-gray-500 text-sm">家具を選択してください</p>
      </div>
    );
  }

  const handleRotationChange = (value: number) => {
    setRotation(value);
    updateFurniture(selectedFurniture.id, { rotation: value });
  };

  const rotate90 = () => {
    const newRotation = (rotation + 90) % 360;
    handleRotationChange(newRotation);
  };

  const handleSizeUpdate = () => {
    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);

    if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      alert('正しいサイズを入力してください');
      return;
    }

    updateFurniture(selectedFurniture.id, {
      width: widthNum,
      height: heightNum,
    });

    setIsEditingSize(false);
  };

  const cancelSizeEdit = () => {
    setWidth(selectedFurniture.width.toString());
    setHeight(selectedFurniture.height.toString());
    setIsEditingSize(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-800">家具の操作</h2>
        <button
          onClick={() => selectFurniture(null)}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg px-2 py-1 transition-all"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h3 className="font-bold text-lg text-gray-800 mb-2">{selectedFurniture.name}</h3>

          {!isEditingSize ? (
            <div>
              <p className="text-sm text-gray-600">
                {selectedFurniture.width} × {selectedFurniture.height} cm
              </p>
              <button
                onClick={() => setIsEditingSize(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                サイズを変更
              </button>
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    横幅 (cm)
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    奥行き (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSizeUpdate}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                >
                  更新
                </button>
                <button
                  onClick={cancelSizeEdit}
                  className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-all text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            回転角度: <span className="text-blue-600 font-bold">{rotation}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => handleRotationChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <button
            onClick={rotate90}
            className="mt-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            90° 回転
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => {
              if (confirm(`${selectedFurniture.name}を削除しますか？`)) {
                deleteFurniture(selectedFurniture.id);
              }
            }}
            className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            家具を削除
          </button>
        </div>

        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl space-y-1 border border-gray-200">
          <p className="font-medium text-gray-700 mb-2">キーボードショートカット:</p>
          <ul className="space-y-1">
            <li>• <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded">R</kbd> - 90°回転</li>
            <li>• <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded">Delete</kbd> - 削除</li>
            <li>• <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded">Esc</kbd> - 選択解除</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

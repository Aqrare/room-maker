'use client';

import { useRoom } from '@/context/RoomContext';
import { useEffect, useState } from 'react';

export default function FurnitureControls() {
  const { state, updateFurniture, deleteFurniture, selectFurniture } = useRoom();
  const [rotation, setRotation] = useState(0);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [isEditingSize, setIsEditingSize] = useState(false);
  const [name, setName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const selectedFurniture = state.furniture.find(
    (f) => f.id === state.selectedFurnitureId
  );

  useEffect(() => {
    if (selectedFurniture) {
      setRotation(selectedFurniture.rotation);
      setWidth(selectedFurniture.width.toString());
      setHeight(selectedFurniture.height.toString());
      setName(selectedFurniture.name);
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
      <div className="glass-card rounded-2xl p-6 card-hover fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-100">家具の操作</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">家具を選択してください</p>
        </div>
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

  const handleNameUpdate = () => {
    if (!name || name.trim() === '') {
      alert('名前を入力してください');
      return;
    }

    updateFurniture(selectedFurniture.id, {
      name: name.trim(),
    });

    setIsEditingName(false);
  };

  const cancelNameEdit = () => {
    setName(selectedFurniture.name);
    setIsEditingName(false);
  };

  return (
    <div className="glass-card rounded-2xl p-6 card-hover fade-in">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-100">家具の操作</h2>
        </div>
        <button
          onClick={() => selectFurniture(null)}
          className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg px-2 py-1 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/30">
          {!isEditingName ? (
            <div className="mb-2">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {selectedFurniture.name}
              </h3>
              <button
                onClick={() => setIsEditingName(true)}
                className="mt-2 text-sm text-orange-400 hover:text-orange-300 font-medium hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                名前を変更
              </button>
            </div>
          ) : (
            <div className="space-y-3 mb-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  家具の名前
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                  placeholder="例: ソファ、テーブル"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleNameUpdate}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 px-3 rounded-lg transition-all text-sm font-medium shadow-lg shadow-orange-500/30"
                >
                  更新
                </button>
                <button
                  onClick={cancelNameEdit}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg transition-all text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {!isEditingSize ? (
            <div>
              <p className="text-sm text-slate-300">
                {selectedFurniture.width} × {selectedFurniture.height} cm
              </p>
              <button
                onClick={() => setIsEditingSize(true)}
                className="mt-2 text-sm text-orange-400 hover:text-orange-300 font-medium hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                サイズを変更
              </button>
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    横幅 (cm)
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    奥行き (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                    step="0.1"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSizeUpdate}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2 px-3 rounded-lg transition-all text-sm font-medium shadow-lg shadow-orange-500/30"
                >
                  更新
                </button>
                <button
                  onClick={cancelSizeEdit}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg transition-all text-sm font-medium"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            回転角度: <span className="text-cyan-400 font-bold">{rotation}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => handleRotationChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <button
            onClick={rotate90}
            className="mt-3 w-full btn-primary"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              90° 回転
            </span>
          </button>
        </div>

        <div className="border-t border-slate-700/50 pt-4">
          <button
            onClick={() => {
              if (confirm(`${selectedFurniture.name}を削除しますか？`)) {
                deleteFurniture(selectedFurniture.id);
              }
            }}
            className="w-full btn-danger"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              家具を削除
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl space-y-1 border border-slate-700/50">
          <p className="font-medium text-slate-300 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            キーボードショートカット:
          </p>
          <ul className="space-y-1">
            <li>• <kbd className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-200">R</kbd> - 90°回転</li>
            <li>• <kbd className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-200">Delete</kbd> - 削除</li>
            <li>• <kbd className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-slate-200">Esc</kbd> - 選択解除</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

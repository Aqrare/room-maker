'use client';

import { useRoom } from '@/context/RoomContext';

export default function FurnitureList() {
  const { state, selectFurniture, deleteFurniture } = useRoom();

  if (state.furniture.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">家具リスト</h2>
        <p className="text-gray-500 text-sm">まだ家具が追加されていません</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">家具リスト</h2>
      <div className="space-y-2">
        {state.furniture.map((furniture) => (
          <div
            key={furniture.id}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
              state.selectedFurnitureId === furniture.id
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => selectFurniture(furniture.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{furniture.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {furniture.width} × {furniture.height} cm
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  位置: ({furniture.position.x.toFixed(0)}, {furniture.position.y.toFixed(0)})
                  {furniture.rotation !== 0 && ` | 回転: ${furniture.rotation}°`}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`${furniture.name}を削除しますか？`)) {
                    deleteFurniture(furniture.id);
                  }
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium ml-3 px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

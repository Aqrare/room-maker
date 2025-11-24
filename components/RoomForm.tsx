'use client';

import { useState, useRef } from 'react';
import { useRoom } from '@/context/RoomContext';
import { Point } from '@/types';

const SCALE = 1; // 1px = 1cm

export default function RoomForm() {
  const { state, createRoom } = useRoom();
  const [points, setPoints] = useState<Point[]>([]);
  const [roomName, setRoomName] = useState('リビングルーム');
  const [isDefiningRoom, setIsDefiningRoom] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);

  // 新しいポイント追加用の状態
  const [showPointDialog, setShowPointDialog] = useState(false);
  const [distanceInput, setDistanceInput] = useState('');
  const [angleInput, setAngleInput] = useState('0');

  const calculateDistance = (p1: Point, p2: Point): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const addFirstPoint = () => {
    // 最初のポイントは中央に配置
    const startPoint = { x: 400, y: 300 };
    setPoints([startPoint]);
    setShowPointDialog(true);
  };

  const addPointByDistanceAndAngle = () => {
    const distance = parseFloat(distanceInput);
    const angle = parseFloat(angleInput);

    if (isNaN(distance) || distance <= 0) {
      alert('正しい距離を入力してください');
      return;
    }

    if (distance > 1000) {
      if (!confirm('距離が1000cmを超えています。続けますか？')) {
        return;
      }
    }

    if (isNaN(angle)) {
      alert('正しい角度を入力してください');
      return;
    }

    const lastPoint = points[points.length - 1];

    // 角度をラジアンに変換（0度 = 右、90度 = 下）
    const angleRad = (angle * Math.PI) / 180;
    const newPoint: Point = {
      x: lastPoint.x + distance * SCALE * Math.cos(angleRad),
      y: lastPoint.y + distance * SCALE * Math.sin(angleRad),
    };

    setPoints(prev => [...prev, newPoint]);
    setDistanceInput('');
    setAngleInput('0');
  };

  const handleComplete = () => {
    if (points.length < 3) {
      alert('部屋を定義するには最低3つのポイントが必要です');
      return;
    }

    if (!roomName.trim()) {
      alert('部屋の名前を入力してください');
      return;
    }

    createRoom(roomName, points);

    setPoints([]);
    setIsDefiningRoom(false);
    setShowPointDialog(false);
    setRoomName('リビングルーム');
  };

  const handleCancel = () => {
    setPoints([]);
    setIsDefiningRoom(false);
    setShowPointDialog(false);
    setDistanceInput('');
    setAngleInput('0');
  };

  const handleStartDefining = () => {
    if (state.room) {
      const furnitureCount = state.furniture.length;
      let message = '既存の部屋が置き換えられます。';

      if (furnitureCount > 0) {
        message += `\n配置されている家具（${furnitureCount}個）もすべて削除されます。`;
      }

      message += '\n\n続けますか？';

      if (!confirm(message)) {
        return;
      }
    }
    setIsDefiningRoom(true);
    setPoints([]);
  };

  const removeLastPoint = () => {
    setPoints(prev => prev.slice(0, -1));
    if (points.length === 1) {
      setShowPointDialog(false);
    }
  };

  if (state.room && !isDefiningRoom) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-3">部屋: {state.room.name}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {state.room.points.length} 個のポイントで定義済み
        </p>
        <button
          onClick={handleStartDefining}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 px-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          部屋を再定義
        </button>
      </div>
    );
  }

  if (!isDefiningRoom) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">部屋を作成</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
              部屋の名前
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="例: リビングルーム"
            />
          </div>
          <button
            onClick={handleStartDefining}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            部屋の定義を開始
          </button>
        </div>
      </div>
    );
  }

  const renderPolygon = () => {
    if (points.length < 2) return null;

    const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <>
        <polyline
          points={pointsStr}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
        />
        {points.length >= 3 && (
          <>
            <line
              x1={points[points.length - 1].x}
              y1={points[points.length - 1].y}
              x2={points[0].x}
              y2={points[0].y}
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="8,8"
            />
            <text
              x={(points[points.length - 1].x + points[0].x) / 2}
              y={(points[points.length - 1].y + points[0].y) / 2}
              className="fill-blue-600 font-bold"
              style={{ fontSize: '14px' }}
            >
              {Math.round(calculateDistance(points[points.length - 1], points[0]) / SCALE)}cm
            </text>
          </>
        )}
        {/* 各辺の長さを表示 */}
        {points.slice(0, -1).map((point, index) => {
          const nextPoint = points[index + 1];
          const distance = calculateDistance(point, nextPoint);
          const midX = (point.x + nextPoint.x) / 2;
          const midY = (point.y + nextPoint.y) / 2;

          return (
            <text
              key={`dist-${index}`}
              x={midX}
              y={midY - 10}
              className="fill-blue-600 font-bold"
              style={{ fontSize: '14px' }}
            >
              {Math.round(distance / SCALE)}cm
            </text>
          );
        })}
      </>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">部屋の形を定義</h2>

      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900 font-medium">
          各辺の長さ（cm）と角度を指定して部屋の形を作成します
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          定義済みポイント: <span className="text-blue-600 font-bold">{points.length}</span>
        </p>
        <svg
          ref={canvasRef}
          viewBox="0 0 800 600"
          className="w-full border-2 border-blue-300 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 shadow-inner"
          style={{ minHeight: '400px' }}
        >
          <defs>
            <pattern id="grid-defining" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="600" fill="url(#grid-defining)" />

          {renderPolygon()}

          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill={index === 0 ? '#10b981' : '#3b82f6'}
                stroke="white"
                strokeWidth="3"
                className="drop-shadow-md"
              />
              <text
                x={point.x + 15}
                y={point.y + 5}
                className="fill-gray-700 font-bold"
                style={{ fontSize: '16px' }}
              >
                {index === 0 ? '開始' : index}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {points.length === 0 ? (
        <button
          onClick={addFirstPoint}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          開始点を配置
        </button>
      ) : (
        <div className="space-y-4">
          {showPointDialog && (
            <div className="p-4 bg-white border-2 border-blue-300 rounded-xl space-y-3">
              <h3 className="font-bold text-gray-800">次のポイントを追加</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  距離 (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={distanceInput}
                  onChange={(e) => setDistanceInput(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="例: 350"
                  step="1"
                  min="0"
                  max="1000"
                />
                <p className="text-xs text-gray-500 mt-1">推奨: 1000cm以下</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  角度 (度)
                </label>
                <input
                  type="number"
                  value={angleInput}
                  onChange={(e) => setAngleInput(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                  step="1"
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <button onClick={() => setAngleInput('0')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">→ 0°</button>
                  <button onClick={() => setAngleInput('90')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">↓ 90°</button>
                  <button onClick={() => setAngleInput('180')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">← 180°</button>
                  <button onClick={() => setAngleInput('270')} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">↑ 270°</button>
                </div>
              </div>

              <button
                onClick={addPointByDistanceAndAngle}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                ポイントを追加
              </button>
            </div>
          )}

          <div className="space-y-2">
            {points.length > 0 && (
              <button
                onClick={removeLastPoint}
                className="w-full bg-gray-500 text-white py-2.5 px-4 rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                最後のポイントを削除
              </button>
            )}

            {!showPointDialog && points.length > 0 && (
              <button
                onClick={() => setShowPointDialog(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                次のポイントを追加
              </button>
            )}

            <button
              onClick={handleComplete}
              disabled={points.length < 3}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 px-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
            >
              部屋を完成 ({points.length >= 3 ? '準備完了' : `あと${3 - points.length}ポイント必要`})
            </button>

            <button
              onClick={handleCancel}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

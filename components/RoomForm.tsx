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
      <div className="glass-card rounded-2xl p-6 card-hover fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-100">部屋</h2>
        </div>
        <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <p className="text-lg font-bold text-cyan-300">{state.room.name}</p>
          <p className="text-sm text-slate-400 mt-1">
            {state.room.points.length} 個のポイントで定義済み
          </p>
        </div>
        <button
          onClick={handleStartDefining}
          className="w-full btn-secondary"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            部屋を再定義
          </span>
        </button>
      </div>
    );
  }

  if (!isDefiningRoom) {
    return (
      <div className="glass-card rounded-2xl p-6 card-hover fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-100">部屋を作成</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-slate-300 mb-2">
              部屋の名前
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="input-modern"
              placeholder="例: リビングルーム"
            />
          </div>
          <button
            onClick={handleStartDefining}
            className="w-full btn-primary"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              部屋の定義を開始
            </span>
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
    <div className="glass-card rounded-2xl p-6 card-hover fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-100">部屋の形を定義</h2>
      </div>

      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-blue-300 font-medium">
          各辺の長さ（cm）と角度を指定して部屋の形を作成します
        </p>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-300">
          定義済みポイント: <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-lg font-bold">{points.length}</span>
        </div>
        <svg
          ref={canvasRef}
          viewBox="0 0 800 600"
          className="w-full border-2 border-slate-700/50 rounded-xl bg-slate-900/50 shadow-inner"
          style={{ minHeight: '400px' }}
        >
          <defs>
            <pattern id="grid-defining" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="1" />
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
                className="fill-slate-200 font-bold"
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
          className="w-full btn-success"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            開始点を配置
          </span>
        </button>
      ) : (
        <div className="space-y-4">
          {showPointDialog && (
            <div className="p-4 bg-slate-800/60 border-2 border-blue-500/40 rounded-xl space-y-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                次のポイントを追加
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  距離 (cm) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={distanceInput}
                  onChange={(e) => setDistanceInput(e.target.value)}
                  className="input-modern"
                  placeholder="例: 350"
                  step="1"
                  min="0"
                  max="1000"
                />
                <p className="text-xs text-slate-400 mt-1">推奨: 1000cm以下</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  角度 (度)
                </label>
                <input
                  type="number"
                  value={angleInput}
                  onChange={(e) => setAngleInput(e.target.value)}
                  className="input-modern"
                  placeholder="0"
                  step="1"
                />
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <button onClick={() => setAngleInput('0')} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-all">→ 0°</button>
                  <button onClick={() => setAngleInput('90')} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-all">↓ 90°</button>
                  <button onClick={() => setAngleInput('180')} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-all">← 180°</button>
                  <button onClick={() => setAngleInput('270')} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-all">↑ 270°</button>
                </div>
              </div>

              <button
                onClick={addPointByDistanceAndAngle}
                className="w-full btn-primary"
              >
                ポイントを追加
              </button>
            </div>
          )}

          <div className="space-y-2">
            {points.length > 0 && (
              <button
                onClick={removeLastPoint}
                className="w-full btn-secondary"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  最後のポイントを削除
                </span>
              </button>
            )}

            {!showPointDialog && points.length > 0 && (
              <button
                onClick={() => setShowPointDialog(true)}
                className="w-full btn-primary"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  次のポイントを追加
                </span>
              </button>
            )}

            <button
              onClick={handleComplete}
              disabled={points.length < 3}
              className="w-full btn-success disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                部屋を完成 ({points.length >= 3 ? '準備完了' : `あと${3 - points.length}ポイント必要`})
              </span>
            </button>

            <button
              onClick={handleCancel}
              className="w-full btn-danger"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                キャンセル
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

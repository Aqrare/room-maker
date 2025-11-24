'use client';

import { useRoom } from '@/context/RoomContext';
import { useRef, useState, useEffect } from 'react';
import { Furniture } from '@/types';

export default function RoomCanvas() {
  const { state, selectFurniture, updateFurniture } = useRoom();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{ furnitureId: string; startX: number; startY: number } | null>(null);
  const [viewBox, setViewBox] = useState({ x: -50, y: -50, width: 1000, height: 800 });

  useEffect(() => {
    if (state.room && state.room.points.length > 0) {
      const xs = state.room.points.map(p => p.x);
      const ys = state.room.points.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const padding = 100;
      const width = maxX - minX + padding * 2;
      const height = maxY - minY + padding * 2;

      setViewBox({
        x: minX - padding,
        y: minY - padding,
        width,
        height,
      });
    }
  }, [state.room]);

  const handleMouseDown = (e: React.MouseEvent<SVGRectElement>, furnitureId: string) => {
    e.stopPropagation();
    selectFurniture(furnitureId);

    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    setDragging({
      furnitureId,
      startX: svgP.x,
      startY: svgP.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const furniture = state.furniture.find(f => f.id === dragging.furnitureId);
    if (!furniture) return;

    const dx = svgP.x - dragging.startX;
    const dy = svgP.y - dragging.startY;

    updateFurniture(dragging.furnitureId, {
      position: {
        x: furniture.position.x + dx,
        y: furniture.position.y + dy,
      },
    });

    setDragging({
      ...dragging,
      startX: svgP.x,
      startY: svgP.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const renderFurniture = (furniture: Furniture) => {
    const isSelected = state.selectedFurnitureId === furniture.id;

    return (
      <g
        key={furniture.id}
        transform={`translate(${furniture.position.x}, ${furniture.position.y}) rotate(${furniture.rotation})`}
      >
        <rect
          x={-furniture.width / 2}
          y={-furniture.height / 2}
          width={furniture.width}
          height={furniture.height}
          fill={isSelected ? 'url(#selectedGradient)' : 'url(#furnitureGradient)'}
          stroke={isSelected ? '#2563eb' : '#64748b'}
          strokeWidth="3"
          className="cursor-move"
          onMouseDown={(e) => handleMouseDown(e, furniture.id)}
          rx="4"
        />
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white pointer-events-none select-none font-medium"
          style={{ fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        >
          {furniture.name}
        </text>
      </g>
    );
  };

  const renderRoom = () => {
    if (!state.room || state.room.points.length < 3) return null;

    const points = state.room.points.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <>
        <polygon
          points={points}
          fill="url(#roomGradient)"
          stroke="#475569"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <polygon
          points={points}
          fill="none"
          stroke="url(#borderGradient)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </>
    );
  };

  const renderGrid = () => {
    const gridSize = 50;
    const lines = [];

    for (let x = Math.floor(viewBox.x / gridSize) * gridSize; x <= viewBox.x + viewBox.width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={viewBox.y}
          x2={x}
          y2={viewBox.y + viewBox.height}
          stroke="#e2e8f0"
          strokeWidth="1"
          opacity="0.5"
        />
      );
    }

    for (let y = Math.floor(viewBox.y / gridSize) * gridSize; y <= viewBox.y + viewBox.height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={viewBox.x}
          y1={y}
          x2={viewBox.x + viewBox.width}
          y2={y}
          stroke="#e2e8f0"
          strokeWidth="1"
          opacity="0.5"
        />
      );
    }

    return <g>{lines}</g>;
  };

  if (!state.room) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 flex flex-col items-center justify-center h-full min-h-[600px] hover:shadow-xl transition-shadow">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">部屋を作成して開始</h3>
          <p className="text-gray-600">まず部屋の形を定義してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{state.room.name}</h2>
        <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
          家具: {state.furniture.length}個
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full border-2 border-gray-300 rounded-xl shadow-inner bg-gradient-to-br from-slate-50 to-blue-50"
        style={{ minHeight: '600px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => selectFurniture(null)}
      >
        <defs>
          <linearGradient id="roomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f8fafc', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e0e7ff', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
            <stop offset="50%" style={{ stopColor: '#6366f1', stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.5 }} />
          </linearGradient>
          <linearGradient id="furnitureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#94a3b8', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#64748b', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {renderGrid()}
        {renderRoom()}
        {state.furniture.map(renderFurniture)}
      </svg>
      <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-xl border border-blue-200">
        💡 ヒント: 家具をドラッグして移動、クリックして選択できます
      </div>
    </div>
  );
}

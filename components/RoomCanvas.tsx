'use client';

import { useRoom } from '@/context/RoomContext';
import { useRef, useState, useEffect } from 'react';
import { Furniture, Point } from '@/types';

export default function RoomCanvas() {
  const { state, selectFurniture, updateFurniture } = useRoom();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{ furnitureId: string; startX: number; startY: number } | null>(null);
  const [viewBox, setViewBox] = useState({ x: -50, y: -50, width: 1000, height: 800 });
  const [measureMode, setMeasureMode] = useState(false);
  const [measuring, setMeasuring] = useState<{ start: Point; end: Point } | null>(null);
  const [measurements, setMeasurements] = useState<Array<{ start: Point; end: Point }>>([]);
  const [snapPoint, setSnapPoint] = useState<Point | null>(null);

  // Helper function to calculate distance from a point to a line segment
  const pointToSegmentDistance = (
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
  ): { distance: number; closestPoint: { x: number; y: number } } => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      const distance = Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
      return { distance, closestPoint: { x: x1, y: y1 } };
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;
    const distance = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);

    return { distance, closestPoint: { x: closestX, y: closestY } };
  };

  // Calculate furniture corners in world coordinates
  const getFurnitureCorners = (furniture: Furniture) => {
    const halfW = furniture.width / 2;
    const halfH = furniture.height / 2;
    const angleRad = (furniture.rotation * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const corners = [
      { x: -halfW, y: -halfH },
      { x: halfW, y: -halfH },
      { x: halfW, y: halfH },
      { x: -halfW, y: halfH },
    ];

    return corners.map(corner => ({
      x: furniture.position.x + corner.x * cos - corner.y * sin,
      y: furniture.position.y + corner.x * sin + corner.y * cos,
    }));
  };

  // Calculate distances from furniture to all walls
  const calculateWallDistances = (furniture: Furniture, roomPoints: Point[]) => {
    const corners = getFurnitureCorners(furniture);
    const distances: Array<{
      distance: number;
      wall: { start: Point; end: Point };
      closestPoint: Point;
      furniturePoint: Point;
    }> = [];

    for (let i = 0; i < roomPoints.length; i++) {
      const wall = {
        start: roomPoints[i],
        end: roomPoints[(i + 1) % roomPoints.length],
      };

      let minDist = Infinity;
      let closestPoint = { x: 0, y: 0 };
      let furniturePoint = corners[0];

      for (const corner of corners) {
        const result = pointToSegmentDistance(
          corner.x, corner.y,
          wall.start.x, wall.start.y,
          wall.end.x, wall.end.y
        );

        if (result.distance < minDist) {
          minDist = result.distance;
          closestPoint = result.closestPoint;
          furniturePoint = corner;
        }
      }

      distances.push({
        distance: minDist,
        wall,
        closestPoint,
        furniturePoint,
      });
    }

    return distances.sort((a, b) => a.distance - b.distance).slice(0, 4);
  };

  // Check if a point is inside a rotated rectangle
  const isPointInRotatedRect = (
    point: Point,
    rectCenter: Point,
    rectWidth: number,
    rectHeight: number,
    rectRotation: number
  ): boolean => {
    const angleRad = (-rectRotation * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const dx = point.x - rectCenter.x;
    const dy = point.y - rectCenter.y;

    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    return (
      Math.abs(localX) <= rectWidth / 2 &&
      Math.abs(localY) <= rectHeight / 2
    );
  };

  // Check if two furniture pieces overlap
  const checkFurnitureOverlap = (furniture1: Furniture, furniture2: Furniture): boolean => {
    const corners1 = getFurnitureCorners(furniture1);
    const corners2 = getFurnitureCorners(furniture2);

    // Check if any corner of furniture1 is inside furniture2
    for (const corner of corners1) {
      if (isPointInRotatedRect(
        corner,
        furniture2.position,
        furniture2.width,
        furniture2.height,
        furniture2.rotation
      )) {
        return true;
      }
    }

    // Check if any corner of furniture2 is inside furniture1
    for (const corner of corners2) {
      if (isPointInRotatedRect(
        corner,
        furniture1.position,
        furniture1.width,
        furniture1.height,
        furniture1.rotation
      )) {
        return true;
      }
    }

    return false;
  };

  // Check if furniture overlaps with any other furniture
  const wouldOverlap = (furniture: Furniture): boolean => {
    return state.furniture.some(other =>
      other.id !== furniture.id && checkFurnitureOverlap(furniture, other)
    );
  };

  // Get all snap points (furniture corners and room corners)
  const getAllSnapPoints = (): Point[] => {
    const points: Point[] = [];

    // Add all furniture corners
    state.furniture.forEach(furniture => {
      const corners = getFurnitureCorners(furniture);
      points.push(...corners);
    });

    // Add room corners
    if (state.room) {
      points.push(...state.room.points);
    }

    return points;
  };

  // Get all edges (furniture edges and room edges)
  const getAllEdges = (): Array<{ start: Point; end: Point }> => {
    const edges: Array<{ start: Point; end: Point }> = [];

    // Add furniture edges
    state.furniture.forEach(furniture => {
      const corners = getFurnitureCorners(furniture);
      for (let i = 0; i < corners.length; i++) {
        edges.push({
          start: corners[i],
          end: corners[(i + 1) % corners.length],
        });
      }
    });

    // Add room edges
    if (state.room) {
      for (let i = 0; i < state.room.points.length; i++) {
        edges.push({
          start: state.room.points[i],
          end: state.room.points[(i + 1) % state.room.points.length],
        });
      }
    }

    return edges;
  };

  // Find nearest snap point within threshold (corners and edges)
  const findNearestSnapPoint = (point: Point, threshold: number = 30): Point | null => {
    let nearestPoint: Point | null = null;
    let minDistance = threshold;

    // Check corners
    const snapPoints = getAllSnapPoints();
    for (const snapPoint of snapPoints) {
      const distance = Math.sqrt(
        Math.pow(point.x - snapPoint.x, 2) + Math.pow(point.y - snapPoint.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = snapPoint;
      }
    }

    // Check edges (find closest point on each edge)
    const edges = getAllEdges();
    for (const edge of edges) {
      const result = pointToSegmentDistance(
        point.x,
        point.y,
        edge.start.x,
        edge.start.y,
        edge.end.x,
        edge.end.y
      );

      if (result.distance < minDistance) {
        minDistance = result.distance;
        nearestPoint = result.closestPoint;
      }
    }

    return nearestPoint;
  };

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

  const handleFurnitureClick = (e: React.MouseEvent, furnitureId: string) => {
    e.stopPropagation();
    selectFurniture(furnitureId);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGRectElement>, furnitureId: string) => {
    if (measureMode) return;

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

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!measureMode || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    // Snap to nearest point if available
    const snapped = findNearestSnapPoint(svgP) || svgP;

    setMeasuring({
      start: snapped,
      end: snapped,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    // Update snap point for visual feedback in measure mode
    if (measureMode) {
      const nearestSnap = findNearestSnapPoint(svgP);
      setSnapPoint(nearestSnap);
    } else {
      setSnapPoint(null);
    }

    // Handle furniture dragging
    if (dragging && !measureMode) {
      const furniture = state.furniture.find(f => f.id === dragging.furnitureId);
      if (!furniture) return;

      const dx = svgP.x - dragging.startX;
      const dy = svgP.y - dragging.startY;

      const newPosition = {
        x: furniture.position.x + dx,
        y: furniture.position.y + dy,
      };

      // Create a temporary furniture object with the new position for collision checking
      const tempFurniture: Furniture = {
        ...furniture,
        position: newPosition,
      };

      // Only update if there's no overlap
      if (!wouldOverlap(tempFurniture)) {
        updateFurniture(dragging.furnitureId, {
          position: newPosition,
        });

        setDragging({
          ...dragging,
          startX: svgP.x,
          startY: svgP.y,
        });
      }
    }

    // Handle measurement
    if (measuring && measureMode) {
      // Snap to nearest point if available
      const snapped = findNearestSnapPoint(svgP) || svgP;

      setMeasuring({
        ...measuring,
        end: snapped,
      });
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(null);
    }

    if (measuring && measureMode) {
      const distance = Math.sqrt(
        Math.pow(measuring.end.x - measuring.start.x, 2) +
        Math.pow(measuring.end.y - measuring.start.y, 2)
      );

      // Only save if the measurement is significant (> 5 pixels)
      if (distance > 5) {
        setMeasurements(prev => [...prev, measuring]);
      }
      setMeasuring(null);
    }
  };

  const renderFurniture = (furniture: Furniture) => {
    const isSelected = state.selectedFurnitureId === furniture.id;
    const isDragging = dragging?.furnitureId === furniture.id;

    return (
      <g
        key={furniture.id}
        transform={`translate(${furniture.position.x}, ${furniture.position.y}) rotate(${furniture.rotation})`}
        className={isDragging ? '' : 'transition-all duration-200'}
        onClick={(e) => handleFurnitureClick(e, furniture.id)}
        style={{ cursor: measureMode ? 'crosshair' : 'pointer' }}
      >
        <rect
          x={-furniture.width / 2}
          y={-furniture.height / 2}
          width={furniture.width}
          height={furniture.height}
          fill={isSelected ? 'url(#selectedGradient)' : 'url(#furnitureGradient)'}
          stroke={isSelected ? '#3b82f6' : '#64748b'}
          strokeWidth="2"
          style={{ cursor: measureMode ? 'crosshair' : 'move' }}
          onMouseDown={(e) => handleMouseDown(e, furniture.id)}
          rx="4"
        />
        {/* Cyan outline in measure mode */}
        {measureMode && (
          <rect
            x={-furniture.width / 2}
            y={-furniture.height / 2}
            width={furniture.width}
            height={furniture.height}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            rx="4"
            opacity="0.8"
            pointerEvents="none"
          />
        )}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white pointer-events-none select-none font-semibold"
          style={{ fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
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
          stroke="url(#borderGradient)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <polygon
          points={points}
          fill="none"
          stroke="url(#borderGlow)"
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.6"
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
          stroke="#334155"
          strokeWidth="1"
          opacity="0.3"
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
          stroke="#334155"
          strokeWidth="1"
          opacity="0.3"
        />
      );
    }

    return <g>{lines}</g>;
  };

  const renderDistanceMeasurements = () => {
    if (!dragging || !state.room) return null;

    const furniture = state.furniture.find(f => f.id === dragging.furnitureId);
    if (!furniture) return null;

    const distances = calculateWallDistances(furniture, state.room.points);

    return (
      <g className="distance-measurements">
        {distances.map((dist, index) => {
          const midX = (dist.furniturePoint.x + dist.closestPoint.x) / 2;
          const midY = (dist.furniturePoint.y + dist.closestPoint.y) / 2;

          return (
            <g key={index}>
              {/* Distance line */}
              <line
                x1={dist.furniturePoint.x}
                y1={dist.furniturePoint.y}
                x2={dist.closestPoint.x}
                y2={dist.closestPoint.y}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.8"
              />
              {/* End points */}
              <circle
                cx={dist.furniturePoint.x}
                cy={dist.furniturePoint.y}
                r="4"
                fill="#fbbf24"
              />
              <circle
                cx={dist.closestPoint.x}
                cy={dist.closestPoint.y}
                r="4"
                fill="#fbbf24"
              />
              {/* Distance label */}
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-30"
                  y="-12"
                  width="60"
                  height="24"
                  fill="#1e293b"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  rx="4"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fbbf24"
                  fontWeight="bold"
                  fontSize="14"
                >
                  {Math.round(dist.distance)}cm
                </text>
              </g>
            </g>
          );
        })}
      </g>
    );
  };

  const renderMeasurements = () => {
    const allMeasurements = measuring ? [...measurements, measuring] : measurements;

    return (
      <g className="measurements">
        {allMeasurements.map((m, index) => {
          const distance = Math.sqrt(
            Math.pow(m.end.x - m.start.x, 2) + Math.pow(m.end.y - m.start.y, 2)
          );
          const midX = (m.start.x + m.end.x) / 2;
          const midY = (m.start.y + m.end.y) / 2;

          return (
            <g key={index}>
              {/* Measurement line */}
              <line
                x1={m.start.x}
                y1={m.start.y}
                x2={m.end.x}
                y2={m.end.y}
                stroke="#ec4899"
                strokeWidth="3"
                opacity="0.9"
              />
              {/* End points */}
              <circle cx={m.start.x} cy={m.start.y} r="5" fill="#ec4899" />
              <circle cx={m.end.x} cy={m.end.y} r="5" fill="#ec4899" />
              {/* Distance label */}
              <g transform={`translate(${midX}, ${midY})`}>
                <rect
                  x="-35"
                  y="-14"
                  width="70"
                  height="28"
                  fill="#1e293b"
                  stroke="#ec4899"
                  strokeWidth="2"
                  rx="6"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ec4899"
                  fontWeight="bold"
                  fontSize="16"
                >
                  {Math.round(distance)}cm
                </text>
              </g>
            </g>
          );
        })}
      </g>
    );
  };

  const renderSnapIndicator = () => {
    if (!measureMode || !snapPoint) return null;

    return (
      <g className="snap-indicator">
        {/* Outer pulsing ring */}
        <circle
          cx={snapPoint.x}
          cy={snapPoint.y}
          r="12"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          opacity="0.6"
        >
          <animate
            attributeName="r"
            from="12"
            to="18"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.6"
            to="0"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Inner solid circle */}
        <circle
          cx={snapPoint.x}
          cy={snapPoint.y}
          r="6"
          fill="#22d3ee"
          stroke="#0e7490"
          strokeWidth="2"
        />
      </g>
    );
  };

  if (!state.room) {
    return (
      <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center min-h-[600px] card-hover fade-in">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mb-2">部屋を作成して開始</h3>
          <p className="text-slate-400">まず部屋の形を定義してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 card-hover fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-100">{state.room.name}</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMeasureMode(!measureMode);
                if (!measureMode) {
                  selectFurniture(null);
                }
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                measureMode
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              title="メジャーモード"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              メジャー
            </button>
            {measurements.length > 0 && (
              <button
                onClick={() => setMeasurements([])}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/30"
                title="測定をクリア"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            家具: <span className="text-cyan-400 font-semibold">{state.furniture.length}</span>個
          </div>
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className={`w-full border-2 border-slate-700/50 rounded-xl shadow-inner bg-slate-900/50 ${
          measureMode ? 'cursor-crosshair' : ''
        }`}
        style={{ minHeight: '600px' }}
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => !measureMode && selectFurniture(null)}
      >
        <defs>
          <linearGradient id="roomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />
            <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="borderGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
            <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
          </linearGradient>
          <linearGradient id="furnitureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#64748b', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#475569', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="selectedGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {renderGrid()}
        {renderRoom()}
        {state.furniture.map(renderFurniture)}
        {renderDistanceMeasurements()}
        {renderMeasurements()}
        {renderSnapIndicator()}
      </svg>
      <div className="mt-4 text-sm text-slate-400 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
        💡 ヒント: {measureMode ? 'ドラッグして2点間の距離を測定できます。家具の輪郭（角と辺）に自動でスナップします' : '家具をドラッグして移動、クリックして選択できます'}
      </div>
    </div>
  );
}

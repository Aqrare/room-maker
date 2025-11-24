'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Room, Furniture, AppState, Point } from '@/types';

interface RoomContextType {
  state: AppState;
  currentProjectId: string | null;
  currentProjectName: string | null;
  setRoom: (room: Room | null) => void;
  createRoom: (name: string, points: Point[]) => void;
  loadRoomWithFurniture: (room: Room, furniture: Furniture[], projectId?: string, projectName?: string) => void;
  loadRoomOnly: (room: Room) => void;
  addFurniture: (furniture: Omit<Furniture, 'id'>) => void;
  updateFurniture: (id: string, updates: Partial<Furniture>) => void;
  deleteFurniture: (id: string) => void;
  selectFurniture: (id: string | null) => void;
  addRoomPoint: (point: Point) => void;
  clearRoomPoints: () => void;
  completeRoom: (name: string) => void;
  clearCurrentProject: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    room: null,
    furniture: [],
    selectedFurnitureId: null,
  });

  const [tempRoomPoints, setTempRoomPoints] = useState<Point[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(null);

  const setRoom = (room: Room | null) => {
    setState(prev => ({ ...prev, room, furniture: [] }));
    setTempRoomPoints([]);
  };

  const createRoom = (name: string, points: Point[]) => {
    if (points.length >= 3) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name,
        points,
      };
      setRoom(newRoom);
    }
  };

  const loadRoomWithFurniture = (room: Room, furniture: Furniture[], projectId?: string, projectName?: string) => {
    setState({
      room,
      furniture,
      selectedFurnitureId: null,
    });
    setTempRoomPoints([]);
    setCurrentProjectId(projectId || null);
    setCurrentProjectName(projectName || null);
  };

  const clearCurrentProject = () => {
    setCurrentProjectId(null);
    setCurrentProjectName(null);
  };

  const loadRoomOnly = (room: Room) => {
    setState(prev => ({
      ...prev,
      room,
      selectedFurnitureId: null,
    }));
    setTempRoomPoints([]);
  };

  const addFurniture = (furniture: Omit<Furniture, 'id'>) => {
    const newFurniture: Furniture = {
      ...furniture,
      id: `furniture-${Date.now()}-${Math.random()}`,
    };
    setState(prev => ({
      ...prev,
      furniture: [...prev.furniture, newFurniture],
    }));
  };

  const updateFurniture = (id: string, updates: Partial<Furniture>) => {
    setState(prev => ({
      ...prev,
      furniture: prev.furniture.map(f =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));
  };

  const deleteFurniture = (id: string) => {
    setState(prev => ({
      ...prev,
      furniture: prev.furniture.filter(f => f.id !== id),
      selectedFurnitureId: prev.selectedFurnitureId === id ? null : prev.selectedFurnitureId,
    }));
  };

  const selectFurniture = (id: string | null) => {
    setState(prev => ({ ...prev, selectedFurnitureId: id }));
  };

  const addRoomPoint = (point: Point) => {
    setTempRoomPoints(prev => [...prev, point]);
  };

  const clearRoomPoints = () => {
    setTempRoomPoints([]);
  };

  const completeRoom = (name: string) => {
    if (tempRoomPoints.length >= 3) {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name,
        points: tempRoomPoints,
      };
      setRoom(newRoom);
    }
  };

  return (
    <RoomContext.Provider
      value={{
        state,
        currentProjectId,
        currentProjectName,
        setRoom,
        createRoom,
        loadRoomWithFurniture,
        loadRoomOnly,
        addFurniture,
        updateFurniture,
        deleteFurniture,
        selectFurniture,
        addRoomPoint,
        clearRoomPoints,
        completeRoom,
        clearCurrentProject,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}

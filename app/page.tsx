'use client';

import RoomForm from '@/components/RoomForm';
import RoomCanvas from '@/components/RoomCanvas';
import FurnitureForm from '@/components/FurnitureForm';
import FurnitureList from '@/components/FurnitureList';
import FurnitureControls from '@/components/FurnitureControls';
import SaveLoadPanel from '@/components/SaveLoadPanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <header className="mb-8 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            部屋レイアウト作成
          </h1>
          <p className="text-gray-600 text-lg">
            部屋の形を定義して、家具を自由に配置してレイアウトを確認しましょう
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RoomCanvas />
          </div>

          <div className="space-y-4">
            <SaveLoadPanel />
            <RoomForm />
            <FurnitureForm />
            <FurnitureControls />
            <FurnitureList />
          </div>
        </div>
      </div>
    </div>
  );
}

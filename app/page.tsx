'use client';

import RoomForm from '@/components/RoomForm';
import RoomCanvas from '@/components/RoomCanvas';
import FurnitureForm from '@/components/FurnitureForm';
import FurnitureList from '@/components/FurnitureList';
import FurnitureControls from '@/components/FurnitureControls';
import SaveLoadPanel from '@/components/SaveLoadPanel';
import RoomTemplatePanel from '@/components/RoomTemplatePanel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative max-w-7xl mx-auto p-6 lg:p-8">
        <header className="mb-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              部屋レイアウト作成
            </h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl">
            部屋の形を定義して、家具を自由に配置してレイアウトを確認しましょう
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
            <RoomCanvas />
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin">
            <SaveLoadPanel />
            <RoomTemplatePanel />
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

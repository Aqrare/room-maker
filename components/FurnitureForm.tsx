'use client';

import { useState, useEffect } from 'react';
import { useRoom } from '@/context/RoomContext';
import {
  saveFurnitureTemplate,
  getAllFurnitureTemplates,
  deleteFurnitureTemplate,
  checkFirebaseConfig,
  FurnitureTemplate,
} from '@/lib/roomService';

export default function FurnitureForm() {
  const { addFurniture, state } = useRoom();
  const [name, setName] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [templates, setTemplates] = useState<FurnitureTemplate[]>([]);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsFirebaseConfigured(checkFirebaseConfig());
  }, []);

  useEffect(() => {
    if (showLibraryDialog && isFirebaseConfigured) {
      loadTemplates();
    }
  }, [showLibraryDialog, isFirebaseConfigured]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showLibraryDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLibraryDialog]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLibraryDialog) {
        setShowLibraryDialog(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showLibraryDialog]);

  const loadTemplates = async () => {
    try {
      const allTemplates = await getAllFurnitureTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('家具テンプレートの読み込みエラー:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !width || !height) {
      alert('すべての項目を入力してください');
      return;
    }

    if (!state.room) {
      alert('先に部屋を作成してください');
      return;
    }

    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);

    if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      alert('正しいサイズを入力してください');
      return;
    }

    const centerX = state.room.points.reduce((sum, p) => sum + p.x, 0) / state.room.points.length;
    const centerY = state.room.points.reduce((sum, p) => sum + p.y, 0) / state.room.points.length;

    addFurniture({
      name,
      width: widthNum,
      height: heightNum,
      position: { x: centerX, y: centerY },
      rotation: 0,
    });

    setName('');
    setWidth('');
    setHeight('');
  };

  const handleSaveTemplate = async () => {
    if (!name || !width || !height) {
      alert('家具の情報を入力してください');
      return;
    }

    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);

    if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      alert('正しいサイズを入力してください');
      return;
    }

    try {
      const templateId = `furniture_${Date.now()}`;
      await saveFurnitureTemplate(templateId, name, widthNum, heightNum);
      alert('家具をライブラリに保存しました！');
    } catch (error: any) {
      alert(`保存に失敗しました: ${error.message || error.toString()}`);
    }
  };

  const handleSelectTemplate = (template: FurnitureTemplate) => {
    setName(template.name);
    setWidth(template.width.toString());
    setHeight(template.height.toString());
    setShowLibraryDialog(false);
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`「${templateName}」を削除しますか？`)) {
      return;
    }

    try {
      await deleteFurnitureTemplate(templateId);
      alert('削除しました');
      loadTemplates();
    } catch (error: any) {
      alert(error.message || '削除に失敗しました');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 card-hover fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-100">家具を追加</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            家具の名前
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-modern"
            placeholder="例: ソファ、テーブル"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="width" className="block text-sm font-medium text-slate-300 mb-2">
              横幅 (cm)
            </label>
            <input
              type="number"
              id="width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="input-modern"
              placeholder="200"
              step="0.1"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium text-slate-300 mb-2">
              奥行き (cm)
            </label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="input-modern"
              placeholder="90"
              step="0.1"
              min="0"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 btn-success disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!state.room}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              追加
            </span>
          </button>

          {isFirebaseConfigured && (
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-300"
              title="ライブラリに保存"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {isFirebaseConfigured && (
        <button
          onClick={() => setShowLibraryDialog(true)}
          className="mt-2 w-full btn-secondary"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            家具ライブラリ
          </span>
        </button>
      )}

      {!state.room && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-sm text-amber-300 font-medium">
            先に部屋を作成してください
          </p>
        </div>
      )}

      {/* Library Dialog Modal */}
      {showLibraryDialog && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in overflow-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLibraryDialog(false);
              setSearchQuery('');
            }
          }}
        >
          <div
            className="glass-card rounded-2xl shadow-2xl max-w-4xl w-full border-2 border-slate-700/50 flex flex-col my-auto"
            style={{ maxHeight: 'calc(100vh - 2rem)', height: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100">家具ライブラリ</h3>
                  <p className="text-sm text-slate-400">{templates.length}件の家具</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowLibraryDialog(false);
                  setSearchQuery('');
                }}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search Bar */}
            {templates.length > 0 && (
              <div className="p-4 border-b border-slate-700/50">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="家具を検索..."
                    className="input-modern pl-10"
                  />
                  <svg
                    className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Content - Scrollable */}
            <div className="overflow-y-auto p-6 scrollbar-thin" style={{ minHeight: '200px', maxHeight: '60vh' }}>
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-slate-400">保存された家具がありません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates
                    .filter((template) =>
                      template.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((template) => (
                      <div
                        key={template.id}
                        className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:bg-slate-700/40 transition-all duration-200 flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-100 text-sm truncate" title={template.name}>
                            {template.name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {template.width} × {template.height} cm
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleSelectTemplate(template)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 px-3 rounded-lg transition-all duration-200 text-xs font-medium shadow-lg shadow-indigo-500/30"
                          >
                            使用
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                            className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all duration-200 text-xs font-medium shadow-lg shadow-rose-500/30"
                            title="削除"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              {templates.length > 0 &&
                templates.filter((template) =>
                  template.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-400">「{searchQuery}」に一致する家具が見つかりません</p>
                  </div>
                )}
            </div>

            {/* Footer - Fixed */}
            <div className="p-4 border-t border-slate-700/50">
              <button
                onClick={() => {
                  setShowLibraryDialog(false);
                  setSearchQuery('');
                }}
                className="w-full btn-secondary"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

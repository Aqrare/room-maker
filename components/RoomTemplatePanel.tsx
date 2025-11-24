'use client';

import { useState, useEffect } from 'react';
import { useRoom } from '@/context/RoomContext';
import {
  saveRoomTemplate,
  loadRoomTemplate,
  getAllRoomTemplates,
  deleteRoomTemplate,
  checkFirebaseConfig,
  RoomTemplate,
} from '@/lib/roomService';

export default function RoomTemplatePanel() {
  const { state, loadRoomOnly } = useRoom();
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);

  useEffect(() => {
    setIsFirebaseConfigured(checkFirebaseConfig());
  }, []);

  useEffect(() => {
    if (showLoadDialog && isFirebaseConfigured) {
      loadTemplates();
    }
  }, [showLoadDialog, isFirebaseConfigured]);

  const loadTemplates = async () => {
    try {
      const allTemplates = await getAllRoomTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      alert('部屋テンプレートの読み込みに失敗しました');
    }
  };

  const handleSave = async () => {
    if (!state.room) {
      alert('保存する部屋がありません');
      return;
    }

    if (!templateName.trim()) {
      alert('テンプレート名を入力してください');
      return;
    }

    setIsSaving(true);

    try {
      console.log('Saving template...', { templateName, room: state.room });
      const templateId = `template_${Date.now()}`;
      await saveRoomTemplate(templateId, templateName, state.room);
      console.log('Template saved successfully');
      alert('部屋テンプレートを保存しました！');
      setShowSaveDialog(false);
      setTemplateName('');
    } catch (error: any) {
      console.error('保存エラー:', error);
      alert(`保存に失敗しました: ${error.message || error.toString()}`);
    } finally {
      console.log('Setting isSaving to false');
      setIsSaving(false);
    }
  };

  const handleLoad = async (templateId: string) => {
    setIsLoading(true);

    try {
      const template = await loadRoomTemplate(templateId);

      if (template) {
        if (state.room) {
          const furnitureCount = state.furniture.length;
          let message = '現在の部屋が置き換えられます。';

          if (furnitureCount > 0) {
            message += `\n配置されている家具（${furnitureCount}個）はそのまま残ります。`;
          }

          message += '\n\n続けますか？';

          if (!confirm(message)) {
            setIsLoading(false);
            return;
          }
        }

        loadRoomOnly(template.room);
        alert('部屋テンプレートを読み込みました！');
        setShowLoadDialog(false);
      } else {
        alert('テンプレートが見つかりませんでした');
      }
    } catch (error: any) {
      alert(error.message || '読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`「${templateName}」を削除しますか？`)) {
      return;
    }

    try {
      await deleteRoomTemplate(templateId);
      alert('削除しました');
      loadTemplates();
    } catch (error: any) {
      alert(error.message || '削除に失敗しました');
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="glass-card rounded-2xl p-6 card-hover fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-100">部屋テンプレート</h2>
        </div>
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-sm text-amber-300 mb-2 font-medium">
            Firebaseが未設定
          </p>
          <p className="text-xs text-amber-400/80">
            .env.local.exampleをコピーして設定を追加してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 card-hover fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-100">部屋テンプレート</h2>
      </div>

      <div className="mb-3 p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl">
        <p className="text-xs text-violet-300">
          部屋の形状だけを保存・再利用できます
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!state.room}
          className="w-full btn-success disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            テンプレート保存
          </span>
        </button>

        <button
          onClick={() => setShowLoadDialog(true)}
          className="w-full btn-primary"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
            </svg>
            テンプレート読み込み
          </span>
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="glass-card rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100">テンプレート保存</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                テンプレート名
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="input-modern"
                placeholder="例: 標準的なリビング"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 btn-success disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName('');
                }}
                className="flex-1 btn-secondary"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="glass-card rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto border-2 border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100">部屋テンプレート</h3>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                  </svg>
                </div>
                <p className="text-slate-400">保存されたテンプレートがありません</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-700/40 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-100 mb-1">{template.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {template.room.points.length}ポイント
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(template.id)}
                        disabled={isLoading}
                        className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2 px-3 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-violet-500/30"
                      >
                        読み込み
                      </button>
                      <button
                        onClick={() => handleDelete(template.id, template.name)}
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg shadow-rose-500/30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLoadDialog(false)}
              className="w-full btn-secondary"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

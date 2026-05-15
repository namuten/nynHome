import { useState, useEffect } from 'react';
import { Watch, Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QuickReply {
  id?: number;
  body: string;
  sortOrder: number;
}

export default function AdminWatchPage() {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/watch/quick-replies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReplies(data);
      }
    } catch (error) {
      toast.error('문구를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (replies.length === 0) {
      toast.error('최소 하나 이상의 문구가 필요합니다.');
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/watch/quick-replies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ replies }),
      });
      if (res.ok) {
        toast.success('설정이 저장되었습니다.');
        fetchReplies();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const addReply = () => {
    if (replies.length >= 5) {
      toast.error('최대 5개까지만 등록 가능합니다.');
      return;
    }
    setReplies([...replies, { body: '', sortOrder: replies.length }]);
  };

  const removeReply = (index: number) => {
    setReplies(replies.filter((_, i) => i !== index));
  };

  const updateBody = (index: number, body: string) => {
    const newReplies = [...replies];
    newReplies[index].body = body;
    setReplies(newReplies);
  };

  const move = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === replies.length - 1)) return;
    const newReplies = [...replies];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newReplies[index], newReplies[targetIndex]] = [newReplies[targetIndex], newReplies[index]];
    
    // Update sortOrder
    newReplies.forEach((r, i) => r.sortOrder = i);
    setReplies(newReplies);
  };

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-black text-on-surface flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Watch className="w-6 h-6 text-primary" />
            </div>
            스마트워치 설정
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">Wear OS 앱에서 사용할 빠른 답변 문구를 관리합니다.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? '저장 중...' : '설정 저장'}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-surface-container overflow-hidden shadow-sm">
        <div className="p-6 border-b border-surface-container bg-surface/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface">빠른 답변 문구 (최대 5개)</h3>
            <button
              onClick={addReply}
              className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="문구 추가"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-surface-container">
          {replies.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant text-sm">
              등록된 문구가 없습니다. 새로운 문구를 추가해 주세요.
            </div>
          ) : (
            replies.map((reply, index) => (
              <div key={index} className="p-4 flex items-center gap-4 group">
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => move(index, 'up')}
                    className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-30"
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => move(index, 'down')}
                    className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-30"
                    disabled={index === replies.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <input
                    type="text"
                    value={reply.body}
                    onChange={(e) => updateBody(index, e.target.value)}
                    placeholder="답변 문구를 입력하세요 (예: 곧 답변할게요!)"
                    className="w-full px-4 py-2.5 bg-surface-container/30 border border-surface-container rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <button
                  onClick={() => removeReply(index)}
                  className="p-2.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="삭제"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100">
        <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
          💡 안내 사항
        </h4>
        <ul className="text-xs text-amber-800/80 space-y-1.5 list-disc list-inside">
          <li>워치 화면 특성상 문구는 10자 내외로 짧게 작성하는 것을 권장합니다.</li>
          <li>순서 조정은 왼쪽 화살표 아이콘을 사용하세요.</li>
          <li>저장 버튼을 눌러야 실제 기기에 반영됩니다.</li>
        </ul>
      </div>
    </div>
  );
}

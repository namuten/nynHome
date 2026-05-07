import { useState, useEffect } from 'react';
import { Trash, ArrowUp, ArrowDown, Save, Plus, X, ListCollapse, Eye, EyeOff } from 'lucide-react';
import type { PortfolioSection, PortfolioSectionItem } from '../../types/portfolio';

interface PortfolioSectionEditorProps {
  section: Partial<PortfolioSection>;
  onSave: (payload: Partial<PortfolioSection>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  validationErrors?: Record<string, string[]>;
}

export default function PortfolioSectionEditor({
  section,
  onSave,
  onCancel,
  isSaving,
  validationErrors = {},
}: PortfolioSectionEditorProps) {
  const [sectionKey, setSectionKey] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [items, setItems] = useState<PortfolioSectionItem[]>([]);

  // 신규 서브 아이템 단일 추가용 임시 폼 상태
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    setSectionKey(section.sectionKey || '');
    setTitle(section.title || '');
    setBody(section.body || '');
    setIsVisible(section.isVisible !== false); // 기본값 true
    setItems(section.items || []);
  }, [section]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      sectionKey,
      title,
      body: body || null,
      isVisible,
      items,
    });
  };

  // 서브 이력 아이템 제어
  const addSubItem = () => {
    if (newTitle.trim()) {
      setItems([
        ...items,
        {
          title: newTitle.trim(),
          subtitle: newSubtitle.trim() || undefined,
          date: newDate.trim() || undefined,
          description: newDesc.trim() || undefined,
          link: newLink.trim() || undefined,
        },
      ]);
      setNewTitle('');
      setNewSubtitle('');
      setNewDate('');
      setNewDesc('');
      setNewLink('');
    }
  };

  const removeSubItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const moveSubItem = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[nextIndex];
    newItems[nextIndex] = temp;
    setItems(newItems);
  };

  return (
    <div className="bg-white/90 dark:bg-surface-container/15 border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fade-in font-body">
      {/* 타이틀 및 닫기 */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
        <h3 className="text-base font-black text-primary flex items-center gap-2">
          <ListCollapse className="w-5 h-5" />
          <span>{section.id ? '포트폴리오 섹션 수정' : '신규 포트폴리오 섹션 추가'}</span>
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 키 & 제목 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">
              섹션 고유 키 (sectionKey) *
            </label>
            <input
              type="text"
              required
              disabled={!!section.id} // 생성 시에만 지정 가능하도록 처리
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50 disabled:opacity-60"
              placeholder="예: education, projects, awards 등"
            />
            {validationErrors.sectionKey && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.sectionKey.join(', ')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">
              섹션 표시 제목 (Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50"
              placeholder="예: 🎓 교육 및 활동 이력"
            />
            {validationErrors.title && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.title.join(', ')}</p>
            )}
          </div>
        </div>

        {/* 설명 본문 */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">
            섹션 대표 설명글 (Body Text)
          </label>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50 resize-none leading-relaxed"
            placeholder="이 섹션에 대한 간단 요약 혹은 전체 소개 글을 작성할 수 있습니다."
          />
          {validationErrors.body && (
            <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.body.join(', ')}</p>
          )}
        </div>

        {/* 공개 여부 토글 */}
        <div className="flex items-center gap-3 bg-surface-container/20 p-4 rounded-xl border border-outline-variant/20 max-w-sm">
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className={`p-2 rounded-lg transition-colors ${
              isVisible ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant/60'
            }`}
          >
            {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <div>
            <p className="text-xs font-extrabold text-on-surface">퍼블릭 페이지 공개 여부</p>
            <p className="text-[11px] text-on-surface-variant font-medium">체크 시 방문자 포트폴리오에 상영됩니다.</p>
          </div>
        </div>

        {/* 세부 서브 리스트 아이템 추가 폼 */}
        <div className="border border-outline-variant/30 rounded-2xl p-4 sm:p-5 bg-surface-container/10 space-y-4">
          <h4 className="text-xs font-extrabold text-primary flex items-center gap-2 uppercase tracking-wider">
            <Plus className="w-4 h-4" />
            세부 세부 항목 관리 (Sub Items)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-2 border border-outline-variant/50 focus:outline-none rounded-lg text-xs bg-white"
              placeholder="항목명 (예: 한국대학교) *"
            />
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              className="px-3 py-2 border border-outline-variant/50 focus:outline-none rounded-lg text-xs bg-white"
              placeholder="부제목 (예: 컴퓨터공학 학사)"
            />
            <input
              type="text"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="px-3 py-2 border border-outline-variant/50 focus:outline-none rounded-lg text-xs bg-white"
              placeholder="날짜 (예: 2022.03 ~ 현재)"
            />
            <input
              type="text"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              className="sm:col-span-3 px-3 py-2 border border-outline-variant/50 focus:outline-none rounded-lg text-xs bg-white"
              placeholder="관련 외부 URL 링크 (예: https://...)"
            />
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="sm:col-span-3 px-3 py-2 border border-outline-variant/50 focus:outline-none rounded-lg text-xs bg-white resize-none"
              placeholder="상세 설명 및 성과 요약"
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={addSubItem}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/95 transition-all"
            >
              세부 항목 추가
            </button>
          </div>

          {/* 항목 리스트 */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pt-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-start justify-between bg-white dark:bg-surface border border-outline-variant/20 p-3.5 rounded-xl group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">{item.title}</span>
                    {item.date && (
                      <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                        {item.date}
                      </span>
                    )}
                  </div>
                  {item.subtitle && <p className="text-[11px] font-semibold text-on-surface-variant">{item.subtitle}</p>}
                  {item.description && <p className="text-[11px] text-on-surface-variant/80 whitespace-pre-line font-medium leading-relaxed">{item.description}</p>}
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSubItem(index, 'up')}
                    className="p-1.5 border border-outline-variant/40 bg-white hover:bg-surface-container rounded-lg disabled:opacity-40"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveSubItem(index, 'down')}
                    className="p-1.5 border border-outline-variant/40 bg-white hover:bg-surface-container rounded-lg disabled:opacity-40"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSubItem(index)}
                    className="p-1.5 border border-red-200 text-red-500 bg-white hover:bg-red-50 rounded-lg ml-1"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 제어 버턴 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-surface-container-high text-on-surface text-xs font-extrabold rounded-xl hover:bg-surface-container transition-all"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-on-primary text-xs font-extrabold rounded-xl hover:bg-primary/95 hover:shadow-md transition-all active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? '저장 중...' : '섹션 저장'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
export { PortfolioSectionEditor };

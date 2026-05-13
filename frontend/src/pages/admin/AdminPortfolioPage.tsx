import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, CheckCircle, AlertCircle, RefreshCw, Plus, Edit, Trash, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { getPortfolio, createPortfolioSection, updatePortfolioSection, deletePortfolioSection, reorderPortfolioSections } from '../../lib/portfolioApi';
import { LocaleTabs } from '../../components/admin/LocaleTabs';
import { PortfolioSectionEditor } from '../../components/admin/PortfolioSectionEditor';
import type { LocaleCode } from '../../types/profile';
import type { PortfolioSection } from '../../types/portfolio';

export default function AdminPortfolioPage() {
  const [locale, setLocale] = useState<LocaleCode>('ko');
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 편집/추가 모드 상태 관리
  const [editingSection, setEditingSection] = useState<Partial<PortfolioSection> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // 포트폴리오 목록 데이터 로드 함수
  const loadPortfolioData = useCallback(async (targetLocale: LocaleCode) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
    try {
      const res = await getPortfolio(targetLocale);
      setSections(res.sections || []);
    } catch (err: any) {
      console.error('Failed to load portfolio sections', err);
      setError(err?.message || '포트폴리오 섹션 리스트를 가져오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolioData(locale);
  }, [locale, loadPortfolioData]);

  // 추가/수정 저장 핸들러
  const handleSaveSection = async (payload: Partial<PortfolioSection>) => {
    setIsSaving(true);
    setSuccessMessage(null);
    setValidationErrors({});
    try {
      if (editingSection?.id) {
        // 1. 기존 항목 수정
        const updated = await updatePortfolioSection(editingSection.id, payload);
        setSections(sections.map((s) => (s.id === editingSection.id ? updated : s)));
        setSuccessMessage('포트폴리오 섹션이 성공적으로 수정되었습니다.');
      } else {
        // 2. 신규 생성
        const created = await createPortfolioSection({ ...payload, locale });
        setSections([...sections, created]);
        setSuccessMessage('신규 포트폴리오 섹션이 추가되었습니다.');
      }
      setEditingSection(null);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('Failed to save portfolio section', err);
      if (err?.response?.status === 400 && err?.response?.data?.details) {
        setValidationErrors(err.response.data.details);
        setError('입력 필드 유효성 검사를 확인해 주세요.');
      } else {
        setError(err?.response?.data?.message || err?.message || '저장 중 서버 에러가 발생했습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 삭제 제어 핸들러
  const handleDeleteSection = async (id: number) => {
    if (!window.confirm('정말 이 포트폴리오 섹션을 삭제하시겠습니까? 관련 이력 데이터가 모두 영구히 삭제됩니다.')) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    try {
      await deletePortfolioSection(id);
      setSections(sections.filter((s) => s.id !== id));
      setSuccessMessage('해당 포트폴리오 섹션이 완전히 삭제되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('Failed to delete section', err);
      setError(err?.message || '섹션 삭제 실패');
    }
  };

  // 노드 순서 재조정 (Up/Down) 핸들러
  const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) return;

    setError(null);
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[nextIndex];
    newSections[nextIndex] = temp;

    // 낙관적 UI 업데이트
    setSections(newSections);

    try {
      const ids = newSections.map((s) => s.id);
      await reorderPortfolioSections(ids);
    } catch (err: any) {
      console.error('Failed to reorder database sections', err);
      setError('서버 순서 변경 동기화에 실패했습니다.');
      // 롤백 로드
      loadPortfolioData(locale);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-body">
      {/* 1. 타이틀 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-on-surface tracking-tight">💼 포트폴리오 섹션 구성</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            이력서 탭 및 포트폴리오 퍼블릭 페이지에서 표현될 학력, 경력, 자격증, 관심 섹션을 관리하고 노출 순서를 정렬합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline-variant/30 hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface transition-all bg-white"
          >
            <span>내 포트폴리오 보기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => {
              setEditingSection({});
              setValidationErrors({});
              setError(null);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/95 transition-all shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>새 섹션 추가</span>
          </button>
        </div>
      </div>

      {/* 2. 다국어 제어 탭 */}
      {!editingSection && <LocaleTabs activeLocale={locale} onChange={setLocale} />}

      {/* 3. 알림 피드백 (성공 / 실패) */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl animate-fade-in text-xs font-semibold">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 text-red-800 border border-red-200 rounded-2xl animate-fade-in text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-800 font-bold hover:underline">
            닫기
          </button>
        </div>
      )}

      {/* 4. 편집 폼 영역 또는 리스트 뷰 영역 */}
      {editingSection ? (
        <PortfolioSectionEditor
          section={editingSection}
          onSave={handleSaveSection}
          onCancel={() => setEditingSection(null)}
          isSaving={isSaving}
          validationErrors={validationErrors}
        />
      ) : loading ? (
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">포트폴리오 섹션 정보를 가져오는 중입니다...</p>
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-white/70 border border-outline-variant/30 rounded-3xl p-16 text-center space-y-4 max-w-lg mx-auto">
          <div className="text-4xl animate-bounce">📁</div>
          <p className="text-sm text-on-surface-variant font-bold leading-relaxed">
            현재 {locale === 'ko' ? '한국어' : '영어'} 버전에 등록된 사용자 포트폴리오 섹션 정보가 비어있습니다.
          </p>
          <p className="text-xs text-on-surface-variant/70 leading-relaxed font-medium">
            우측 상단의 "새 섹션 추가" 버튼을 눌러 첫 포트폴리오 노드를 생성하거나, 퍼블릭 기본 템플릿 정보를 구경해 보세요.
          </p>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-surface-container/10 border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container/30 border-b border-outline-variant/40 font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-5 py-4 w-12 text-center">순서</th>
                  <th className="px-5 py-4 w-28">섹션 키</th>
                  <th className="px-5 py-4">섹션 제목</th>
                  <th className="px-5 py-4 w-24 text-center">공개</th>
                  <th className="px-5 py-4 w-20 text-center">아이템 수</th>
                  <th className="px-5 py-4 w-36 text-center">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 font-medium">
                {sections.map((sec, index) => (
                  <tr key={sec.id} className="hover:bg-surface-container/15 transition-all">
                    {/* 순서 조정 화살표 */}
                    <td className="px-5 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSection(index, 'up')}
                          className="p-1 rounded hover:bg-surface-container-high border border-outline-variant/30 bg-white disabled:opacity-40"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === sections.length - 1}
                          onClick={() => handleMoveSection(index, 'down')}
                          className="p-1 rounded hover:bg-surface-container-high border border-outline-variant/30 bg-white disabled:opacity-40"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* 섹션 고유 키 */}
                    <td className="px-5 py-4.5 font-bold text-primary">{sec.sectionKey}</td>

                    {/* 섹션 제목 */}
                    <td className="px-5 py-4.5 text-on-surface">
                      <div className="truncate max-w-xs font-bold">{sec.title}</div>
                      {sec.body && <div className="truncate max-w-xs text-[10px] text-on-surface-variant font-medium mt-0.5">{sec.body}</div>}
                    </td>

                    {/* 공개 여부 배지 */}
                    <td className="px-5 py-4.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
                          sec.isVisible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {sec.isVisible ? <Eye className="w-3 h-3 shrink-0" /> : <EyeOff className="w-3 h-3 shrink-0" />}
                        <span>{sec.isVisible ? '공개' : '숨김'}</span>
                      </span>
                    </td>

                    {/* 서브 아이템 수 */}
                    <td className="px-5 py-4.5 text-center font-bold text-on-surface-variant">
                      {sec.items ? sec.items.length : 0}개
                    </td>

                    {/* 편집 / 삭제 액션 */}
                    <td className="px-5 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSection(sec);
                            setValidationErrors({});
                            setError(null);
                          }}
                          className="p-1.5 border border-outline-variant/50 hover:border-primary hover:text-primary transition-all rounded-lg bg-white inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap"
                          title="수정"
                        >
                          <Edit className="w-3.5 h-3.5 shrink-0" />
                          <span>수정</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sec.id)}
                          className="p-1.5 border border-red-200 hover:bg-red-50 text-red-500 transition-all rounded-lg bg-white inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap"
                          title="삭제"
                        >
                          <Trash className="w-3.5 h-3.5 shrink-0" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export { AdminPortfolioPage };

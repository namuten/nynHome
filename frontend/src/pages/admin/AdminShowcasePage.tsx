import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, ArrowUp, ArrowDown, ExternalLink, RefreshCw, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { getShowcaseList, deleteShowcaseItem, reorderShowcaseItems } from '../../lib/showcaseApi';
import { LocaleTabs } from '../../components/admin/LocaleTabs';
import type { LocaleCode } from '../../types/profile';
import type { ShowcaseItem } from '../../types/showcase';

export default function AdminShowcasePage() {
  const navigate = useNavigate();
  const [locale, setLocale] = useState<LocaleCode>('ko');
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 데이터 목록 패치
  const loadShowcaseData = useCallback(async (targetLocale: LocaleCode) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getShowcaseList({ locale: targetLocale });
      setItems(res.items || []);
    } catch (err: any) {
      console.error(err);
      setError('쇼케이스 정보를 가져오는 과정에서 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShowcaseData(locale);
  }, [locale, loadShowcaseData]);

  // 작품 삭제 핸들러
  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('정말 이 쇼케이스 작품을 영구히 삭제하시겠습니까? 연결된 미디어 리스트와 포스트 구조가 분리됩니다.')) {
      return;
    }
    setError(null);
    setSuccessMessage(null);
    try {
      await deleteShowcaseItem(id);
      setItems(items.filter((item) => item.id !== id));
      setSuccessMessage('해당 쇼케이스 아카이브가 완전히 삭제되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setError('작품 삭제 실패');
    }
  };

  // 순서 상/하 조정 핸들러 (낙관적 UI 및 원격 동화 트랜잭션)
  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    setError(null);
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[nextIndex];
    newItems[nextIndex] = temp;

    // 낙관적 UI 렌더링
    setItems(newItems);

    try {
      const ids = newItems.map((item) => item.id);
      await reorderShowcaseItems(ids);
    } catch (err: any) {
      console.error(err);
      setError('정렬 상태 업데이트에 실패하여 이전 순서로 복구합니다.');
      loadShowcaseData(locale);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-body">
      {/* 1. 타이틀 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-on-surface tracking-tight">🎨 쇼케이스 아카이브 관리</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            나만의 고유 프로젝트 성과물, Three.js 3D 모형 연구실, 오픈소스 라이브러리 목록을 구성하고 순서를 정렬합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/portfolio"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline-variant/30 hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface bg-white transition-all"
          >
            <span>내 아카이브 보기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => navigate('/admin/showcase/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/95 transition-all shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>새 작품 등록</span>
          </button>
        </div>
      </div>

      {/* 2. 다국어 제어 탭 */}
      <LocaleTabs activeLocale={locale} onChange={setLocale} />

      {/* 3. 알림 메시지 피드백 */}
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

      {/* 4. 본체 리스트 영역 */}
      {loading ? (
        <div className="bg-white border border-outline-variant/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">쇼케이스 데이터 아카이브를 분석하는 중입니다...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white/70 border border-outline-variant/30 rounded-3xl p-16 text-center space-y-4 max-w-lg mx-auto">
          <div className="text-4xl animate-bounce">🎨</div>
          <p className="text-sm text-on-surface-variant font-bold leading-relaxed">
            현재 {locale === 'ko' ? '한국어' : '영어'} 버전에 동화된 쇼케이스 작품이 비어있습니다.
          </p>
          <p className="text-xs text-on-surface-variant/70 leading-relaxed font-medium">
            우측 상단의 "새 작품 등록" 버튼을 눌러 첫 웹 프로젝트, 3D 디자인 결과물을 세상에 보여주세요!
          </p>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-surface-container/10 border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container/30 border-b border-outline-variant/40 font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="px-5 py-4 w-12 text-center">순서</th>
                  <th className="px-5 py-4 w-28">카테고리</th>
                  <th className="px-5 py-4">작품 제목</th>
                  <th className="px-5 py-4 w-24 text-center">공개</th>
                  <th className="px-5 py-4 w-20 text-center">베스트</th>
                  <th className="px-5 py-4 w-36 text-center">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 font-medium">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-surface-container/15 transition-all">
                    {/* 순서 조정 */}
                    <td className="px-5 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveItem(index, 'up')}
                          className="p-1 rounded hover:bg-surface-container-high border border-outline-variant/30 bg-white disabled:opacity-40"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={() => handleMoveItem(index, 'down')}
                          className="p-1 rounded hover:bg-surface-container-high border border-outline-variant/30 bg-white disabled:opacity-40"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* 카테고리 */}
                    <td className="px-5 py-4.5 font-bold text-primary">{item.category}</td>

                    {/* 작품 제목 */}
                    <td className="px-5 py-4.5 text-on-surface">
                      <div className="truncate max-w-xs font-bold">{item.title}</div>
                      <div className="truncate max-w-xs text-[10px] text-on-surface-variant font-mono mt-0.5">
                        /{item.slug}
                      </div>
                    </td>

                    {/* 공개 여부 배지 */}
                    <td className="px-5 py-4.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap shrink-0 ${
                          item.isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {item.isPublished ? <Eye className="w-3 h-3 shrink-0" /> : <EyeOff className="w-3 h-3 shrink-0" />}
                        <span>{item.isPublished ? '공개' : '숨김'}</span>
                      </span>
                    </td>

                    {/* 베스트 추천 표시 */}
                    <td className="px-5 py-4.5 text-center">
                      {item.isFeatured ? (
                        <span className="inline-flex px-2 py-0.5 bg-amber-500 text-white rounded text-[9px] font-black shadow-sm whitespace-nowrap">
                          ⭐ BEST
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-on-surface-variant/40">-</span>
                      )}
                    </td>

                    {/* 액션 제어 */}
                    <td className="px-5 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/showcase/${item.id}/edit`)}
                          className="p-1.5 border border-outline-variant/50 hover:border-primary hover:text-primary transition-all rounded-lg bg-white inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap"
                        >
                          <Edit className="w-3.5 h-3.5 shrink-0" />
                          <span>수정</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 border border-red-200 hover:bg-red-50 text-red-500 transition-all rounded-lg bg-white inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap"
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
export { AdminShowcasePage };

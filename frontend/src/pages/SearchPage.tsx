import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import { SearchResultCard } from '../components/search/SearchResultCard';
import { Search, Compass, AlertCircle, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  // 실시간 입력 수정용 로컬 상태
  const [inputValue, setInputValue] = useState(queryParam);

  // 검색 필터 칩셋 상태
  // 'all' | 'post' | 'portfolio' | 'media'
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'post' | 'portfolio' | 'media'>('all');

  // API 쿼리 바인딩 대상 배열 맵핑
  const getTypesForApi = (): ('post' | 'image' | 'video' | 'portfolio')[] => {
    switch (selectedFilter) {
      case 'post':
        return ['post'];
      case 'portfolio':
        return ['portfolio'];
      case 'media':
        return ['image', 'video'];
      case 'all':
      default:
        return ['post', 'portfolio', 'image', 'video'];
    }
  };

  const [page, setPage] = useState(1);
  const types = getTypesForApi();

  // 검색 데이터 수집
  const { data, isLoading, isError } = useSearch(queryParam, types, page, 10);

  // 상단 URL 쿼리 파라미터가 바뀔 때 로컬 인풋 동기화
  useEffect(() => {
    setInputValue(queryParam);
    setPage(1); // 검색어가 바뀌면 1페이지로 강제 리셋
  }, [queryParam]);

  const handleFilterChange = (filter: 'all' | 'post' | 'portfolio' | 'media') => {
    setSelectedFilter(filter);
    setPage(1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed.length >= 2) {
      setSearchParams({ q: trimmed });
    }
  };

  const hasResults = data && data.results.length > 0;
  const isQueryTooShort = queryParam.trim().length < 2;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[70vh]">
      {/* 1. 타이틀 영역 */}
      <div className="text-left space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 flex items-center gap-2.5 tracking-tight">
          <Search className="w-7 h-7 text-violet-500 animate-pulse" />
          통합 검색 센터
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          크록허브의 블로그, 쇼케이스 프로젝트 및 미디어 자산을 한눈에 초고속으로 탐색합니다.
        </p>
      </div>

      {/* 2. 대형 메인 검색바 */}
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="검색어를 입력하고 엔터를 누르세요..."
            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-2xl pl-12 pr-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder-zinc-500 shadow-inner"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-violet-950/20 shrink-0"
        >
          검색 실행
        </button>
      </form>

      {/* 3. 필터 제어 칩셋 단락 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
          <span className="text-xs text-zinc-400 font-bold">카테고리 필터</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'post', 'portfolio', 'media'] as const).map((filter) => {
            const label = {
              all: '전체 소스',
              post: '블로그 게시글',
              portfolio: '쇼케이스',
              media: '미디어 자산',
            }[filter];

            const isActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-md shadow-violet-950/10'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 결과 출력 컨테이너 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <span className="text-xs sm:text-sm">서버 디렉토리를 구석구석 색인하는 중입니다...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400 bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
            <AlertCircle className="w-8 h-8" />
            <div className="text-center">
              <h4 className="text-sm font-bold">검색 연동 오류</h4>
              <p className="text-[11px] text-zinc-500 mt-1">네트워크 통신 상태 또는 세션 정합성을 확인해주세요.</p>
            </div>
          </div>
        ) : isQueryTooShort ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 gap-3 text-zinc-500 bg-zinc-900/20 border border-zinc-800/80 rounded-2xl p-8">
            <div className="p-3 bg-zinc-900 rounded-full border border-zinc-800">
              <Compass className="w-7 h-7 text-zinc-400 animate-spin" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-sm sm:text-base font-bold text-zinc-300">검색을 시작해볼까요?</h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                한글 형태소 정밀 매칭을 위해 **최소 2글자 이상**의 명확한 검색어를 입력해 주세요. (예: "크로", "가공")
              </p>
            </div>
          </div>
        ) : !hasResults ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 gap-3 text-zinc-500 bg-zinc-900/10 border border-zinc-850 rounded-2xl">
            <div className="p-3 bg-zinc-900 rounded-full border border-zinc-800">
              <Sparkles className="w-6 h-6 text-zinc-600" />
            </div>
            <div className="text-center">
              <h3 className="text-sm sm:text-base font-bold text-zinc-300">검색 결과를 찾지 못했습니다</h3>
              <p className="text-xs text-zinc-500 mt-1.5">
                검색어 **"{queryParam}"**와 완벽하게 부합하는 레코드가 없습니다. 단어 철자를 재정비하거나 필터 수단을 전체로 풀어 보세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* 상위 매칭 통계 */}
            <div className="text-left text-xs text-zinc-500 font-bold mb-1">
              총 <span className="text-zinc-300 font-extrabold">{data?.total}건</span>의 고해상도 매치 결과 접수 완료
            </div>

            {/* 카드 리스트 그리드 */}
            <div className="grid grid-cols-1 gap-3.5 animate-fade-in-up">
              {data?.results.map((item) => (
                <SearchResultCard key={`${item.type}_${item.id}`} item={item} />
              ))}
            </div>

            {/* 페이지네이션 버튼 컨트롤 */}
            {data && data.total > 10 && (
              <div className="flex justify-between items-center mt-6 pt-5 border-t border-zinc-800/50">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 disabled:opacity-40 rounded-xl text-xs font-bold transition-all hover:bg-zinc-800 hover:text-zinc-200"
                >
                  이전 페이지
                </button>
                <span className="text-xs text-zinc-500 font-medium">페이지 {page}</span>
                <button
                  disabled={page * 10 >= data.total}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-400 disabled:opacity-40 rounded-xl text-xs font-bold transition-all hover:bg-zinc-800 hover:text-zinc-200"
                >
                  다음 페이지
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
export default SearchPage;

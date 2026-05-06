import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Sliders, HelpCircle, ArrowUp, ArrowDown, Eye, EyeOff, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { LayoutSection } from '../../types/admin';

// 섹션 키 한글 매핑 도구
const SECTION_NAMES: Record<string, { title: string; desc: string }> = {
  hero: { title: '메인 추천 포스트 (Hero)', desc: '홈 화면 가장 최상단에 대형 슬라이드로 강조 노출할 대표 글들을 선정합니다.' },
  creative: { title: '창작 & 영감 섹션 (Creative)', desc: '창작물 카테고리 게시물 중 홈 화면에 가로 스크롤로 매핑해 보여줄 추천 글입니다.' },
  blog: { title: '일반 블로그 섹션 (Blog)', desc: '일상, 소식, 리뷰 등 일반 블로그 카테고리에서 우선 배치할 리스트입니다.' },
  study: { title: '학습 & 연구 섹션 (Study)', desc: '학습/TIL 기록 카테고리에서 홈 화면에 바인딩할 추천 리스트입니다.' },
};

/**
 * AdminLayoutPage - 홈 화면 섹션 배치 편집 페이지
 * - 실시간 순서 변경(Up/Down), 노출 토글(isVisible), 추천 게시물 아이디 목록(postIds) 세부 제어 기능 제공
 * - 데이터 트랜잭션 저장(PUT /layout) 및 실시간 유효성 피드백 지원
 */
export default function AdminLayoutPage() {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<LayoutSection[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. 레이아웃 데이터 가져오기
  const { data: layoutData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'layout'],
    queryFn: () => adminApi.getAdminLayout(),
  });

  // 레이아웃 데이터 로드 시 로컬 상태 초기화
  useEffect(() => {
    if (layoutData) {
      // 정렬 보장
      const sorted = [...layoutData].sort((a, b) => a.order - b.order);
      setSections(sorted);
    }
  }, [layoutData]);

  // 2. 레이아웃 저장 뮤테이션
  const saveMutation = useMutation({
    mutationFn: (payload: LayoutSection[]) => adminApi.updateAdminLayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'layout'] });
      setSuccessMessage('홈 레이아웃 배치 정보가 안전하게 저장 및 홈 화면에 실시간 반영되었습니다!');
      setErrorMessage(null);
      // 5초 후 알림 숨김
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (err: any) => {
      console.error(err);
      if (err.response?.data?.error === 'INVALID_POST_IDS' || err.message?.includes('INVALID_POST_IDS')) {
        setErrorMessage('저장에 실패했습니다: 존재하지 않는 게시글 ID가 포함되어 있습니다. 등록된 실제 글의 ID를 다시 한 번 확인해 주세요.');
      } else {
        setErrorMessage(err.message || '레이아웃 설정을 저장하는 도중 알 수 없는 오류가 발생했습니다.');
      }
      setSuccessMessage(null);
    },
  });

  // 순서 위로 변경 (index - 1)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    // 스왑
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    
    // order 필드 갱신
    const finalized = newSections.map((s, idx) => ({ ...s, order: idx }));
    setSections(finalized);
  };

  // 순서 아래로 변경 (index + 1)
  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    // 스왑
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    
    // order 필드 갱신
    const finalized = newSections.map((s, idx) => ({ ...s, order: idx }));
    setSections(finalized);
  };

  // 노출 여부 토글
  const handleToggleVisibility = (index: number) => {
    const newSections = [...sections];
    newSections[index].isVisible = !newSections[index].isVisible;
    setSections(newSections);
  };

  // 게시글 ID 텍스트 입력값 변경 처리
  const handlePostIdsTextChange = (index: number, text: string) => {
    // 숫자와 쉼표만 남겨둔 다음 파싱
    const cleanText = text.replace(/[^0-9, ]/g, '');
    const newSections = [...sections];
    
    // 쉼표 분할 후 빈 문자열 거르고 숫자로 파싱
    const parsedIds = cleanText
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));

    // 로컬 표시 및 바디에 반영할 수 있도록 임시 string 저장은 input 전용 local state로 분리하거나
    // sections 내에 raw string 버퍼 필드를 두어 자유로운 타이핑 보장 가능
    // 여기서는 간단하고 강건하게 수치 배열로 실시간 연동하되, 타이핑 버벅임을 막기 위해 ID 배열을 직접 업데이트
    newSections[index].postIds = parsedIds;
    setSections(newSections);
  };

  // 최종 저장 요청 전면 유효성 검증
  const handleSaveAll = () => {
    // 쉼표 파싱은 실시간 입력 시 처리되어 있으므로 즉시 갱신 전송
    saveMutation.mutate(sections);
  };

  // 수동 동기화 새로고침
  const handleRefresh = () => {
    refetch();
    setSuccessMessage('서버에 등록된 레이아웃 정보를 다시 로드하였습니다.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 font-body animate-fade-in">
      {/* 타이틀 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-container pb-5">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight flex items-center gap-2">
            <Sliders className="w-8 h-8 text-primary" />
            홈 레이아웃 편집
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            홈 화면에 노출될 각 섹션들의 상하 순서를 스왑하고, 특정 섹션을 숨기거나 각 위치에 매핑할 게시글 ID를 수동 지정합니다.
          </p>
        </div>

        {/* 제어 상단 액션 바 */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl border border-surface-container bg-white text-on-surface-variant hover:bg-surface-container transition"
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            동기화
          </button>
          
          <button
            onClick={handleSaveAll}
            disabled={saveMutation.isPending || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl bg-primary text-white hover:bg-primary-container hover:text-primary shadow-sm hover:shadow transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? '저장 처리 중...' : '배치 정보 저장'}
          </button>
        </div>
      </div>

      {/* 상태 피드백 알림 배너 */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs font-bold leading-relaxed">{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs font-bold leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* 실시간 편집 지침 */}
      <div className="p-4 bg-surface-container/20 rounded-2xl border border-surface-container/40 flex gap-2 text-on-surface-variant max-w-3xl">
        <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold">💡 홈 화면 레이아웃 편집 길잡이</p>
          <ul className="text-[10px] list-disc pl-4 space-y-1 font-medium leading-relaxed">
            <li>각 섹션 카드 우측의 <b>위/아래 화살표</b>를 통해 홈 화면상 노출될 섹션의 상하 노출 순서를 편리하게 바꿀 수 있습니다.</li>
            <li><b>노출 상태 제어 (눈동자 아이콘)</b>를 클릭하면, 섹션을 완전히 비활성화(숨김) 처리하여 홈 화면에서 감춥니다.</li>
            <li><b>게시물 지정 ID</b> 항목에는 노출하려는 실제 글의 고유 ID 숫자를 콤마(,)로만 분할해 입력하세요. (예: <code className="bg-surface-container px-1 py-0.5 rounded text-primary font-bold">12, 15, 23</code>)</li>
          </ul>
        </div>
      </div>

      {/* 로딩 / 메인 리스트 배치 */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-surface-container/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-surface-container shadow-sm">
          <AlertCircle className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
          <p className="text-xs text-on-surface-variant font-bold">등록된 레이아웃 데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {sections.map((section, index) => {
            const meta = SECTION_NAMES[section.sectionKey] || {
              title: `알 수 없는 섹션 (${section.sectionKey})`,
              desc: '등록된 정보가 없는 사용자 정의 레이아웃 섹션입니다.',
            };

            return (
              <div
                key={section.sectionKey}
                className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
                  section.isVisible
                    ? 'bg-white border-surface-container shadow-sm hover:shadow-md'
                    : 'bg-surface-container/20 border-surface-container/40 opacity-75'
                }`}
              >
                {/* 왼쪽: 순번 및 텍스트 정보 */}
                <div className="flex gap-4 items-start min-w-0 flex-1">
                  {/* 순서 넘버 배지 */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black select-none shrink-0 border ${
                    section.isVisible
                      ? 'bg-primary/5 border-primary/20 text-primary'
                      : 'bg-surface-container-high border-surface-container-highest text-on-surface-variant'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 truncate">
                      {meta.title}
                      {!section.isVisible && (
                        <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[9px] font-black border border-red-100 uppercase tracking-wider select-none animate-fade-in">
                          비활성
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed block max-w-2xl">
                      {meta.desc}
                    </p>

                    {/* 게시물 추천 글 ID 세부 조작 인풋 필드 */}
                    <div className="pt-2 flex flex-col md:flex-row md:items-center gap-2">
                      <span className="text-[10px] font-bold text-on-surface-variant/80 select-none shrink-0">
                        📌 배치 게시글 ID 리스트 :
                      </span>
                      <input
                        type="text"
                        placeholder="콤마로 구분된 게시글 ID 입력... (예: 1, 3, 5)"
                        value={section.postIds.join(', ')}
                        onChange={(e) => handlePostIdsTextChange(index, e.target.value)}
                        className="flex-1 md:max-w-xs px-3 py-1.5 bg-surface-container/20 border border-surface-container rounded-xl text-xs font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition leading-relaxed"
                      />
                      <span className="text-[9px] font-semibold text-primary select-none shrink-0">
                        (총 {section.postIds.length}개 배치 중)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 오른쪽: 조작 기기 제어 그룹 */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-surface-container/50 pt-3 sm:pt-0 shrink-0">
                  {/* 노출 토글 버튼 (눈동자) */}
                  <button
                    onClick={() => handleToggleVisibility(index)}
                    className={`p-2 rounded-xl border transition-all shadow-sm ${
                      section.isVisible
                        ? 'border-surface-container bg-white text-on-surface-variant hover:bg-surface-container'
                        : 'border-blue-100 bg-blue-50/70 text-blue-600 hover:bg-blue-100'
                    }`}
                    title={section.isVisible ? '홈 화면에서 감추기' : '홈 화면에 노출하기'}
                  >
                    {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* 순서 위로 스왑 (Up) */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-xl border border-surface-container bg-white text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                    title="한 단계 위로 이동"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* 순서 아래로 스왑 (Down) */}
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sections.length - 1}
                    className="p-2 rounded-xl border border-surface-container bg-white text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
                    title="한 단계 아래로 이동"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

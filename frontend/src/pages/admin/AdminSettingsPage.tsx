import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Settings, Image, Video, Music, FileText, FileCode, CheckCircle2, AlertCircle, Save, Sliders, ShieldAlert } from 'lucide-react';
import type { MediaTypeConfig } from '../../types/admin';

// 카테고리 한글 명칭 정의
const CATEGORY_NAMES: Record<string, string> = {
  all: '전체 설정',
  image: '이미지',
  video: '비디오',
  audio: '오디오',
  document: '문서',
  other: '기타 미디어',
};

/**
 * AdminSettingsPage - 미디어 타입 업로드 정책 제어 어드민 페이지
 * - 전체 확장자 MimeType별 업로드 가능 여부 토글
 * - 최대 허용 용량(maxSizeMb) 제한 개별 설정 및 트랜잭션 업데이트 지원
 * - 카테고리 그룹화 필터 탭 레이아웃 적용
 */
export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // 로컬 변경값 임시 버퍼 관리 상태
  const [localConfigs, setLocalConfigs] = useState<MediaTypeConfig[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. 미디어 설정 목록 가져오기
  const { data: configsData = [], isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'media-types'],
    queryFn: () => adminApi.getAdminMediaTypes(),
  });

  // 데이터 변경 시 로컬 복사 상태 동기화
  useEffect(() => {
    if (configsData) {
      setLocalConfigs(JSON.parse(JSON.stringify(configsData)));
    }
  }, [configsData]);

  // 2. 미디어 타입 개별 수정 뮤테이션
  const updateMutation = useMutation({
    mutationFn: ({ id, isAllowed, maxSizeMb }: { id: number; isAllowed: boolean; maxSizeMb: number }) =>
      adminApi.updateAdminMediaType(id, { isAllowed, maxSizeMb }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media-types'] });
      setSuccessMessage('업로드 정책 및 용량 제한 설정이 서버에 실시간 반영되었습니다!');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (err: any) => {
      console.error(err);
      setErrorMessage(err.message || '정책을 수정하는 도중 서버 오류가 발생했습니다.');
      setSuccessMessage(null);
    },
  });

  // 로컬 허용 여부 토글
  const handleToggleAllowed = (id: number) => {
    setLocalConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, isAllowed: !c.isAllowed } : c))
    );
  };

  // 로컬 최대 용량 변경
  const handleSizeChange = (id: number, val: string) => {
    const size = parseInt(val, 10);
    if (isNaN(size) || size < 1) return;
    setLocalConfigs(prev =>
      prev.map(c => (c.id === id ? { ...c, maxSizeMb: size } : c))
    );
  };

  // 규칙 최종 저장 통신
  const handleSaveConfig = (id: number) => {
    const target = localConfigs.find(c => c.id === id);
    if (!target) return;
    updateMutation.mutate({
      id: target.id,
      isAllowed: target.isAllowed,
      maxSizeMb: target.maxSizeMb,
    });
  };

  // 아이콘 맵 헬퍼
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <Image className="w-4 h-4 text-emerald-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-violet-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <FileCode className="w-4 h-4 text-gray-500" />;
    }
  };

  // 탭 필터링 수행
  const filteredConfigs = localConfigs.filter(
    c => activeTab === 'all' || c.fileCategory === activeTab
  );

  return (
    <div className="space-y-6 font-body animate-fade-in pb-12">
      {/* 타이틀 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-container pb-5">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight flex items-center gap-2.5">
            <Settings className="w-8 h-8 text-primary" />
            어드민 환경 설정
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            미디어 라이브러리 업로드 가능 확장자 관리 및 파일 타입별 최대 용량(MB) 제한 정책을 신속하게 제어합니다.
          </p>
        </div>
      </div>

      {/* 상태 알림 피드백 */}
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

      {/* 가이드 배너 */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-2.5 max-w-4xl text-amber-900 leading-relaxed">
        <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[11px] font-bold">⚠️ 파일 업로드 보안 & 트래픽 주의사항</p>
          <ul className="text-[10px] list-disc pl-4 space-y-1 font-medium">
            <li>특정 확장자 업로드를 허용하지 않으려면 <b>&apos;허용 여부&apos;</b> 토글을 비활성화하세요. (비활성 확장자는 업로드 시 원천 차단됩니다)</li>
            <li>동영상 및 고화질 오디오 업로드의 최대 크기가 너무 높을 경우, AWS S3 요금 폭탄이나 서버 네트워크 지연이 생길 수 있으니 권장 크기를 준수하십시오.</li>
          </ul>
        </div>
      </div>

      {/* 미디어 유형 카테고리 탭 리스트 */}
      <div className="flex items-center gap-2 border-b border-surface-container overflow-x-auto pb-1.5 custom-scrollbar select-none">
        {['all', 'image', 'video', 'audio', 'document', 'other'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/30'
            }`}
          >
            {CATEGORY_NAMES[tab]}
          </button>
        ))}
      </div>

      {/* 로딩 / 그리드 목록 */}
      {isLoading || isFetching ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-surface-container/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredConfigs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-surface-container p-12 text-center text-on-surface-variant/50 max-w-2xl mx-auto">
          <Sliders className="w-10 h-10 mx-auto mb-3" />
          <p className="text-xs font-bold">지정된 탭 카테고리에 해당하는 설정 레코드가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
          {filteredConfigs.map((config) => {
            const isChanged =
              configsData.find(c => c.id === config.id)?.isAllowed !== config.isAllowed ||
              configsData.find(c => c.id === config.id)?.maxSizeMb !== config.maxSizeMb;

            return (
              <div
                key={config.id}
                className={`p-5 rounded-3xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                  config.isAllowed
                    ? 'bg-white border-surface-container shadow-sm hover:shadow-md'
                    : 'bg-surface-container/20 border-surface-container/40 opacity-70'
                }`}
              >
                {/* 왼쪽: 미디어 아이콘 및 상세 사양 */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0 border border-surface-container-high shadow-inner">
                    {getCategoryIcon(config.fileCategory)}
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-on-surface flex items-center gap-2 truncate">
                      {config.mimeType}
                      {!config.isAllowed && (
                        <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded text-[8px] font-black border border-red-100">
                          차단됨
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant font-bold capitalize mt-0.5">
                      대분류: {CATEGORY_NAMES[config.fileCategory] || config.fileCategory}
                    </p>
                  </div>
                </div>

                {/* 오른쪽: 조작 바 (허용 여부 토글, 크기 입력 및 저장) */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* 허용 유무 체크 토글 스위치 */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-extrabold text-on-surface-variant select-none">
                      허용 :
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleAllowed(config.id)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors relative ${
                        config.isAllowed ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                          config.isAllowed ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 최대 용량 숫자 입력창 */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={config.maxSizeMb}
                      onChange={(e) => handleSizeChange(config.id, e.target.value)}
                      disabled={!config.isAllowed}
                      className="w-14 px-2 py-1.5 bg-surface-container/30 border border-surface-container rounded-xl text-center text-xs font-black text-on-surface focus:outline-none focus:border-primary disabled:opacity-40 transition"
                      min={1}
                    />
                    <span className="text-[9px] font-extrabold text-on-surface-variant select-none">
                      MB
                    </span>
                  </div>

                  {/* 변경 사항 저장 단추 (수정이 발생했을 때만 활성화 및 강조) */}
                  <button
                    onClick={() => handleSaveConfig(config.id)}
                    disabled={!isChanged || updateMutation.isPending}
                    className={`p-2 rounded-xl transition shadow-sm ${
                      isChanged
                        ? 'bg-primary text-white hover:bg-primary-container hover:text-primary animate-pulse'
                        : 'border border-surface-container bg-white text-on-surface-variant/40 hover:text-on-surface-variant disabled:cursor-not-allowed'
                    }`}
                    title="이 확장자 정책 개별 저장"
                  >
                    <Save className="w-3.5 h-3.5" />
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

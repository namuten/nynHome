import { useState, useEffect } from 'react';
import { Save, Info, Globe, Eye, AlertCircle } from 'lucide-react';
import type { SeoSettings } from '../../types/seo';

interface SeoSettingsFormProps {
  initialValues: SeoSettings;
  onSubmit: (data: Partial<SeoSettings>) => Promise<void>;
  routeKey: string;
}

export default function SeoSettingsForm({ initialValues, onSubmit, routeKey }: SeoSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [activeTab, setActiveTab] = useState<'kakao' | 'discord' | 'twitter'>('kakao');

  useEffect(() => {
    setTitle(initialValues.title || '');
    setDescription(initialValues.description || '');
    setOgImageUrl(initialValues.ogImageUrl || '');
    setKeywordsInput(initialValues.keywords ? initialValues.keywords.join(', ') : '');
    setSuccess(false);
    setErrorMsg(null);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMsg(null);

    const parsedKeywords = keywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const payload: Partial<SeoSettings> = {
      title: title.trim(),
      description: description.trim() || null,
      ogImageUrl: ogImageUrl.trim() || null,
      keywords: parsedKeywords,
      locale: initialValues.locale,
    };

    try {
      await onSubmit(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'SEO 설정 저장 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in font-body">
      {/* 1. 좌측 입력 폼 (3/5 너비) */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white/95 border border-outline-variant/30 rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-black text-on-surface uppercase tracking-wider">
            🌐 {routeKey.toUpperCase()} SEO 메타 설정 편집
          </h2>
        </div>

        {/* 성공/에러 피드백 */}
        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold">
            🎉 해당 라우트의 SEO 메타데이터 설정이 성공적으로 갱신되었습니다!
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* 타이틀 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">메타 타이틀 (Meta Title) *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: CrocHub | 크록허브 개발자 포트폴리오"
              className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary transition"
            />
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
              <span>검색 결과 제목 영역에 노출됩니다. (권장: 50~60자 내외)</span>
              <span className={title.length > 180 ? 'text-red-500 font-bold' : ''}>{title.length}/180 자</span>
            </div>
          </div>

          {/* 디스크립션 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">메타 설명 (Meta Description)</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 크록허브의 최신 개발 성과물, 풀스택 웹 어플리케이션 및 3D WebGL 엔진 소스 연구소..."
              className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-medium focus:outline-none focus:border-primary transition leading-relaxed"
            />
            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
              <span>구글/네이버 등에서 검색 노출 설명글로 쓰입니다. (권장: 110~150자)</span>
              <span className={description.length > 300 ? 'text-red-500 font-bold' : ''}>{description.length}/300 자</span>
            </div>
          </div>

          {/* 오픈그래프 이미지 URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">오픈그래프 대표 이미지 URL (OG Image URL)</label>
            <input
              type="text"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
              placeholder="예: https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800"
              className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary transition font-mono text-[10px]"
            />
            <p className="text-[10px] text-on-surface-variant font-medium leading-normal">
              SNS 공유 시 노출될 대표 썸네일 이미지 절대 URL 주소를 기입해 주세요. (가로 1200px x 세로 630px 규격 권장)
            </p>
          </div>

          {/* 키워드 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">검색 키워드 (Keywords)</label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="예: 개발자, 포트폴리오, WebGL, React (쉼표로 구분)"
              className="w-full px-4 py-3 bg-white border border-outline-variant/50 rounded-2xl text-xs font-semibold focus:outline-none focus:border-primary transition"
            />
            <p className="text-[10px] text-on-surface-variant font-medium">
              웹 크롤러 로봇에게 페이지 주제에 관한 키워드를 수집할 단서 목록을 쉼표 단위로 제공합니다.
            </p>
          </div>
        </div>

        {/* 저장 제출 버튼 */}
        <div className="border-t border-outline-variant/20 pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary hover:bg-primary/95 text-on-primary text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '저장 중...' : 'SEO 설정 변경 사항 저장'}</span>
          </button>
        </div>
      </form>

      {/* 2. 우측 SNS 실시간 렌더링 미리보기 카드 (2/5 너비) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/90 border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
            <Eye className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-xs font-black text-on-surface uppercase tracking-wider select-none">
              📱 SNS 공유 실시간 시뮬레이션
            </h3>
          </div>

          {/* 소셜 채널 탭 제어 */}
          <div className="flex border-b border-outline-variant/20">
            {(['kakao', 'discord', 'twitter'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-2.5 text-center text-[10px] font-bold capitalize border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-primary text-primary font-extrabold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab === 'kakao' ? 'KakaoTalk' : tab === 'discord' ? 'Discord/Slack' : 'Twitter (X)'}
              </button>
            ))}
          </div>

          {/* 탭 본문 뷰 */}
          <div className="space-y-4 animate-fade-in select-none">
            {/* KakaoTalk 시뮬레이터 */}
            {activeTab === 'kakao' && (
              <div className="p-4 bg-[#f2f2f2] rounded-2xl space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-400 shrink-0 text-amber-900 flex items-center justify-center font-bold text-[10px]">
                    K
                  </div>
                  <div className="p-3 bg-white border border-[#dedede] rounded-tr-xl rounded-b-xl max-w-[210px] space-y-2 shadow-sm">
                    {ogImageUrl && ogImageUrl.startsWith('http') ? (
                      <img
                        src={ogImageUrl}
                        alt="Preview"
                        className="w-full aspect-[1.91/1] object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full aspect-[1.91/1] bg-surface-container rounded-md flex items-center justify-center text-[9px] font-bold text-on-surface-variant/40">
                        기본 OG 로고
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-extrabold text-[#333] truncate leading-tight">
                        {title || 'CrocHub | 개발자 포트폴리오'}
                      </div>
                      <div className="text-[8px] text-[#888] line-clamp-2 leading-relaxed">
                        {description || '크록허브의 고품격 웹 개발 성과, 3D WebGL 연구소 테크 블로그.'}
                      </div>
                      <div className="text-[7px] text-[#aaa] font-semibold pt-1">
                        crochub.dev
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Discord/Slack 시뮬레이터 */}
            {activeTab === 'discord' && (
              <div className="bg-[#2f3136] p-4 rounded-2xl text-white space-y-3 font-sans">
                <div className="text-[10px] font-semibold text-[#8e9297]">
                  Antigravity Bot <span className="bg-[#5865f2] text-white text-[8px] px-1 py-0.5 rounded font-bold ml-1">앱</span>
                </div>
                <div className="border-l-4 border-primary bg-[#202225] p-3 rounded-md space-y-2.5 max-w-sm">
                  <div className="text-[8px] text-[#00b0f4] font-semibold tracking-wide">
                    CrocHub Developer Link
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-white hover:underline cursor-pointer">
                      {title || 'CrocHub | 개발자 포트폴리오'}
                    </div>
                    <div className="text-[9px] text-[#dcddde] line-clamp-2 leading-relaxed font-medium">
                      {description || '크록허브의 고품격 웹 개발 성과, 3D WebGL 연구소 테크 블로그.'}
                    </div>
                  </div>
                  {ogImageUrl && ogImageUrl.startsWith('http') && (
                    <img
                      src={ogImageUrl}
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Twitter/X 시뮬레이터 */}
            {activeTab === 'twitter' && (
              <div className="bg-black p-4 rounded-2xl border border-zinc-800 text-white space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-xs">
                    𝕏
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-zinc-100">CrocHub</div>
                    <div className="text-[8px] text-zinc-500">@crochub_dev</div>
                  </div>
                </div>
                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                  {ogImageUrl && ogImageUrl.startsWith('http') ? (
                    <img
                      src={ogImageUrl}
                      alt="Preview"
                      className="w-full aspect-[1.91/1] object-cover border-b border-zinc-800"
                    />
                  ) : (
                    <div className="w-full aspect-[1.91/1] bg-zinc-900 border-b border-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-600">
                      대표 썸네일 이미지 없음
                    </div>
                  )}
                  <div className="p-3 space-y-1 select-none">
                    <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">
                      crochub.dev
                    </div>
                    <div className="text-[10px] font-bold text-zinc-100 truncate">
                      {title || 'CrocHub | 개발자 포트폴리오'}
                    </div>
                    <div className="text-[9px] text-zinc-400 line-clamp-1 leading-normal font-medium">
                      {description || '크록허브의 고품격 웹 개발 성과, 3D WebGL 연구소 테크 블로그.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 어드민 팁 패널 */}
        <div className="p-5 bg-primary/5 border border-primary/20 rounded-3xl flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-extrabold text-on-surface">💡 SEO 최적화 어드바이스</h4>
            <ul className="list-disc list-inside space-y-1 text-on-surface-variant font-medium text-[10px] leading-relaxed">
              <li>**메타 타이틀**: 검색 사용자의 이목을 끌 수 있는 핵심 슬로건이 앞쪽에 위치할수록 좋습니다.</li>
              <li>**메타 디스크립션**: 본문의 성격을 축약하면서 독자가 호기심을 갖고 클릭할 수 있도록 명료하게 작성해 주세요.</li>
              <li>**키워드(Keywords)**: 너무 많은 단어를 쉼표로 나열하기보단, 사이트 본질에 집중된 핵심 5~7개 단어 선정이 이상적입니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
export { SeoSettingsForm };

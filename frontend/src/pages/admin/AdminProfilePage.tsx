import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getProfile, updateAdminProfile } from '../../lib/profileApi';
import { LocaleTabs } from '../../components/admin/LocaleTabs';
import { ProfileEditorForm } from '../../components/admin/ProfileEditorForm';
import type { LocaleCode, ProfileSettings } from '../../types/profile';

export default function AdminProfilePage() {
  const [locale, setLocale] = useState<LocaleCode>('ko');
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 성공 알림 및 에러 상태 관리
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // 프로필 데이터 로드 함수
  const loadProfile = useCallback(async (targetLocale: LocaleCode) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});
    try {
      const data = await getProfile(targetLocale);
      setProfile(data);
    } catch (err: any) {
      console.error('Failed to load profile for admin', err);
      setError(err?.message || '프로필 정보를 로드하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile(locale);
  }, [locale, loadProfile]);

  // 프로필 수정 핸들러
  const handleSave = async (payload: Partial<ProfileSettings>) => {
    setIsSaving(true);
    setSuccessMessage(null);
    setValidationErrors({});
    try {
      const updated = await updateAdminProfile(locale, payload);
      setProfile(updated);
      setSuccessMessage(`${locale === 'ko' ? '한국어' : '영어'} 프로필 정보가 성공적으로 반영되었습니다!`);
      
      // 3초 후 성공 알림 사라지게 처리
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to save profile', err);
      // 백엔드 검증 실패(Zod validation)인 경우 details 파싱
      if (err?.response?.status === 400 && err?.response?.data?.details) {
        setValidationErrors(err.response.data.details);
        setError('입력 필드 값을 확인해주세요.');
      } else {
        setError(err?.response?.data?.message || err?.message || '프로필 저장 중 서버 에러가 발생했습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl font-body">
      {/* 타이틀 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-on-surface tracking-tight">👤 개인 브랜딩 및 프로필 설정</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            방문자에게 보여줄 다국어 프로필, 보유 기술 및 타임라인 이력을 상세히 구성합니다.
          </p>
        </div>

        {/* 퍼블릭 페이지 미리보기 바로가기 */}
        <Link
          to="/profile"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary/20 hover:bg-primary/5 rounded-xl text-xs font-bold text-primary transition-all self-start sm:self-center bg-white shadow-sm"
        >
          <span>내 퍼블릭 프로필 보기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 로케일 선택 탭 컴포넌트 */}
      <LocaleTabs activeLocale={locale} onChange={setLocale} />

      {/* 상태 피드백 알림 (성공 / 에러) */}
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
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-800 font-bold hover:underline hover:text-red-950"
          >
            닫기
          </button>
        </div>
      )}

      {/* 편집 로딩 시 스피너 */}
      {loading ? (
        <div className="bg-white dark:bg-surface-container/20 border border-outline-variant/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">프로필 설정을 가져오는 중입니다...</p>
        </div>
      ) : (
        profile && (
          <div className="animate-fade-in">
            <ProfileEditorForm
              initialData={profile}
              onSave={handleSave}
              isSaving={isSaving}
              validationErrors={validationErrors}
            />
          </div>
        )
      )}
    </div>
  );
}
export { AdminProfilePage };

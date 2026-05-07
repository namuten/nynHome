import { useState, useEffect } from 'react';
import { Trash, ArrowUp, ArrowDown, Save, Link as LinkIcon, Sparkles } from 'lucide-react';
import type { ProfileSettings, AchievementItem } from '../../types/profile';

interface ProfileEditorFormProps {
  initialData: ProfileSettings;
  onSave: (payload: Partial<ProfileSettings>) => Promise<void>;
  isSaving: boolean;
  validationErrors?: Record<string, string[]>;
}

export default function ProfileEditorForm({
  initialData,
  onSave,
  isSaving,
  validationErrors = {},
}: ProfileEditorFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [school, setSchool] = useState('');
  const [location, setLocation] = useState('');
  const [emailPublic, setEmailPublic] = useState('');

  // 복잡한 필드들 (socialLinks, interests, skills, achievements)
  const [socialLinks, setSocialLinks] = useState<Array<{ key: string; value: string }>>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  // 임시 입력 값들
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newSocialKey, setNewSocialKey] = useState('');
  const [newSocialValue, setNewSocialValue] = useState('');

  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchDesc, setNewAchDesc] = useState('');
  const [newAchDate, setNewAchDate] = useState('');

  // 데이터 로드 시 값 셋팅
  useEffect(() => {
    if (initialData) {
      setDisplayName(initialData.displayName || '');
      setTagline(initialData.tagline || '');
      setBio(initialData.bio || '');
      setAvatarUrl(initialData.avatarUrl || '');
      setCoverImageUrl(initialData.coverImageUrl || '');
      setSchool(initialData.school || '');
      setLocation(initialData.location || '');
      setEmailPublic(initialData.emailPublic || '');

      const socialArray = initialData.socialLinks
        ? Object.entries(initialData.socialLinks).map(([key, value]) => ({ key, value }))
        : [];
      setSocialLinks(socialArray);

      setInterests(initialData.interests || []);
      setSkills(initialData.skills || []);
      setAchievements(initialData.achievements || []);
    }
  }, [initialData]);

  // 저장 요청 조립
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // socialArray를 JSON Object로 변환
    const linksObj: Record<string, string> = {};
    socialLinks.forEach((item) => {
      if (item.key && item.value) {
        linksObj[item.key] = item.value;
      }
    });

    onSave({
      displayName,
      tagline: tagline || null,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      coverImageUrl: coverImageUrl || null,
      school: school || null,
      location: location || null,
      emailPublic: emailPublic || null,
      socialLinks: linksObj,
      interests,
      skills,
      achievements,
    });
  };

  // 소셜 링크 추가/삭제
  const addSocialLink = () => {
    if (newSocialKey && newSocialValue) {
      setSocialLinks([...socialLinks, { key: newSocialKey, value: newSocialValue }]);
      setNewSocialKey('');
      setNewSocialValue('');
    }
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // 관심 분야 추가/삭제
  const addInterest = () => {
    if (newInterest.trim()) {
      if (!interests.includes(newInterest.trim())) {
        setInterests([...interests, newInterest.trim()]);
      }
      setNewInterest('');
    }
  };

  const removeInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  // 기술 분야 추가/삭제
  const addSkill = () => {
    if (newSkill.trim()) {
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const removeSkill = (item: string) => {
    setSkills(skills.filter((i) => i !== item));
  };

  // 수상 및 대외활동 이력 추가/삭제/정렬
  const addAchievement = () => {
    if (newAchTitle.trim()) {
      setAchievements([
        ...achievements,
        {
          title: newAchTitle.trim(),
          description: newAchDesc.trim() || undefined,
          date: newAchDate.trim() || undefined,
        },
      ]);
      setNewAchTitle('');
      setNewAchDesc('');
      setNewAchDate('');
    }
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const moveAchievement = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= achievements.length) return;
    const newAchievements = [...achievements];
    const temp = newAchievements[index];
    newAchievements[index] = newAchievements[nextIndex];
    newAchievements[nextIndex] = temp;
    setAchievements(newAchievements);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-body">
      {/* 1. 기본 프로필 정보 카드 */}
      <div className="bg-white/75 dark:bg-surface-container/20 border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          기본 인적 정보 및 소개
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-on-surface-variant">이름 / 닉네임 *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50"
              placeholder="예: 홍길동"
            />
            {validationErrors.displayName && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.displayName.join(', ')}</p>
            )}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-on-surface-variant">한줄 요약 (Tagline)</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50"
              placeholder="예: 예술과 기술을 융합하는 크리에이티브 개발자"
            />
            {validationErrors.tagline && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.tagline.join(', ')}</p>
            )}
          </div>

          <div className="space-y-1.5 col-span-1 md:col-span-2">
            <label className="text-xs font-bold text-on-surface-variant">자기소개 본문 (Bio)</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50 resize-none leading-relaxed"
              placeholder="자기소개를 자유롭게 상세히 적어주세요."
            />
            {validationErrors.bio && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.bio.join(', ')}</p>
            )}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-on-surface-variant">아바타 이미지 URL (Avatar URL)</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50"
              placeholder="https://example.com/avatar.png"
            />
            {validationErrors.avatarUrl && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.avatarUrl.join(', ')}</p>
            )}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-on-surface-variant">커버 배너 이미지 URL (Cover URL)</label>
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50"
              placeholder="https://example.com/cover.png"
            />
            {validationErrors.coverImageUrl && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.coverImageUrl.join(', ')}</p>
            )}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-on-surface-variant">소속 학력 (School)</label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50"
              placeholder="예: 한국대학교"
            />
            {validationErrors.school && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.school.join(', ')}</p>
            )}
          </div>

          <div className="space-y-1.5 col-span-1">
            <label className="text-xs font-bold text-on-surface-variant">활동 위치 (Location)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50"
              placeholder="예: 서울, 대한민국"
            />
            {validationErrors.location && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.location.join(', ')}</p>
            )}
          </div>

          <div className="space-y-1.5 col-span-1 md:col-span-2">
            <label className="text-xs font-bold text-on-surface-variant">공개 이메일 (Public Email)</label>
            <input
              type="email"
              value={emailPublic}
              onChange={(e) => setEmailPublic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none text-sm font-medium bg-white/50"
              placeholder="contact@example.com"
            />
            {validationErrors.emailPublic && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">{validationErrors.emailPublic.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. 소셜 네트워크 / 관심사 / 기술 역량 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 소셜 네트워크 편집 */}
        <div className="bg-white/75 dark:bg-surface-container/20 border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
            <LinkIcon className="w-4 h-4" />
            소셜 링크 (Social Links)
          </h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newSocialKey}
              onChange={(e) => setNewSocialKey(e.target.value)}
              className="w-1/3 px-3 py-2 rounded-lg border border-outline-variant/50 focus:outline-none text-xs bg-white"
              placeholder="key (예: Github)"
            />
            <input
              type="text"
              value={newSocialValue}
              onChange={(e) => setNewSocialValue(e.target.value)}
              className="w-2/3 px-3 py-2 rounded-lg border border-outline-variant/50 focus:outline-none text-xs bg-white"
              placeholder="URL"
            />
            <button
              type="button"
              onClick={addSocialLink}
              className="px-3 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90"
            >
              추가
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {socialLinks.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-surface-container/35 px-3.5 py-2 rounded-xl text-xs">
                <span className="font-bold text-on-surface">{item.key}:</span>
                <span className="text-on-surface-variant truncate max-w-xs pl-2 flex-1">{item.value}</span>
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 관심사 및 기술 스택 */}
        <div className="bg-white/75 dark:bg-surface-container/20 border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-6">
          {/* 관심사 */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-primary uppercase tracking-wider">관심사 / 키워드</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/50 focus:outline-none text-xs bg-white"
                placeholder="예: 인공지능, 3D 드로잉"
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-3 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {interests.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container text-xs font-semibold rounded-lg"
                >
                  {item}
                  <button type="button" onClick={() => removeInterest(item)} className="text-red-500 font-bold hover:text-red-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 스킬 */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-primary uppercase tracking-wider">기술 스택 (Skills)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/50 focus:outline-none text-xs bg-white"
                placeholder="예: React, TypeScript, Blender"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-3 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-primary/90"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {skills.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg"
                >
                  {item}
                  <button type="button" onClick={() => removeSkill(item)} className="text-red-500 font-bold hover:text-red-700">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 수상 및 대외 활동 이력 타임라인 편집기 */}
      <div className="bg-white/75 dark:bg-surface-container/20 border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
          <Save className="w-4 h-4" />
          타임라인 활동 / 수상 이력 (Achievements)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-container/20 p-4 rounded-2xl">
          <div className="space-y-1.5 sm:col-span-1">
            <input
              type="text"
              value={newAchDate}
              onChange={(e) => setNewAchDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 focus:outline-none text-xs bg-white"
              placeholder="날짜 (예: 2026-02-20)"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <input
              type="text"
              value={newAchTitle}
              onChange={(e) => setNewAchTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 focus:outline-none text-xs bg-white"
              placeholder="이력/수상명 (예: 소프트웨어 창작대회 대상) *"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <textarea
              rows={2}
              value={newAchDesc}
              onChange={(e) => setNewAchDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 focus:outline-none text-xs bg-white resize-none"
              placeholder="상세 설명 (선택)"
            />
          </div>
          <div className="sm:col-span-3 text-right">
            <button
              type="button"
              onClick={addAchievement}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors"
            >
              이력 추가
            </button>
          </div>
        </div>

        {/* 리스트 출력 */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {achievements.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between bg-surface-container/30 border border-outline-variant/20 p-4 rounded-2xl group"
            >
              <div className="space-y-1">
                {item.date && (
                  <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">
                    {item.date}
                  </span>
                )}
                <h5 className="text-xs font-bold text-on-surface">{item.title}</h5>
                {item.description && <p className="text-[11px] text-on-surface-variant whitespace-pre-line">{item.description}</p>}
              </div>

              {/* 순서 조정 및 삭제 버턴 */}
              <div className="flex items-center gap-1.5 ml-4">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveAchievement(index, 'up')}
                  className="p-1.5 rounded-lg border border-outline-variant/50 bg-white hover:bg-surface-container disabled:opacity-40"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === achievements.length - 1}
                  onClick={() => moveAchievement(index, 'down')}
                  className="p-1.5 rounded-lg border border-outline-variant/50 bg-white hover:bg-surface-container disabled:opacity-40"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAchievement(index)}
                  className="p-1.5 rounded-lg border border-red-200 text-red-500 bg-white hover:bg-red-50 ml-1"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 제출 및 피드백 액션 */}
      <div className="flex items-center justify-between border-t border-outline-variant/40 pt-6">
        <p className="text-xs text-on-surface-variant font-medium">
          * 표시는 필수 항목입니다. 저장하면 즉시 해당 언어 프로필에 반영됩니다.
        </p>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-sm rounded-xl hover:bg-primary/95 hover:shadow-lg disabled:opacity-50 transition-all active:scale-98"
        >
          <Save className="w-4.5 h-4.5" />
          <span>{isSaving ? '저장 중...' : '프로필 설정 저장'}</span>
        </button>
      </div>
    </form>
  );
}
export { ProfileEditorForm };

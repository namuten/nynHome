interface SkillCloudProps {
  skills: string[];
}

/**
 * 프리미엄 기술 스택 클라우드 컴포넌트
 */
export default function SkillCloud({ skills }: SkillCloudProps) {
  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-6 text-on-surface-variant/60 text-sm">
        등록된 기술 스택이 없습니다.
      </div>
    );
  }

  // 각 기술 태그에 개성을 불어넣을 무작위 그라데이션 조합 생성 데코레이터
  const colors = [
    'from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    'from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    'from-violet-500/10 to-purple-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
    'from-rose-500/10 to-orange-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    'from-cyan-500/10 to-blue-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 py-4 max-w-2xl mx-auto">
      {skills.map((skill, index) => {
        const colorClass = colors[index % colors.length];
        return (
          <span
            key={skill}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold tracking-wide border bg-gradient-to-br ${colorClass} hover:scale-105 hover:shadow-sm active:scale-95 transition-all duration-300 cursor-default`}
          >
            {skill}
          </span>
        );
      })}
    </div>
  );
}
export { SkillCloud };

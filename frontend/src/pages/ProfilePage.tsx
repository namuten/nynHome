export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-primary-container text-primary rounded-full mx-auto flex items-center justify-center text-3xl font-bold font-display shadow-inner">
          CH
        </div>
        <h1 className="text-3xl font-display font-bold text-on-surface">CrocHub Creator</h1>
        <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto">
          아티스틱한 영감을 바탕으로 코딩과 디자인을 융합하는 창작자 포트폴리오 스페이스입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-surface-container">
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-on-surface">🚀 소개</h2>
          <p className="text-sm text-on-surface-variant font-body leading-relaxed">
            안녕하세요! 디자인과 기술의 경계에서 활발히 소통하며 창조적인 여정을 이어가고 있는 개발자이자 아티스트입니다.
            CrocHub는 나만의 예술관과 개발 성과를 유기적으로 담기 위해 만들어졌습니다.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-on-surface">📫 연락처 및 SNS</h2>
          <ul className="text-sm text-on-surface-variant font-body space-y-2">
            <li>📧 Email: <span className="font-semibold text-primary">creator@example.com</span></li>
            <li>🐙 GitHub: <a href="https://github.com" target="_blank" className="font-semibold text-primary hover:underline">github.com/example</a></li>
            <li>🎨 Instagram: <span className="font-semibold text-primary">@croc_creative</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

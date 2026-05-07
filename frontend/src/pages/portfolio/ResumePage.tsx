/**
 * 이력서형 요약 페이지 (임시 자리표시자)
 */
export default function ResumePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold">
        📄
      </div>
      <h1 className="text-3xl font-display font-bold text-on-surface">이력서</h1>
      <p className="text-sm text-on-surface-variant font-body max-w-md mx-auto leading-relaxed">
        학력, 수상 경력, 보유 기술 등을 깔끔하고 스캔하기 쉽게 보여주는 이력서 페이지입니다.
      </p>
    </div>
  );
}

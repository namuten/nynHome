import { ShieldAlert, Info, Lock, Trash2, Heart } from 'lucide-react';

export default function PrivacySafetyPage() {
  const securityMeasures = [
    {
      title: '데이터 최소화 원칙',
      icon: Info,
      desc: '크록허브는 방명록, 포트폴리오 댓글 등의 기능 제공을 위해 최소한의 회원 정보(닉네임, 아바타, 이메일)만을 수집합니다. 필요 이상의 과도한 식별 정보 수집은 배제하고 있습니다.',
    },
    {
      title: '암호화 및 IP 보호 (Spam Guard)',
      icon: Lock,
      desc: '도배, 악성 스팸 공격 및 권한 남용을 차단하기 위해 IP 주소를 단방향 해시화(HMAC SHA256)하여 감사 로그로 임시 관리합니다. 원시 IP 주소는 데이터베이스에 영구적으로 보존되지 않아 안전합니다.',
    },
    {
      title: '삭제 및 이의제기 권리 보장',
      icon: Trash2,
      desc: '본인이 직접 작성한 콘텐츠에 대한 삭제 권리를 제공하며, 관리자 제재 조치에 대해 실수가 의심될 경우, 즉시 고객 센터를 통해 객관적인 사실 검토 및 복구를 신청할 권리를 존중합니다.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 font-body animate-fade-in">
      {/* Page Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-8 sm:p-10 text-center space-y-4">
        <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-on-surface tracking-tight">
            개인정보 보호 및 보안 정책
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium max-w-lg mx-auto">
            크록허브는 사용자의 소중한 개인정보를 안전하게 보호하며, 깨끗하고 평화로운 디지털 자산을 지향합니다.
          </p>
        </div>
      </div>

      {/* Principles list */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-on-surface tracking-tight border-b border-surface-container pb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-500" />
          <span>개인정보 취급 핵심 원칙</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {securityMeasures.map((measure, idx) => {
            const Icon = measure.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-surface-container/60 hover:shadow-md hover:border-blue-500/10 p-5 rounded-3xl space-y-3 transition-all flex flex-col justify-start"
              >
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-black text-on-surface">{measure.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  {measure.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety info detail card */}
      <div className="bg-surface-container/30 border border-surface-container rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-on-surface">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-black tracking-tight">안전 지킴이: 스팸 예방(Spam Guard) 시스템</h3>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          <p>
            크록허브는 건강한 의견 피드백 환경을 유지하기 위해, 모든 방명록 및 댓글 등록 단계에서 자동화된 <strong>Spam Guard</strong> 기술을 가동합니다.
          </p>
          <p>
            시스템은 비정상적으로 반복되는 텍스트 도배, 비인가된 상업성 URL 다수 첨부, 연속 글 작성을 패턴 분석하여 즉각 탐지합니다. 탐지된 무해한 악성 데이터는 사용자 화면에 공개 노출되지 않도록 실시간으로 마스킹되며, 위배되지 않는 건전한 콘텐츠는 관리자 모니터링을 거쳐 철저하게 보장됩니다.
          </p>
          <p>
            우리는 여러분이 마음 놓고 활동할 수 있는 건전하고 영감 가득한 커뮤니티가 될 수 있도록 앞으로도 최선을 다하겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

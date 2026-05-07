import { Shield, ThumbsUp, AlertOctagon, HeartHandshake } from 'lucide-react';

export default function CommunityGuidelinesPage() {
  const behaviors = [
    {
      title: '환영하고 권장하는 행동',
      icon: ThumbsUp,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      items: [
        '친절하고 상호 존중하는 대화와 긍정적인 피드백',
        '건설적인 문제 해결 제안과 진정성 있는 응원',
        '서로의 프라이버시를 지켜주는 매너 있는 의사소통',
        '크록허브 생태계 발전을 위한 성숙한 의견 교환',
      ],
    },
    {
      title: '금지하고 제재하는 행동',
      icon: AlertOctagon,
      color: 'bg-red-50 text-red-600 border-red-100',
      items: [
        '스팸 및 홍보성 글: 영리 목적의 상업 광고, 도배성 메시지',
        '욕설 및 비방: 특정 유저나 창작자를 조롱하거나 모욕하는 발언',
        '개인정보 무단 유출: 연락처, 주소, 실명 등 민감한 정보 무단 게시',
        '부적절한 유해 콘텐츠: 선정적, 폭력적, 혐오감을 유발하는 내용',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10 font-body animate-fade-in">
      {/* Policy Header Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-8 sm:p-10 text-center space-y-4">
        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-display font-black text-on-surface tracking-tight">
            커뮤니티 가이드라인
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium max-w-lg mx-auto">
            크록허브(CrocHub)는 모두가 안전하게 소통하며 영감을 나누는 공간입니다. 따뜻하고 성숙한 커뮤니티 문화를 위해 아래 수칙을 준수해 주세요.
          </p>
        </div>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {behaviors.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm space-y-4"
            >
              <div className={`flex items-center gap-2 p-3 border rounded-2xl w-fit ${section.color}`}>
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-black tracking-tight">{section.title}</span>
              </div>
              <ul className="space-y-3 pl-1">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    <span className="text-primary font-black shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Moderation details */}
      <div className="bg-surface-container/30 border border-surface-container rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-on-surface">
          <HeartHandshake className="w-5 h-5 text-primary" />
          <h3 className="text-base font-black tracking-tight">신고 접수 및 조치 원칙</h3>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          <p>
            커뮤니티 수칙을 위반한 댓글이나 방명록 글은 누구나 우측 상단의 <strong>신고 버튼(깃발 아이콘)</strong>을 눌러 즉각 접수할 수 있습니다.
          </p>
          <p>
            신고된 항목은 실시간으로 관리자 전용 대기열에 기록되며, 운영 가이드라인 준수 여부를 다각도로 성밀 검토합니다. 위반 사실이 확인된 경우, 해당 콘텐츠는 즉시 <strong>가역적 숨김 처리(Blind)</strong>되며, 해당 사용자는 정책 위반 횟수에 따라 이용에 중대한 제한(작성 권한 잠금 등)을 받을 수 있습니다.
          </p>
          <p>
            크록허브는 언제나 사용자의 실수를 배려하기에, 잘못 차단된 경우 고객 피드백 채널을 통해 이의 제기 및 신속한 복구 신청을 하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

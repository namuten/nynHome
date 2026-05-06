import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Heart, Cpu, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const categories = [
    {
      title: 'Creative Archive',
      desc: '일러스트레이션, 아트워크, 캐릭터 디자인 등 예술적 영감을 시각적 기록으로 남기는 아카이브 채널입니다.',
      link: '/gallery',
      btnText: '갤러리 둘러보기',
      color: 'border-secondary/20 bg-secondary/5 text-secondary',
      icon: Sparkles,
    },
    {
      title: 'Dev & Life Blog',
      desc: '배움과 성찰의 일상, 소프트웨어 지식 개발 경험, 생각의 자취를 진지하게 기록하고 공유합니다.',
      link: '/blog',
      btnText: '블로그 읽기',
      color: 'border-primary/20 bg-primary/5 text-primary',
      icon: Heart,
    },
    {
      title: 'Study Repository',
      desc: '학습 과정에서 터득한 공식, 정보 이론, 요약 가이드 노트를 공들여 체계화하는 지식 공유소입니다.',
      link: '/study',
      btnText: '학습실 탐색',
      color: 'border-emerald-500/20 bg-emerald-50 text-emerald-700',
      icon: Cpu,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12 font-body">
      {/* Intro Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-surface-container pb-10">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[32px] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-4xl sm:text-5xl font-display font-extrabold shadow-lg shrink-0">
          C
        </div>
        <div className="space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-extrabold text-on-surface">CrocHub Creator</h1>
            <p className="text-sm font-semibold text-primary font-display">Developer & Creative Artist</p>
          </div>
          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            안녕하세요! CrocHub에 오신 것을 기쁘게 생각합니다. 이곳은 저만의 배움และ 영감을 유기적으로 연결하고 기록하는 통합 창작 포트폴리오 스페이스입니다. 공학적 문제 해결 능력과 디자인 지향적 관점을 연결하는 다양한 시도들을 보여드립니다.
          </p>

          {/* Social Links Badge */}
          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start pt-2">
            <a
              href="https://github.com/namuten"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-surface-container bg-white text-xs text-on-surface-variant font-semibold hover:border-primary hover:text-primary transition duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span>GitHub</span>
            </a>
            <a
              href="mailto:contact@namuten.io"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-surface-container bg-white text-xs text-on-surface-variant font-semibold hover:border-primary hover:text-primary transition duration-200"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
            <span className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-surface-container bg-white text-xs text-on-surface-variant font-semibold">
              <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span className="opacity-40">Instagram</span>
            </span>
          </div>
        </div>
      </div>

      {/* Channel Introduction Cards */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-extrabold text-on-surface">채널 소개</h2>
          <p className="text-xs text-on-surface-variant font-medium">CrocHub을 움직이는 세 가지 주요 아카이브 카테고리입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl border border-surface-container bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-on-surface">{cat.title}</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <Link
                  to={cat.link}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-primary hover:underline pt-2 group"
                >
                  <span>{cat.btnText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vision Statement */}
      <div className="p-8 rounded-[32px] bg-surface-container/30 border border-surface-container space-y-4">
        <h3 className="text-lg font-display font-bold text-on-surface">진학 및 프로젝트 로드맵</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed font-body">
          CrocHub은 단순한 기록실을 넘어 진로 탐색 및 학문적 성과를 체계적으로 분류하는 지적 설계 도구로 진화하고 있습니다. 향후에는 공부한 내용을 정리한 PDF 업로드 및 파싱, 인터랙티브 캔버스를 통한 시각 자료 구성 기능 등이 점진적으로 확장될 예정입니다.
        </p>
      </div>
    </div>
  );
}

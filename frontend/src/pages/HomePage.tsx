import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="space-y-12 py-10 croc-scale-bg min-h-[80vh] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-primary animate-fade-in">
          CrocHub
        </h1>
        <p className="text-lg md:text-xl text-on-surface-variant font-body font-medium leading-relaxed">
          예술적 영감과 일상 블로그, 성장을 기록하는 개인 공간입니다.
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link
            to="/gallery"
            className="px-6 py-3 bg-primary text-white font-body font-semibold rounded-2xl hover:bg-primary-container hover:text-primary transition duration-300 shadow-md hover:shadow-lg"
          >
            갤러리 둘러보기
          </Link>
          <Link
            to="/blog"
            className="px-6 py-3 bg-surface-container text-primary font-body font-semibold rounded-2xl hover:bg-primary/10 transition duration-300"
          >
            최신 일지 읽기
          </Link>
        </div>
      </div>

      {/* Preview Section placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
        <div className="p-6 rounded-3xl bg-white border border-surface-container shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-container text-secondary">Creative</span>
            <h3 className="text-xl font-display font-bold text-on-surface pt-2">창작 보관소</h3>
            <p className="text-sm text-on-surface-variant font-body">직접 작업한 고품질 일러스트레이션과 디자인 포트폴리오를 탐색해보세요.</p>
          </div>
          <Link to="/gallery" className="text-sm font-semibold text-primary pt-4 hover:underline">자세히 보기 &rarr;</Link>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-surface-container shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">Blog</span>
            <h3 className="text-xl font-display font-bold text-on-surface pt-2">일상 기록부</h3>
            <p className="text-sm text-on-surface-variant font-body">새로운 생각들과 일상의 소소한 발견을 자유롭게 적어 내리는 일기장입니다.</p>
          </div>
          <Link to="/blog" className="text-sm font-semibold text-primary pt-4 hover:underline">자세히 보기 &rarr;</Link>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-surface-container shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary">Study</span>
            <h3 className="text-xl font-display font-bold text-on-surface pt-2">학습 자료실</h3>
            <p className="text-sm text-on-surface-variant font-body">공부하면서 배운 개념들과 코딩, 진학 포트폴리오 관련 노하우를 공유합니다.</p>
          </div>
          <Link to="/study" className="text-sm font-semibold text-primary pt-4 hover:underline">자세히 보기 &rarr;</Link>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, X, Clock, FileText, Palette, Check, AlertCircle } from 'lucide-react';
import type { ScheduleItem } from '../../types/admin';

// 파스텔톤 컬러 팔레트 사전 정의
const COLOR_PALETTE = [
  { hex: '#6844c7', name: '로열 퍼플' },
  { hex: '#0ea5e9', name: '스카이 블루' },
  { hex: '#10b981', name: '에메랄드 그린' },
  { hex: '#f97316', name: '피치 오렌지' },
  { hex: '#f43f5e', name: '로즈 핑크' },
  { hex: '#eab308', name: '골든 옐로' },
];

/**
 * AdminSchedulePage - 캘린더형 일정 통합 CRUD 어드민 화면
 * - 월별 달력 자동 빌드 및 알록달록한 일정 배지 노출
 * - 모달 팝업 형식의 무결성 일정 생성(Create), 디테일 수정(Update), 삭제(Delete) 지원
 */
export default function AdminSchedulePage() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());

  // 선택된 연도 및 월
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth(); // 0-indexed
  const monthStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

  // CRUD 제어 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);

  // 폼 입력 로컬 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [color, setColor] = useState('#6844c7');
  const [formError, setFormError] = useState<string | null>(null);

  // 1. 월별 스케줄 목록 조회 쿼리
  const { data: schedules = [], isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'schedules', monthStr],
    queryFn: () => adminApi.getAdminSchedules(monthStr),
  });

  // 2. 일정 생성 뮤테이션
  const createMutation = useMutation({
    mutationFn: (payload: Omit<ScheduleItem, 'id'>) => adminApi.createAdminSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules', monthStr] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }); // 대시보드 일정 개수 갱신 연동
      closeFormModal();
    },
    onError: (err: any) => {
      setFormError(err.message || '일정을 등록하는 도중 오류가 발생했습니다.');
    },
  });

  // 3. 일정 수정 뮤테이션
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Omit<ScheduleItem, 'id'>> }) =>
      adminApi.updateAdminSchedule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules', monthStr] });
      closeFormModal();
    },
    onError: (err: any) => {
      setFormError(err.message || '일정을 변경하는 도중 오류가 발생했습니다.');
    },
  });

  // 4. 일정 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteAdminSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules', monthStr] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      closeFormModal();
    },
    onError: (err: any) => {
      setFormError(err.message || '일정을 삭제하는 도중 오류가 발생했습니다.');
    },
  });

  // 달력 빌드 헬퍼 함수들
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayIndex = (y: number, m: number) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(year, monthIndex);
  const firstDayIndex = getFirstDayIndex(year, monthIndex);

  // 이전 달/다음 달 내비게이션
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  };

  // 모달 닫기 및 필드 클리어
  const closeFormModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
    setTitle('');
    setDescription('');
    setStartDateStr('');
    setEndDateStr('');
    setColor('#6844c7');
    setFormError(null);
  };

  // 신규 등록 폼 호출
  const handleOpenCreateModal = (day?: number) => {
    const today = new Date();
    const activeDay = day || today.getDate();
    // 초기 시작시간/종료시간 설정 (datetime-local 양식: YYYY-MM-DDTHH:mm)
    const baseDateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(activeDay).padStart(2, '0')}`;
    setStartDateStr(`${baseDateStr}T09:00`);
    setEndDateStr(`${baseDateStr}T18:00`);
    
    setSelectedSchedule(null);
    setIsModalOpen(true);
  };

  // 수정/상세 폼 호출
  const handleOpenUpdateModal = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setTitle(schedule.title);
    setDescription(schedule.description || '');
    
    // ISO 날짜 문자열을 datetime-local 인풋이 지원하는 형식(YYYY-MM-DDTHH:mm)으로 변경
    const formatToLocalDatetime = (isoStr: string) => {
      const d = new Date(isoStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };

    setStartDateStr(formatToLocalDatetime(schedule.startAt));
    setEndDateStr(formatToLocalDatetime(schedule.endAt));
    setColor(schedule.color || '#6844c7');
    setIsModalOpen(true);
  };

  // 일정 저장 액션
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('일정 제목을 정확히 입력해 주세요.');
      return;
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setFormError('시작 일시와 종료 일시가 올바르지 않습니다.');
      return;
    }

    if (start > end) {
      setFormError('종료 일시는 시작 일시보다 빠를 수 없습니다.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      color,
    };

    if (selectedSchedule) {
      // Update
      updateMutation.mutate({ id: selectedSchedule.id, payload });
    } else {
      // Create
      createMutation.mutate(payload);
    }
  };

  // 일정 삭제 확인 및 진행
  const handleDeleteSchedule = () => {
    if (!selectedSchedule) return;
    if (window.confirm(`'${selectedSchedule.title}' 일정을 영구 삭제하시겠습니까?`)) {
      deleteMutation.mutate(selectedSchedule.id);
    }
  };

  // 특정 날짜에 걸쳐 있는 일정 필터링
  const getSchedulesForDay = (dayNum: number) => {
    const targetDateStart = new Date(year, monthIndex, dayNum, 0, 0, 0, 0);
    const targetDateEnd = new Date(year, monthIndex, dayNum, 23, 59, 59, 999);

    return schedules.filter((s) => {
      const start = new Date(s.startAt);
      const end = new Date(s.endAt);
      // 날짜 범위 오버랩 조건 검사
      return start <= targetDateEnd && end >= targetDateStart;
    });
  };

  // 달력 그리드 배열 조립
  const calendarCells = [];
  // 이전달 패딩 셀 채우기
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push({ day: null, key: `empty-${i}` });
  }
  // 이번달 실제 일수 채우기
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push({ day: d, key: `day-${d}` });
  }

  return (
    <div className="space-y-6 font-body animate-fade-in pb-12">
      {/* 최상단 타이틀 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-surface-container pb-5">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-8 h-8 text-primary" />
            개인 일정 캘린더
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            크록허브에 실시간 연동되는 개인 방송 및 이벤트 일정을 직관적인 월간 캘린더 그리드 상에서 추가, 수정, 삭제합니다.
          </p>
        </div>

        {/* 새 일정 생성 트리거 단추 */}
        <button
          onClick={() => handleOpenCreateModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-2xl bg-primary text-white hover:bg-primary-container hover:text-primary shadow-sm hover:shadow transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>새 일정 추가</span>
        </button>
      </div>

      {/* 캘린더 내비게이터 바 */}
      <div className="flex items-center justify-between p-4 bg-white rounded-3xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 border border-surface-container rounded-xl hover:bg-surface-container text-on-surface-variant transition"
            title="이전 달"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h2 className="text-lg font-display font-black text-on-surface tracking-tight select-none px-2 min-w-[140px] text-center">
            {year}년 {monthIndex + 1}월
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 border border-surface-container rounded-xl hover:bg-surface-container text-on-surface-variant transition"
            title="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 로딩 인디케이터 배지 */}
        {(isLoading || isFetching) && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 text-[10px] font-bold text-primary animate-pulse">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            서버와 동기화 중...
          </span>
        )}
      </div>

      {/* 메인 캘린더 달력 보드 그리드 */}
      <div className="bg-white rounded-3xl border border-surface-container shadow-sm overflow-hidden">
        {/* 요일 헤더 표시 */}
        <div className="grid grid-cols-7 bg-surface-container/20 border-b border-surface-container text-center py-3 select-none">
          {['일', '월', '화', '수', '목', '금', '토'].map((dayName, idx) => (
            <span
              key={dayName}
              className={`text-xs font-black tracking-wider ${
                idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-on-surface-variant'
              }`}
            >
              {dayName}
            </span>
          ))}
        </div>

        {/* 날짜 셀 바인딩 그리드 */}
        <div className="grid grid-cols-7 grid-rows-5 divide-x divide-y divide-surface-container border-t-0">
          {calendarCells.map((cell) => {
            const isToday =
              cell.day !== null &&
              new Date().getFullYear() === year &&
              new Date().getMonth() === monthIndex &&
              new Date().getDate() === cell.day;

            const daySchedules = cell.day !== null ? getSchedulesForDay(cell.day) : [];

            return (
              <div
                key={cell.key}
                className={`min-h-[110px] p-2 flex flex-col justify-between group transition relative ${
                  cell.day === null
                    ? 'bg-surface-container/5'
                    : 'bg-white hover:bg-surface-container/10'
                }`}
              >
                {cell.day !== null ? (
                  <>
                    {/* 날짜 넘버 & 퀵 추가 트리거 버튼 */}
                    <div className="flex items-center justify-between mb-1 select-none">
                      <span
                        className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-lg ${
                          isToday
                            ? 'bg-primary text-white font-black shadow-sm'
                            : 'text-on-surface font-black'
                        }`}
                      >
                        {cell.day}
                      </span>

                      {/* 호버 시 노출되는 간이 등록 단추 */}
                      <button
                        onClick={() => handleOpenCreateModal(cell.day!)}
                        className="opacity-0 group-hover:opacity-100 p-1 bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-md transition"
                        title="이 날에 새로운 일정 만들기"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 등록된 일정 파스텔 배지 목록 */}
                    <div className="flex-1 space-y-1 overflow-y-auto max-h-[72px] custom-scrollbar">
                      {daySchedules.map((schedule) => (
                        <button
                          key={schedule.id}
                          onClick={() => handleOpenUpdateModal(schedule)}
                          style={{
                            backgroundColor: `${schedule.color || '#6844c7'}15`,
                            borderColor: `${schedule.color || '#6844c7'}30`,
                            color: schedule.color || '#6844c7'
                          }}
                          className="w-full text-left text-[10px] font-black px-1.5 py-0.5 rounded-md border truncate hover:scale-[1.01] transition-transform block"
                          title={`${schedule.title}\n(${new Date(schedule.startAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})`}
                        >
                          {schedule.title}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 bg-surface-container/10" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 일정 생성 및 수정 상세 모달 (Dialog) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-surface-container p-6 w-full max-w-md shadow-xl animate-scale-up space-y-4">
            
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                <CalendarIcon className="w-4.5 h-4.5 text-primary" />
                <span>{selectedSchedule ? '일정 수정 및 상세' : '새로운 일정 추가'}</span>
              </h3>
              <button
                onClick={closeFormModal}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 입력 폼 바디 */}
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              
              {/* 에러 피드백 문구 */}
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold leading-relaxed">{formError}</p>
                </div>
              )}

              {/* 1. 일정 명칭 */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-on-surface-variant/70" />
                  <span>일정 제목 *</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 크록허브 개발 정기 방송"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-surface-container rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition"
                  required
                />
              </div>

              {/* 2. 설명 */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-on-surface-variant/70" />
                  <span>일정 상세 설명 (선택)</span>
                </label>
                <textarea
                  placeholder="진행 내용이나 상세 링크 등을 입력하세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-surface-container/30 border border-surface-container rounded-xl text-xs font-semibold focus:outline-none focus:border-primary transition resize-none leading-relaxed"
                />
              </div>

              {/* 3. 시작 일시 및 종료 일시 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant/70" />
                    <span>시작 일시</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full px-2.5 py-2 bg-surface-container/30 border border-surface-container rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-on-surface-variant/70" />
                    <span>종료 일시</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full px-2.5 py-2 bg-surface-container/30 border border-surface-container rounded-xl text-xs font-bold focus:outline-none focus:border-primary transition"
                    required
                  />
                </div>
              </div>

              {/* 4. 일정 배지 디자인 컬러 선택기 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-on-surface-variant/70" />
                  <span>배지 테마 색상</span>
                </label>
                
                <div className="flex gap-2.5">
                  {COLOR_PALETTE.map((pal) => (
                    <button
                      key={pal.hex}
                      type="button"
                      onClick={() => setColor(pal.hex)}
                      style={{ backgroundColor: pal.hex }}
                      className="w-7 h-7 rounded-lg border border-white flex items-center justify-center text-white shadow-sm relative group hover:scale-105 transition"
                      title={pal.name}
                    >
                      {color === pal.hex && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      
                      {/* 가벼운 툴팁 */}
                      <span className="opacity-0 group-hover:opacity-100 absolute bottom-8 bg-black text-white text-[9px] px-1 py-0.5 rounded pointer-events-none transition whitespace-nowrap z-10 font-bold">
                        {pal.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 모달 액션 단추 그룹 */}
              <div className="flex items-center justify-between border-t border-surface-container pt-4">
                {/* 삭제 버튼 - 기존 일정인 경우에만 노출 */}
                {selectedSchedule ? (
                  <button
                    type="button"
                    onClick={handleDeleteSchedule}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                ) : (
                  <div /> // 플레이스홀더 역할
                )}

                {/* 닫기 및 저장 그룹 */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="px-4 py-2 rounded-xl border border-surface-container bg-white hover:bg-surface-container text-xs font-bold text-on-surface-variant transition"
                  >
                    취소
                  </button>
                  
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex items-center gap-1 px-5 py-2 rounded-xl bg-primary text-white hover:bg-primary-container hover:text-primary text-xs font-bold shadow-sm transition disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? '저장 중...' : '일정 저장'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

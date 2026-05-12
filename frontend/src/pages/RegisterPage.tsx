import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const registerSchema = z.object({
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다.').max(20, '닉네임은 최대 20자 이하이어야 합니다.'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: signup, login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    try {
      setErrorMsg(null);
      // 1. Sign up
      await signup(data.email, data.password, data.nickname);
      // 2. Automatically log in after registration
      await login(data.email, data.password);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '회원가입에 실패했습니다. 다시 시도해주세요.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 md:py-16 space-y-4 md:space-y-6">
      <div className="text-center space-y-3">
        <img 
          src="/branding/crochub-logo.svg" 
          alt="CrocHub Logo" 
          className="w-16 h-16 mx-auto rounded-3xl object-contain bg-primary/10 border border-primary/20 p-1.5 shadow-md" 
        />
        <h1 className="text-3xl font-display font-bold text-primary">회원가입</h1>
        <p className="text-sm text-on-surface-variant font-body">나만의 창작 커뮤니티 계정을 생성하세요.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-3xl border border-surface-container shadow-sm space-y-4">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-body font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">닉네임</label>
          <input
            type="text"
            placeholder="크록이"
            {...registerField('nickname')}
            className={`w-full px-4 py-2.5 rounded-xl border bg-surface font-body text-sm focus:outline-none focus:border-primary ${
              errors.nickname ? 'border-red-300 focus:border-red-500' : 'border-surface-container'
            }`}
          />
          {errors.nickname && (
            <p className="text-xs text-red-500 font-body">{errors.nickname.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">이메일</label>
          <input
            type="email"
            placeholder="email@example.com"
            {...registerField('email')}
            className={`w-full px-4 py-2.5 rounded-xl border bg-surface font-body text-sm focus:outline-none focus:border-primary ${
              errors.email ? 'border-red-300 focus:border-red-500' : 'border-surface-container'
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 font-body">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant">비밀번호</label>
          <input
            type="password"
            placeholder="••••••••"
            {...registerField('password')}
            className={`w-full px-4 py-2.5 rounded-xl border bg-surface font-body text-sm focus:outline-none focus:border-primary ${
              errors.password ? 'border-red-300 focus:border-red-500' : 'border-surface-container'
            }`}
          />
          {errors.password && (
            <p className="text-xs text-red-500 font-body">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-primary text-white font-body font-semibold rounded-xl hover:bg-primary-container hover:text-primary transition duration-300 shadow-md disabled:opacity-50"
        >
          {isSubmitting ? '가입 중...' : '회원가입 및 시작하기'}
        </button>
      </form>

      <div className="text-center text-xs font-body text-on-surface-variant">
        이미 계정이 있으신가요? <Link to="/login" className="text-primary font-semibold hover:underline">로그인하기</Link>
      </div>
    </div>
  );
}

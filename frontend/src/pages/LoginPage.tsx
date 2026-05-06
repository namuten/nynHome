import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    try {
      setErrorMsg(null);
      await login(data.email, data.password);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold text-primary">로그인</h1>
        <p className="text-sm text-on-surface-variant font-body">CrocHub에 방문하신 것을 환영합니다.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-3xl border border-surface-container shadow-sm space-y-4">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-body font-medium">
            {errorMsg}
          </div>
        )}

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
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="text-center text-xs font-body text-on-surface-variant">
        계정이 없으신가요? <Link to="/register" className="text-primary font-semibold hover:underline">회원가입하기</Link>
      </div>
    </div>
  );
}

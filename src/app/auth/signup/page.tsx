'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  authenticationEmail,
  verifyEmail,
  signUp,
} from '@/lib/api/auth';
import { useAuth } from '@/lib/auth/provider';
import OAuthButtons from '@/components/auth/OAuthButtons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type Step = 'email' | 'password' | 'birth';

const EMAIL_REGEX =
  /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/;

// Matches frontend's RN app: lowercase + uppercase + digit + special char, 8–16 length
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/;

const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from(
  { length: CURRENT_YEAR - 1900 + 1 },
  (_, i) => CURRENT_YEAR - i,
);

export default function SignUpPage() {
  const router = useRouter();
  const { setLoggedIn } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [birthYear, setBirthYear] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate email format
  const isEmailValid = EMAIL_REGEX.test(email);

  // Password validation
  const isPasswordValid = PASSWORD_REGEX.test(password);
  const passwordError =
    password.length > 0 && !isPasswordValid
      ? '8~16자, 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.'
      : '';
  const confirmError =
    confirmPassword.length > 0 && password !== confirmPassword
      ? '비밀번호가 일치하지 않습니다.'
      : '';

  // Poll for email verification after sending
  useEffect(() => {
    if (!emailSent || emailVerified) return;

    const interval = setInterval(async () => {
      const verified = await verifyEmail(email);
      if (verified) {
        setEmailVerified(true);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [emailSent, emailVerified, email]);

  const handleSendEmail = async () => {
    if (!isEmailValid) {
      setEmailError('이메일을 다시 확인해주세요.');
      return;
    }

    setEmailError('');
    setEmailLoading(true);

    try {
      const { error: apiError } = await authenticationEmail(email);
      if (apiError) {
        setEmailError('이메일 인증 요청에 실패했습니다.');
      } else {
        setEmailSent(true);
      }
    } catch {
      setEmailError('오류가 발생했습니다.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setVerifyLoading(true);
    try {
      const verified = await verifyEmail(email);
      if (verified) {
        setEmailVerified(true);
      } else {
        setEmailError('아직 이메일 인증이 완료되지 않았습니다.');
      }
    } catch {
      setEmailError('인증 확인에 실패했습니다.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleEmailNext = () => {
    if (emailVerified) {
      setStep('password');
      setError('');
    }
  };

  const handlePasswordNext = () => {
    if (isPasswordValid && password === confirmPassword) {
      setStep('birth');
      setError('');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const year = parseInt(birthYear, 10);
    if (!year || year < 1900 || year > new Date().getFullYear()) {
      setError('올바른 출생연도를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await signUp({ email, password, birth: year });

      if (success) {
        setLoggedIn(true);
        router.push('/auth/signup/welcome');
      } else {
        setError('회원가입에 실패했습니다.');
      }
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-svh flex items-start justify-center pt-20">
      <div className="w-full max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-8">
          회원가입
        </h1>

        <OAuthButtons />

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[var(--color-divider)]" />
          <span className="text-sm text-[var(--color-gray3)]">또는</span>
          <div className="flex-1 h-px bg-[var(--color-divider)]" />
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(['email', 'password', 'birth'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                i <= ['email', 'password', 'birth'].indexOf(step)
                  ? 'bg-[var(--color-main)]'
                  : 'bg-[var(--color-divider)]'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <div className="flex flex-col gap-4">
            <Input
              type="email"
              label="이메일"
              placeholder="이메일을 입력해주세요."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
                setEmailSent(false);
                setEmailVerified(false);
              }}
              error={emailError}
              autoComplete="email"
            />

            {!emailSent && (
              <Button
                onClick={handleSendEmail}
                disabled={!isEmailValid}
                loading={emailLoading}
              >
                인증 요청
              </Button>
            )}

            {emailSent && !emailVerified && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[var(--color-green)]">
                  인증 메일을 발송했습니다. 이메일을 확인해주세요.
                </p>
                <Button
                  onClick={handleCheckVerification}
                  loading={verifyLoading}
                >
                  인증 확인
                </Button>
              </div>
            )}

            {emailVerified && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[var(--color-green)]">
                  이메일 인증이 완료되었습니다.
                </p>
                <Button onClick={handleEmailNext}>다음</Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Password */}
        {step === 'password' && (
          <div className="flex flex-col gap-4">
            <Input
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요. (8자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              autoComplete="new-password"
            />
            <Input
              type="password"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력해주세요."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmError}
              autoComplete="new-password"
            />
            <Button
              onClick={handlePasswordNext}
              disabled={!isPasswordValid || password !== confirmPassword}
            >
              다음
            </Button>
          </div>
        )}

        {/* Step 3: Birth year */}
        {step === 'birth' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
                출생연도
              </label>
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-[var(--color-border)] bg-transparent text-[var(--color-text)] outline-none focus:border-[var(--color-main)]"
              >
                <option value="">출생연도를 선택해주세요</option>
                {BIRTH_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            )}

            <Button
              type="submit"
              disabled={!birthYear}
              loading={loading}
            >
              가입하기
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-[var(--color-gray3)] hover:underline"
          >
            이미 계정이 있어요
          </Link>
        </div>
      </div>
    </main>
  );
}

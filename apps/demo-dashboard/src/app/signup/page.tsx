import SignupForm from '@/features/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="mb-6 text-2xl font-bold">회원가입</h1>
      <SignupForm />
    </div>
  );
}

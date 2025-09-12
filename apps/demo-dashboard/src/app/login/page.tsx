import LoginForm from '../../features/auth/LoginForm';

export default function Page() {
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="mb-6 text-2xl font-bold">로그인</h1>
      <LoginForm />
    </div>
  );
}

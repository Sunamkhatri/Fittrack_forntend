import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#00ff87]">FitTrack</h1>
        <p className="mt-2 text-sm text-slate-400">Create your account</p>
      </div>
      <RegisterForm />
    </div>
  );
}

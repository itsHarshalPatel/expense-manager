import SignInButton from "@/components/shared/SignInButton";

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen w-full flex justify-center items-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/BgLogin.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex flex-col items-center gap-6 bg-white p-10 rounded-app w-80">
        <img src="/icons/Logo.svg" alt="Logo" className="w-14" />
        <span
          className="font-bold text-4xl"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Login
        </span>
        <SignInButton />
      </div>
    </div>
  );
}

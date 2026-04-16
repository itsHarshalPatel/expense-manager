import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/BgLogin.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        <Image
          src="/icons/Logo.svg"
          width={5}
          height={5}
          alt="Expense Manager"
          className="w-20 h-20"
        />

        <div>
          <h1
            className="text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Expense Manager
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Track expenses, split bills with friends, and understand your
            spending — all in one place.
          </p>
        </div>

        <Link href="/login" className="common-btn text-base px-8 py-3">
          Sign In with Google
        </Link>

        <p className="text-white/40 text-sm">
          Free forever · No credit card required
        </p>
      </div>
    </main>
  );
}

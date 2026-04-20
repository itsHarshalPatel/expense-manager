import SignInButton from "@/components/shared/SignInButton";

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full flex overflow-hidden bg-hero-dark">
      {/* Subtle orbs + grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      {/* Left panel */}
      <div className="relative z-10 flex flex-col justify-between w-full md:w-1/2 px-8 py-10 md:px-16 md:py-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <p
            className="text-white text-sm font-bold tracking-wide leading-none"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Vyaya
          </p>
          <p className="text-white/40 text-xs leading-none mt-0.5">
            Prabandhana
          </p>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-8 max-w-md">
          <div className="flex flex-col gap-5">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 w-fit rounded-full px-4 py-1.5"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
              <span className="text-white/50 text-xs font-medium tracking-wide">
                Free forever · No credit card
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl font-bold text-white leading-[1.05]"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              Take control of your{" "}
              <span className="text-gradient">finances</span>
            </h1>

            <p className="text-white/40 text-lg leading-relaxed">
              Track expenses, split bills with friends, and understand your
              spending — all in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {[
              "📊 Smart Dashboard",
              "👥 Group Splits",
              "💸 Settlement Tracking",
              "📈 Spend Analytics",
            ].map((f) => (
              <span key={f} className="feature-pill">
                {f}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <SignInButton variant="hero" />
            <p className="text-white/20 text-xs text-center">
              Secure sign-in via Google OAuth
            </p>
          </div>
        </div>

        <p className="text-white/15 text-xs">
          © {new Date().getFullYear()} Expense Manager
        </p>
      </div>

      {/* Right panel — preview card */}
      <div className="hidden md:flex relative z-10 w-1/2 items-center justify-center px-10">
        <div className="preview-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest">
                April 2025
              </p>
              <p
                className="text-white text-2xl font-bold mt-0.5"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                €2,840.00
              </p>
            </div>
            <span className="trend-badge">▲ 12% vs last month</span>
          </div>

          {/* Mini bar chart */}
          <div className="flex items-end gap-2 h-24 mb-2">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1">
                <div
                  className="bar-segment w-full"
                  style={{ height: `${h * 0.96}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-white/20 text-xs mb-6">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d} className="flex-1 text-center">
                {d}
              </span>
            ))}
          </div>

          {/* Recent transactions */}
          <div className="flex flex-col">
            {[
              {
                label: "Grocery Store",
                cat: "Food",
                amount: "-€54.20",
                positive: false,
                icon: "🛒",
              },
              {
                label: "Alex owes you",
                cat: "Settlement",
                amount: "+€30.00",
                positive: true,
                icon: "🤝",
              },
              {
                label: "Netflix",
                cat: "Entertainment",
                amount: "-€15.99",
                positive: false,
                icon: "🎬",
              },
            ].map((item) => (
              <div key={item.label} className="preview-row">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {item.label}
                  </p>
                  <p className="text-white/30 text-xs">{item.cat}</p>
                </div>
                <p
                  className={`text-sm font-bold flex-shrink-0 ${item.positive ? "text-white" : "text-white/50"}`}
                >
                  {item.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

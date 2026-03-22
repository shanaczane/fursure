import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: "🔍",
      title: "Discover Trusted Services",
      desc: "Browse vetted groomers, vets, trainers, boarding and more — filtered by location, rating, and availability.",
    },
    {
      icon: "📅",
      title: "Book in Seconds",
      desc: "Real-time scheduling with instant confirmations. Manage all your pet's appointments from one dashboard.",
    },
    {
      icon: "⭐",
      title: "Verified Providers",
      desc: "Every service provider is reviewed by our community. See ratings, reviews, and credentials before you book.",
    },
  ];

  const categories = [
    { emoji: "✂️", label: "Grooming", color: "bg-amber-50 border-amber-200" },
    { emoji: "🏥", label: "Veterinary", color: "bg-teal-50 border-teal-200" },
    { emoji: "🎓", label: "Training", color: "bg-blue-50 border-blue-200" },
    { emoji: "🏠", label: "Boarding", color: "bg-purple-50 border-purple-200" },
    { emoji: "🚶", label: "Walking", color: "bg-green-50 border-green-200" },
    { emoji: "🎾", label: "Daycare", color: "bg-orange-50 border-orange-200" },
  ];

  const stats = [
    { value: "10,000+", label: "Happy Pet Owners" },
    { value: "500+", label: "Verified Providers" },
    { value: "50,000+", label: "Bookings Made" },
    { value: "4.9★", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--fur-cream)", fontFamily: "'Nunito', sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(253,248,240,0.95)", borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-2xl font-black" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-teal)" }}>
              FurSure
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>Services</a>
            <a href="#how" className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>How it works</a>
            <a href="#providers" className="text-sm font-600" style={{ color: "var(--fur-slate-mid)" }}>For Providers</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-700 rounded-full border-2 transition-all hover:shadow-sm"
              style={{ borderColor: "var(--fur-teal)", color: "var(--fur-teal)" }}
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-700 rounded-full text-white transition-all hover:shadow-md"
              style={{ background: "linear-gradient(135deg, var(--fur-teal), var(--fur-teal-dark))", boxShadow: "0 2px 8px rgba(45,140,114,0.35)" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2"
          style={{ background: "var(--fur-amber)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15 blur-3xl translate-y-1/2 -translate-x-1/2"
          style={{ background: "var(--fur-teal)" }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-700 mb-8 border"
              style={{ background: "var(--fur-amber-light)", color: "var(--fur-amber-dark)", borderColor: "#F5D89A" }}>
              <span>🐶</span>
              Trusted by 10,000+ pet owners across the country
            </div>
            <h1 className="text-5xl md:text-7xl font-900 leading-tight mb-6"
              style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
              Your pet deserves<br />
              <span style={{ color: "var(--fur-teal)" }}>the best care.</span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
              Find and book trusted pet care services near you — from grooming and vet visits to training, boarding, and daily walks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-700 text-lg text-white transition-all hover:-translate-y-1"
                style={{ background: "linear-gradient(135deg, var(--fur-teal), var(--fur-teal-dark))", boxShadow: "0 4px 20px rgba(45,140,114,0.4)" }}
              >
                Find Care for My Pet
                <span>→</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-700 text-lg border-2 transition-all hover:shadow-md"
                style={{ borderColor: "var(--border)", color: "var(--fur-slate-mid)", background: "white" }}
              >
                <span>🏢</span>
                I'm a Provider
              </Link>
            </div>
          </div>

          {/* Floating pet cards */}
          <div className="absolute right-0 top-0 hidden xl:flex flex-col gap-4 mt-8">
            <div className="bg-white rounded-2xl p-4 shadow-xl border flex items-center gap-3 w-56"
              style={{ borderColor: "var(--border)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "var(--fur-amber-light)" }}>🐕</div>
              <div>
                <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>Max's Grooming</p>
                <p className="text-xs" style={{ color: "var(--fur-teal)" }}>✓ Confirmed Today</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xl border flex items-center gap-3 w-56 ml-8"
              style={{ borderColor: "var(--border)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "var(--fur-teal-light)" }}>🐈</div>
              <div>
                <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>Luna's Checkup</p>
                <p className="text-xs text-amber-600">⭐ 4.9 · Dr. Martinez</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xl border flex items-center gap-3 w-56"
              style={{ borderColor: "var(--border)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "#F0E6FF" }}>🦴</div>
              <div>
                <p className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>Charlie's Training</p>
                <p className="text-xs" style={{ color: "var(--fur-slate-light)" }}>Tomorrow 10 AM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y" style={{ borderColor: "var(--border)", background: "white" }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-900 mb-1" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-teal)" }}>{s.value}</p>
              <p className="text-sm font-600" style={{ color: "var(--fur-slate-light)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service Categories */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-700 uppercase tracking-widest mb-3" style={{ color: "var(--fur-teal)" }}>What we offer</p>
            <h2 className="text-4xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
              Every service your pet needs
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href="/register"
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all hover:-translate-y-1 hover:shadow-md ${cat.color}`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="font-700 text-sm" style={{ color: "var(--fur-slate)" }}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how" className="py-20 px-6" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-700 uppercase tracking-widest mb-3" style={{ color: "var(--fur-teal)" }}>Why FurSure</p>
            <h2 className="text-4xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>
              Pet care, simplified
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl p-8 border-2 transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: "var(--border)", background: "var(--fur-cream)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6"
                  style={{ background: "var(--fur-teal-light)" }}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-800 mb-3" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-slate)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--fur-slate-light)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section id="providers" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl overflow-hidden relative p-12 md:p-16"
            style={{ background: "linear-gradient(135deg, var(--fur-slate), #2D4A6B)" }}>
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl translate-x-1/4 -translate-y-1/4"
              style={{ background: "var(--fur-amber)" }} />
            <div className="relative max-w-2xl">
              <p className="text-sm font-700 uppercase tracking-widest mb-4" style={{ color: "var(--fur-amber)" }}>For Service Providers</p>
              <h2 className="text-4xl md:text-5xl font-900 mb-6 text-white" style={{ fontFamily: "'Fraunces', serif" }}>
                Grow your pet care business
              </h2>
              <p className="text-lg mb-8" style={{ color: "#A0B8D0" }}>
                Join hundreds of providers earning more with FurSure. List your services, manage bookings, and build your client base — all in one place.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-700 text-lg transition-all hover:-translate-y-1"
                style={{ background: "linear-gradient(135deg, var(--fur-amber), var(--fur-amber-dark))", color: "#1A2332", boxShadow: "0 4px 20px rgba(232,169,77,0.4)" }}
              >
                Join as a Provider
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6" style={{ borderColor: "var(--border)", background: "white" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="text-xl font-900" style={{ fontFamily: "'Fraunces', serif", color: "var(--fur-teal)" }}>FurSure</span>
          </div>
          <p className="text-sm" style={{ color: "var(--fur-slate-light)" }}>
            © 2025 FurSure · Making pet care easy, one booking at a time 🐾
          </p>
          <div className="flex gap-6">
            <Link href="/login" className="text-sm font-600 hover:underline" style={{ color: "var(--fur-slate-light)" }}>Login</Link>
            <Link href="/register" className="text-sm font-600 hover:underline" style={{ color: "var(--fur-slate-light)" }}>Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
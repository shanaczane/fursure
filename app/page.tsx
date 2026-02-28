import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#dce8f5]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
        <div className="text-2xl font-bold text-blue-500">FurSure</div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 text-sm font-medium bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center text-center px-4 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-xs text-blue-500 font-medium shadow-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
          Trusted by 10,000+ pet owners
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight max-w-2xl">
          Care for your pets, <span className="text-blue-500">simplified</span>
        </h1>
        <p className="text-gray-500 text-lg mb-10 max-w-lg leading-relaxed">
          Find trusted pet care services near you. Book groomers, vets, trainers
          and more — all in one place.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/register"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3.5 rounded-full transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-8 py-3.5 rounded-full transition-colors shadow-sm"
          >
            Log in
          </Link>
        </div>
      </main>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto px-8 pb-16 mt-4">
        {[
          {
            icon: "🐾",
            title: "Find Services",
            desc: "Browse grooming, vet care, boarding, walking and more near your location.",
          },
          {
            icon: "📅",
            title: "Easy Booking",
            desc: "Book appointments in seconds and manage all your pet's schedules in one place.",
          },
          {
            icon: "⭐",
            title: "Trusted Providers",
            desc: "Every service provider is verified and reviewed by our pet-loving community.",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2 text-base">
              {feature.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-8 pb-16">
        <div className="bg-white rounded-3xl shadow-sm px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Ready to find care for your pet?
            </h2>
            <p className="text-gray-400 text-sm">
              Join thousands of happy pet owners on FurSure.
            </p>
          </div>
          <Link
            href="/register"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-full transition-colors whitespace-nowrap"
          >
            Create an account
          </Link>
        </div>
      </section>
    </div>
  );
}

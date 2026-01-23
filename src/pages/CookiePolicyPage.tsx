import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useUser } from "@/contexts/UserContext";

export default function CookiePolicyPage() {
  const { user, isAuthenticated } = useUser();

  return (
    <div className="min-h-screen bg-white">
      <Navbar isAuthenticated={isAuthenticated} user={user} />

      <main className="pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-8 sm:px-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Cookie Policy</h1>
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Effective Date:</span> ___ / ___ / 20__
              </p>
            </div>

            <div className="px-6 py-8 sm:px-10">
              <div className="space-y-8 text-sm leading-6 text-gray-700">
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">1. What Are Cookies?</h2>
                  <p>
                    Cookies are small text files stored on your device that help websites and apps function correctly, improve performance, and remember preferences.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">2. How We Use Cookies</h2>
                  <div className="space-y-2">
                    <p>
                      We may use cookies or similar technologies for authentication/session management, security, basic analytics, and improving user experience.
                    </p>
                    <p>
                      Some features may not work properly if cookies are disabled.
                    </p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">3. Managing Cookies</h2>
                  <p>
                    You can control cookies through your browser settings. Note that disabling cookies may affect the Platform&apos;s functionality.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">4. Contact</h2>
                  <div>
                    <div>sweeprocustomerservice@gmail.com</div>
                    <div>Hyderabad, Telangana</div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useUser } from "@/contexts/UserContext";
import { TermsContent } from "@/components/legal/TermsContent";

export default function TermsPage() {
  const { user, isAuthenticated } = useUser();

  return (
    <div className="min-h-screen bg-white">
      <Navbar isAuthenticated={isAuthenticated} user={user} />

      <main className="pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-8 sm:px-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Sweepro Terms &amp; Conditions</h1>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-gray-800">Effective Date:</span> ___ / ___ / 20__
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Company:</span> Sweepro Private Limited
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Registered Office:</span> Hyderabad, Telangana
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Customer Support Email:</span> sweeprocustomerservice@gmail.com
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-10">
              <TermsContent />
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            These Terms are provided for general operational clarity for the Sweepro platform and services.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

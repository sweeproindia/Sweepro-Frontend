import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useUser } from "@/contexts/UserContext";

export default function PrivacyPolicyPage() {
  const { user, isAuthenticated } = useUser();

  return (
    <div className="min-h-screen bg-white">
      <Navbar isAuthenticated={isAuthenticated} user={user} />

      <main className="pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-8 sm:px-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-semibold text-gray-800">Effective Date:</span> ___ / ___ / 20__
              </p>
            </div>

            <div className="px-6 py-8 sm:px-10">
              <div className="space-y-8 text-sm leading-6 text-gray-700">
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">1. Overview</h2>
                  <p>
                    This Privacy Policy explains how Sweepro Private Limited (&quot;Sweepro&quot;) collects, uses, shares, and protects personal information when you use our
                    website/app and subscription-based home care services.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">2. Information We Collect</h2>
                  <div className="space-y-2">
                    <p>
                      We may collect information such as name, phone number, email address, service address, account details, booking/subscription details, and payment
                      status (we do not store full card details).
                    </p>
                    <p>
                      We may also collect technical data such as device information, IP address, and usage logs to improve reliability and security.
                    </p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">3. How We Use Information</h2>
                  <div className="space-y-2">
                    <p>To provide and manage subscriptions, bookings, support, and service delivery.</p>
                    <p>To verify users and service partners, prevent fraud, and improve safety.</p>
                    <p>To send service updates, reminders, and essential operational communications.</p>
                    <p>To improve the Platform experience, performance, and customer support.</p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">4. Sharing of Information</h2>
                  <div className="space-y-2">
                    <p>
                      We may share limited information with assigned Service Partners (for example, address and contact details) strictly to deliver the booked services.
                    </p>
                    <p>
                      We may share information with vendors (payment processors, SMS/email providers) only as necessary to operate the Platform.
                    </p>
                    <p>
                      We do not sell or rent personal data. We may disclose information if required by law or to protect rights, safety, and security.
                    </p>
                  </div>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">5. Data Protection &amp; Retention</h2>
                  <p>
                    We use reasonable administrative, technical, and organizational safeguards to protect data. We retain data only as long as necessary for service
                    delivery, compliance, dispute resolution, and legitimate business needs.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">6. Your Responsibilities</h2>
                  <p>
                    Keep your account credentials confidential. Notify us if you suspect unauthorized access. Always use official channels for support and disputes.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">7. Changes</h2>
                  <p>
                    We may update this Privacy Policy from time to time. Continued use of the Platform constitutes acceptance of the updated policy.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">8. Contact</h2>
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

import { useEffect, useState } from "react";

interface TermsSection {
  id: string;
  title: string;
  content: string;
}

interface TermsData {
  type: string;
  title: string;
  companyName: string;
  registeredOffice: string;
  customerSupportEmail?: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: TermsSection[];
}

interface TermsContentProps {
  userType: "customer" | "worker";
}

export function TermsContent({ userType }: TermsContentProps) {
  const [terms, setTerms] = useState<TermsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/terms?type=${userType}`);
        const data = await response.json();
        
        if (data.success) {
          setTerms(data.data);
        } else {
          setError(data.message || "Failed to load terms");
        }
      } catch (err) {
        setError("Failed to load terms. Please try again.");
        console.error("Error fetching terms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [userType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-200 border-t-gray-900"></div>
          <p className="mt-4 text-sm text-gray-600">Loading terms...</p>
        </div>
      </div>
    );
  }

  if (error || !terms) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-sm text-red-800">{error || "Failed to load terms"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-800">
      <div className="space-y-4 border-b border-gray-100 pb-6">
        <h2 className="text-2xl font-bold text-gray-900">{terms.title}</h2>
        <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
          <div>
            <span className="font-semibold text-gray-800">Company:</span> {terms.companyName}
          </div>
          <div>
            <span className="font-semibold text-gray-800">Registered Office:</span> {terms.registeredOffice}
          </div>
          <div>
            <span className="font-semibold text-gray-800">Effective Date:</span> {terms.effectiveDate}
          </div>
          <div>
            <span className="font-semibold text-gray-800">Last Updated:</span> {terms.lastUpdated}
          </div>
          {terms.customerSupportEmail && (
            <div className="sm:col-span-2">
              <span className="font-semibold text-gray-800">Customer Support Email:</span> {terms.customerSupportEmail}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {terms.sections.map((section) => (
          <section key={section.id} className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
            <div className="text-sm leading-7 text-gray-700 whitespace-pre-line">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

const defaultSEO = {
  title: 'Sweepro | Cleaning Service Management & Booking Platform - India',
  description: 'Sweepro is India\'s leading cleaning service management & booking platform. Manage customers, bookings, staff schedules, invoices and payments efficiently. Book professional cleaning services online.',
  keywords: 'Sweepro, cleaning services India, cleaning service management, cleaning booking platform, house cleaning India, office cleaning, facility management, housekeeping services, maid service booking, cleaning business software, cleaning app, customer bookings, online payments, professional cleaners, home cleaning services, commercial cleaning',
  ogImage: 'https://www.sweepro.in/android-chrome-512x512.png',
  ogType: 'website',
};

export default function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogType,
  noIndex = false,
  structuredData,
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    document.title = title || defaultSEO.title;

    // Update meta description
    updateMetaTag('description', description || defaultSEO.description);

    // Update meta keywords
    updateMetaTag('keywords', keywords || defaultSEO.keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', title || defaultSEO.title, 'property');
    updateMetaTag('og:description', description || defaultSEO.description, 'property');
    updateMetaTag('og:image', ogImage || defaultSEO.ogImage, 'property');
    updateMetaTag('og:type', ogType || defaultSEO.ogType, 'property');
    updateMetaTag('og:url', `https://www.sweepro.in${location.pathname}`, 'property');

    // Update Twitter tags
    updateMetaTag('twitter:title', title || defaultSEO.title);
    updateMetaTag('twitter:description', description || defaultSEO.description);
    updateMetaTag('twitter:image', ogImage || defaultSEO.ogImage);

    // Update canonical URL
    updateCanonicalTag(`https://www.sweepro.in${location.pathname}`);

    // Handle noindex
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // Update structured data
    if (structuredData) {
      updateStructuredData(structuredData);
    }

    // Cleanup on unmount
    return () => {
      // Reset to defaults if needed
    };
  }, [title, description, keywords, ogImage, ogType, noIndex, structuredData, location.pathname]);

  return null;
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonicalTag(href: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
}

function updateStructuredData(data: Record<string, any>) {
  let element = document.getElementById('dynamic-structured-data');
  
  if (!element) {
    element = document.createElement('script');
    element.setAttribute('type', 'application/ld+json');
    element.setAttribute('id', 'dynamic-structured-data');
    document.head.appendChild(element);
  }
  
  element.textContent = JSON.stringify(data);
}

// Helper function to generate Organization schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sweepro',
    url: 'https://www.sweepro.in/',
    logo: 'https://www.sweepro.in/android-chrome-512x512.png',
    description: 'India\'s leading cleaning service management & booking platform',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-81433-53030',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://wa.me/918143353030',
    ],
  };
}

// Helper function to generate Service schema
export function generateServiceSchema(serviceName: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: description,
    provider: {
      '@type': 'Organization',
      name: 'Sweepro',
      url: 'https://www.sweepro.in/',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };
}

// Helper function to generate FAQ schema
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

import React from 'react';

interface BlogAuthor {
  name: string;
  url?: string;
}

interface BlogJsonLdProps {
  url: string;
  title: string;
  images: string[];
  datePublished: string;
  dateModified?: string;
  authorName: string | BlogAuthor[];
  description: string;
  publisherName?: string;
  publisherLogo?: string;
}

export function BlogJsonLd({
  url,
  title,
  images,
  datePublished,
  dateModified,
  authorName,
  description,
  publisherName = 'Healthmap',
  publisherLogo = 'https://healthmap.io/logo.png'
}: BlogJsonLdProps) {
  // Format authors array
  const authors = Array.isArray(authorName)
    ? authorName
    : [{ name: authorName }];
  
  // Build JSON-LD data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    headline: title,
    description: description,
    image: images,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: authors.map(author => ({
      '@type': 'Person',
      name: author.name,
      url: author.url
    })),
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Health condition schema for medical content
interface HealthConditionJsonLdProps {
  name: string;
  description: string;
  symptoms?: string[];
  treatments?: string[];
  riskFactors?: string[];
  url: string;
}

export function HealthConditionJsonLd({
  name,
  description,
  symptoms = [],
  treatments = [],
  riskFactors = [],
  url
}: HealthConditionJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: name,
    description: description,
    possibleTreatment: treatments.map(treatment => ({
      '@type': 'MedicalTherapy',
      name: treatment
    })),
    signOrSymptom: symptoms.map(symptom => ({
      '@type': 'MedicalSymptom',
      name: symptom
    })),
    riskFactor: riskFactors.map(risk => ({
      '@type': 'MedicalRiskFactor',
      name: risk
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// FAQPage schema for FAQ sections
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPageJsonLd({
  items,
  url
}: {
  items: FAQItem[];
  url: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
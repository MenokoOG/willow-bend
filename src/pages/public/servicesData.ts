export type ServiceItem = {
  id: string;
  title: string;
  price: string;
  summary: string;
  details: string[];
  pending?: boolean;
  ctaLabel?: string;
  ctaTo?: string;
};

export const SERVICES: ServiceItem[] = [
  {
    id: "med-refill",
    title: "Medication Refill / Review",
    price: "$50 – $200",
    summary:
      "If you can’t get into your primary, went without insurance, or need a medication review.",
    details: [
      "Condition evaluation and medication review",
      "Refill extension when appropriate",
      "Cash pay service (price varies by complexity)",
    ],
    ctaLabel: "Request Appointment",
    ctaTo: "/request",
  },
  {
    id: "dot",
    title: "DOT Examinations",
    price: "$100 cash",
    summary:
      "Standard DOT Physicals for intrastate and over-the-road drivers.",
    details: ["DOT physical exam", "Fast, straightforward scheduling"],
    ctaLabel: "Request DOT Exam",
    ctaTo: "/request",
  },
  {
    id: "house-calls",
    title: "House Calls",
    price: "± $100 cash",
    summary:
      "Assessment visits for loved ones who won’t come into the office.",
    details: [
      "In-home assessment",
      "Not covered by insurance",
      "Pricing depends on location",
    ],
    ctaLabel: "Ask About House Calls",
    ctaTo: "/contact",
  },
  {
    id: "mmj",
    title: "Medical Marijuana Endorsement / Evaluation",
    price: "Initial $150 • Renewals $125",
    summary:
      "Washington State evaluations for qualifying conditions and renewals.",
    details: [
      "Evaluation for treatment eligibility",
      "Renewals available",
      "May reduce cost of care for some patients",
    ],
    ctaLabel: "Request Evaluation",
    ctaTo: "/request",
  },
  {
    id: "advocacy",
    title: "Medical Advocacy",
    price: "$100 – $300",
    summary:
      "Support when you’re not being heard or need help with a rejected VA claim.",
    details: [
      "Case review and guidance",
      "Letters/referrals when appropriate",
      "Help coordinating specialist care",
    ],
    ctaLabel: "Contact for Advocacy",
    ctaTo: "/contact",
  },
  {
    id: "functional",
    title: "Functional Medicine",
    price: "Pending",
    summary:
      "A whole-body approach that evaluates the system and aims to restore balance.",
    details: [
      "Holistic, natural approach",
      "System-level evaluation",
      "Service coming soon",
    ],
    pending: true,
    ctaLabel: "Join Waitlist (Soon)",
    ctaTo: "/contact",
  },
];
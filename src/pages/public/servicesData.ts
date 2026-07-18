export type ServiceItem = {
  id: string;
  title: string;
  price: string;
  summary: string;
  details: string[];
  tint: "sage" | "clay";
  pending?: boolean;
  ctaLabel?: string;
  ctaTo?: string;
};

// Fictional demo service menu for Willow Bend Family Clinic.
// All services and prices are made up for demonstration purposes.
export const SERVICES: ServiceItem[] = [
  {
    id: "sick-visit",
    title: "Same-Day Sick Visits",
    price: "$75 flat",
    summary:
      "Feeling rough? Same-day and next-day openings for colds, flu, infections, and minor injuries.",
    details: [
      "Same-day scheduling when available",
      "Adults and children welcome",
      "Simple cash-pay pricing",
    ],
    tint: "sage",
    ctaLabel: "Request Appointment",
    ctaTo: "/request",
  },
  {
    id: "physicals",
    title: "Sports & School Physicals",
    price: "$45",
    summary:
      "Quick, careful exams to keep the whole family active — sports teams, camps, and school forms.",
    details: [
      "Forms completed during the visit",
      "Fast, straightforward scheduling",
    ],
    tint: "clay",
    ctaLabel: "Request Physical",
    ctaTo: "/request",
  },
  {
    id: "med-review",
    title: "Medication Review & Refill",
    price: "$60 – $120",
    summary:
      "If you're between providers or need a fresh look at your medications, we can help bridge the gap.",
    details: [
      "Condition evaluation and medication review",
      "Refill extension when appropriate",
      "Price varies by complexity",
    ],
    tint: "sage",
    ctaLabel: "Request Review",
    ctaTo: "/request",
  },
  {
    id: "chronic-care",
    title: "Chronic Care Management",
    price: "$90 / visit",
    summary:
      "Ongoing support for diabetes, blood pressure, thyroid, and other long-term conditions.",
    details: [
      "Regular follow-up visits",
      "Care plans you can actually follow",
      "Coordination with specialists",
    ],
    tint: "clay",
    ctaLabel: "Request Appointment",
    ctaTo: "/request",
  },
  {
    id: "house-calls",
    title: "House Calls",
    price: "From $150",
    summary:
      "In-home assessment visits for loved ones who can't easily come into the office.",
    details: [
      "In-home assessment",
      "Not covered by insurance",
      "Pricing depends on location",
    ],
    tint: "sage",
    ctaLabel: "Ask About House Calls",
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
    tint: "clay",
    pending: true,
    ctaLabel: "Join Waitlist (Soon)",
    ctaTo: "/contact",
  },
];

export type PageSchema = Record<string, string>;

export const pageSchemas: Record<string, PageSchema> = {
  home: {
    heroTitle: "Care that treats you like a human",
    heroSubtitle: "Primary care rooted in respect, experience, and compassion.",
    ctaText: "Request an appointment",
  },
  services: {
    title: "Services",
    body: "Family-practice services for every member of the family, focused on long-term health.",
  },
  testimonials: {
    quote1: "I finally felt heard as a patient.",
    quote2: "Respectful, thoughtful, and thorough care.",
  },
  contact: {
    address: "Willow Bend Family Clinic, 480 Willow Bend Dr, Suite 100, Meridian, ID 83642",
    phone: "(208) 555-0142",
  },
};

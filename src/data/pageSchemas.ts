export type PageSchema = Record<string, string>;

export const pageSchemas: Record<string, PageSchema> = {
  home: {
    heroTitle: "Care that feels like family.",
    heroSubtitle:
      "Unhurried, whole-person primary care for every stage of life — right here in your neighborhood. Same-week appointments and a team that actually knows your name.",
    ctaText: "Book a visit",
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

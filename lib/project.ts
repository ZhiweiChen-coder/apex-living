export const project = {
  name: "The Aster House",
  location: "Potts Point, Sydney",
  address: "18 Macleay Street, Potts Point NSW 2011",
  availability: "Now selling · Completion Q4 2027",
  price: "From $2.45M",
  developer: "Apex Living Collection",
  bodyCorporate: "Estimated from $1,860 per quarter",
  positioning:
    "A considered collection of 18 harbour-edge residences for buyers seeking a refined Sydney base or a tightly held long-term asset.",
  investment:
    "Suited to discerning owner-occupiers and long-term investors. This is a demonstration listing, not financial advice.",
  schools: [
    "Fort Street Public School — approximately 2.1 km",
    "Sydney Secondary College, Blackwattle Bay Campus — approximately 4.5 km",
    "Inner Sydney High School — approximately 2.4 km",
  ],
  amenities: [
    { title: "Private arrival", detail: "A stone-lined lobby with a resident concierge and secure parcel room." },
    { title: "Rooftop observatory", detail: "A landscaped entertaining terrace facing the city and harbour." },
    { title: "Wellness studio", detail: "A quiet movement space, infrared sauna and recovery lounge." },
    { title: "Cellar & dining room", detail: "A bookable private dining salon with temperature-controlled wine storage." },
  ],
  facts: [
    ["18", "private residences"],
    ["2–4", "bedroom homes"],
    ["Q4 ’27", "anticipated completion"],
    ["1.5 km", "to the CBD"],
  ],
  viewingDates: ["Thursday, 21 August", "Saturday, 23 August", "Wednesday, 27 August"],
  viewingSlots: ["10:00 am", "11:30 am", "1:00 pm", "3:30 pm"],
  images: {
    hero: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90",
    living: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
    detail: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
  },
} as const;

export const knowledgeContext = `
Property: ${project.name}, ${project.location}.
Address: ${project.address}.
Availability: ${project.availability}. Indicative pricing: ${project.price}.
Positioning: ${project.positioning}
Investment: ${project.investment}
Body corporate: ${project.bodyCorporate}.
Nearby public schools: ${project.schools.join("; ")}.
Amenities: ${project.amenities.map((amenity) => `${amenity.title}: ${amenity.detail}`).join("; ")}.
`;

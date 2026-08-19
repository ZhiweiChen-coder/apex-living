import { project } from "@/lib/project";

function includesAny(question: string, terms: string[]) {
  return terms.some((term) => question.includes(term));
}

export function buildFallbackAnswer(input: string) {
  const question = input.toLowerCase();

  if (/^\s*(hi|hello|hey|good morning|good afternoon|good evening)[!.?\s]*$/i.test(input) || includesAny(question, ["who are you", "what are you", "your role"])) {
    return `Welcome to ${project.name}. I’m the digital property concierge for this demonstration listing, here to help with the residences, amenity spaces, nearby schools, estimated outgoings, or a private viewing.`;
  }
  if (includesAny(question, ["school", "education", "public school"])) {
    return `For local schooling, ${project.name} is close to ${project.schools.join(", ")}. Distances are approximate; we recommend confirming current catchments directly with the relevant education authority.`;
  }
  if (includesAny(question, ["rent", "rental", "renting", "lease", "tenant", "self-liv", "self liv", "live in", "owner-occupier", "owner occupier"])) {
    return `For self-living, ${project.name} is designed for discerning owner-occupiers, with private arrival, rooftop entertaining and wellness spaces. For renting, it is positioned as a tightly held long-term asset, but this demonstration listing does not provide a verified rental yield, vacancy estimate or guaranteed return. ${project.investment}`;
  }
  if (includesAny(question, ["invest", "investment", "yield", "return"])) {
    return `${project.name} is positioned for long-term investors as well as owner-occupiers, with only 18 residences in Potts Point. ${project.investment}`;
  }
  if (includesAny(question, ["fee", "strata", "body corporate", "outgoings"])) {
    return `Estimated body corporate contributions start from ${project.bodyCorporate}. Final levies will be confirmed in the contract and are subject to the completed scheme.`;
  }
  if (includesAny(question, ["complete", "completion", "move", "settle", "finish"])) {
    return `${project.name} is anticipated to complete in Q4 2027. We can share the current construction and settlement information during a private viewing.`;
  }
  if (includesAny(question, ["amenit", "gym", "sauna", "rooftop", "facilit"])) {
    return `Residents will have access to ${project.amenities.map((item) => item.title.toLowerCase()).join(", ")}. Each is designed as a private extension of the home rather than a high-traffic shared facility.`;
  }
  const price = project.price.replace(/^from\s+/i, "");
  return `${project.name} is a collection of 18 residences at ${project.location}, with homes from ${price} and anticipated completion in Q4 2027. I can help with amenities, nearby schools, estimated outgoings, or arranging a private viewing.`;
}

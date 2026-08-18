const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phonePattern = /(?<!\w)(?:\+?\d[\d\s().-]{6,}\d)(?!\w)/g;

export function redactContactDetails(value: string) {
  return value.replace(emailPattern, "[email removed]").replace(phonePattern, "[phone removed]");
}

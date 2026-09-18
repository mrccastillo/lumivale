export type ServiceFaq = { id: string; question: string; answer: string };

export function normalizeServiceFaqs(value: unknown): ServiceFaq[] {
  if (!Array.isArray(value)) throw new Error("Service FAQs must be a list.");
  const ids = new Set<string>();
  return value.map((item: unknown, index) => {
    if (!item || typeof item !== "object") throw new Error(`FAQ ${index + 1} is invalid.`);
    const { id, question, answer } = item as Record<string, unknown>;
    if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id) || ids.has(id)) {
      throw new Error("FAQ identities must be valid and unique. Reload the service and try again.");
    }
    if (typeof question !== "string" || !question.trim() || typeof answer !== "string" || !answer.trim()) {
      throw new Error(`FAQ ${index + 1} requires a question and answer.`);
    }
    ids.add(id);
    return { id, question: question.trim(), answer: answer.trim() };
  });
}

export function parseServiceFaqs(value: FormDataEntryValue | null) {
  let parsed: unknown;
  try { parsed = JSON.parse(String(value)); }
  catch { throw new Error("Service FAQ data is invalid. Reload the service and try again."); }
  return normalizeServiceFaqs(parsed);
}

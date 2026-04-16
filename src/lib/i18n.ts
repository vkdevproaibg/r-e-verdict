// Lightweight bilingual helper. RU primary + EN sub-label.
export type Bi = { ru: string; en: string };

export const bi = (ru: string, en: string): Bi => ({ ru, en });

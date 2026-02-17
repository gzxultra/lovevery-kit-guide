export interface Alternative {
  name: string;
  asin: string;
  price: string | null;
  rating: number | null;
  reviewCount: number | null;
  amazonUrl: string;
  imageUrl?: string;
  reasonEn: string;
  reasonCn: string;
}

export interface ToyAlternative {
  toyName: string;
  toyNameCn: string;
  alternatives: Alternative[];
}

export interface KitAlternative {
  kitId: string;
  kitName: string;
  toys: ToyAlternative[];
}

import alternativesData from "../../../scripts/lovevery_alternatives.json";

export const alternatives: KitAlternative[] = alternativesData as KitAlternative[];

export function getToyAlternatives(kitId: string, toyName: string): Alternative[] {
  const kit = alternatives.find((k) => k.kitId === kitId);
  if (!kit) return [];
  const toy = kit.toys.find((t) => t.toyName === toyName);
  return toy?.alternatives || [];
}

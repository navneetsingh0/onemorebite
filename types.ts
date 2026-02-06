
export type Mood = 'Tired' | 'Stressed' | 'Happy' | 'Bored' | 'Celebrating';
export type Place = 'Hostel Room' | 'Canteen' | 'Market' | 'Home' | 'Cafe';
export type Budget = 'Broke' | 'Standard' | 'Splurge';

export interface Message {
  id: string;
  role: 'user' | 'buddy';
  content: string;
  timestamp: Date;
  metadata?: {
    originalFood?: string;
    suggestedFood?: string;
    originalPrice?: number;
    suggestedPrice?: number;
    healthRisk?: string;
    healthBenefits?: string;
    imageUrl?: string;
    mood?: Mood;
    place?: Place;
    budget?: Budget;
    nearbySpotName?: string;
    nearbySpotLink?: string;
  };
}

export interface BuddyResponse {
  nudge: string;
  suggestedFood: string;
  originalPrice: number;
  suggestedPrice: number;
  healthRisk: string;
  healthBenefits: string;
  imagePrompt: string;
  nearbySpotName?: string;
  nearbySpotLink?: string;
}

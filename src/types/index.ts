export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserProfile {
  skinType?: string;
  concerns?: string[];
  experience?: string;
  age?: string;
  sensitivities?: string;
  country?: string;
  completed: boolean;
}

export interface RoutineProduct {
  id: string;
  name: string;
  type: string;
  timeOfDay: 'AM' | 'PM' | 'Both';
  step: number;
  notes?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'text';
  options?: string[];
  field: keyof Omit<UserProfile, 'completed'>;
}

export interface ProductEntry {
  id: string;
  name: string;
  type: string;
  ingredients?: string;
}

export interface AnalysisReport {
  summary: string;
  layeringOrder: { step: number; product: string; reason: string }[];
  conflicts: { products: string[]; issue: string; severity: 'high' | 'medium' | 'low' }[];
  recommendations: string[];
  amRoutine: string[];
  pmRoutine: string[];
}

export interface PriceResult {
  retailer: string;
  price: string;
  currency: string;
  url: string;
  inStock: boolean;
  note?: string;
}

export interface SavedProduct {
  id: string;
  name: string;
  brand?: string;
  savedAt: string;
  source: 'manual' | 'reality-check' | 'check-products' | 'ingredient-decoder' | 'chat';
  lastPriceSearch?: {
    searchedAt: string;
    results: PriceResult[];
  };
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'skinType',
    question: "What's your skin type?",
    subtitle: "This helps us tailor every recommendation to how your skin actually behaves.",
    type: 'single',
    field: 'skinType',
    options: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive', "I'm not sure"]
  },
  {
    id: 'concerns',
    question: "What are your main skin concerns?",
    subtitle: "Select everything that applies — we'll prioritise what matters most to you.",
    type: 'multi',
    field: 'concerns',
    options: ['Acne / Breakouts', 'Hyperpigmentation', 'Fine lines & aging', 'Dryness', 'Redness / Rosacea', 'Large pores', 'Dullness', 'Dark circles']
  },
  {
    id: 'experience',
    question: "How would you describe your skincare experience?",
    subtitle: "We'll adjust the depth of our explanations to match your knowledge level.",
    type: 'single',
    field: 'experience',
    options: ['Beginner — just starting out', 'Intermediate — I have a basic routine', 'Advanced — I use multiple actives', 'Expert — I know my ingredients well']
  },
  {
    id: 'age',
    question: "What's your age range?",
    subtitle: "Skin needs change over time — this helps us give age-appropriate guidance.",
    type: 'single',
    field: 'age',
    options: ['Under 25', '25–34', '35–44', '45–54', '55+', 'Prefer not to say']
  },
  {
    id: 'sensitivities',
    question: "Any known sensitivities or ingredients to avoid?",
    subtitle: "We'll flag any products or ingredients that could be a problem for you.",
    type: 'text',
    field: 'sensitivities',
  },
  {
    id: 'country',
    question: "Where are you based?",
    subtitle: "We'll find the best prices from retailers that ship to you.",
    type: 'single',
    field: 'country',
    options: ['United Kingdom', 'United States', 'Australia', 'Canada', 'Europe', 'Other']
  }
];

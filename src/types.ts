// types.ts

export enum Style {
  Punchy = "Punchy",
  Detailed = "Detailed",
  Storytelling = "Storytelling",
  Humorous = "Humorous",
  Professional = "Professional",
}

export enum Niche {
  Tech = "Tech",
  Finance = "Finance",
  Fitness = "Fitness",
  Education = "Education",
  Marketing = "Marketing",
  Lifestyle = "Lifestyle",
  Other = "Other",
}

export enum EmojiFrequency {
  None = "None",
  Few = "Few",
  Many = "Many",
}

export enum NumberingStyle {
  None = "None",
  Emoji = "1️⃣",
  Numeric = "1.",
  Arrow = "➡️",
}

export enum PostImageStyle {
  Minimal = "Minimal",
  Techy = "Techy",
  Casual = "Casual",
  Professional = "Professional",
  Bold = "Bold / Viral",
  DarkMode = "Dark Mode",
  Notebook = "Notebook / Handwritten",
  Infographic = "Infographic",
  Gradient = "Gradient / Aesthetic",
}

export enum Audience {
  Beginners = "Beginners",
  Pros = "Pros",
  General = "General Audience",
}

export interface FormData {
  topic: string;
  style: Style;
  length: number;
  niche: Niche;
  otherNiche?: string;
  emojiFrequency: EmojiFrequency;
  numberingStyle: NumberingStyle;
  toneAndVoice: string;
  audience: Audience;
  generateImage: boolean; // Topic Image
  imageStyle: PostImageStyle; // Topic Image Style (now unified)
  topicImagePromptMode: 'style' | 'custom'; // New: To select image generation mode
  customTopicImagePrompt?: string; // New: For user's custom prompt
  generateHookImage: boolean;
  generateBodyImages: boolean; // New: For all body posts
  postImageStyle: PostImageStyle; // New: Consolidated style for hook and body
  addBranding: boolean;
  usernameHandle: string;
}

export interface HookVariations {
  curiosity: string;
  listicle: string;
  emotional: string;
  contrarian: string;
}

export interface CtaVariations {
  question: string;
  recap: string;
  promotional: string;
}

export interface GeneratedThread {
  hookVariations: HookVariations;
  bodyPosts: string[];
  ctaVariations: CtaVariations;
  hashtags: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  formData: FormData;
  thread: GeneratedThread;
  topicImage?: string | null;
  hookImage?: string | null;
  bodyImages?: (string | null)[]; // New: To store body post images
}
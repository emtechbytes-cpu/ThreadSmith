import { Niche, Style, EmojiFrequency, NumberingStyle, PostImageStyle, Audience } from './types';

export const NICHES: Niche[] = [
  Niche.Tech,
  Niche.Finance,
  Niche.Fitness,
  Niche.Education,
  Niche.Marketing,
  Niche.Lifestyle,
  Niche.Other,
];

export const STYLES: Style[] = [
  Style.Punchy, 
  Style.Detailed,
  Style.Storytelling,
  Style.Humorous,
  Style.Professional
];

export const AUDIENCES: Audience[] = [
  Audience.Beginners,
  Audience.Pros,
  Audience.General,
];

export const EMOJI_FREQUENCIES: EmojiFrequency[] = [
  EmojiFrequency.None,
  EmojiFrequency.Few,
  EmojiFrequency.Many,
];

export const NUMBERING_STYLES: { label: string; value: NumberingStyle }[] = [
  { label: "None", value: NumberingStyle.None },
  { label: "1️⃣ 2️⃣", value: NumberingStyle.Emoji },
  { label: "1. 2", value: NumberingStyle.Numeric },
  { label: "➡️ ➡️", value: NumberingStyle.Arrow },
];

export const POST_IMAGE_STYLES: { label: string; value: PostImageStyle; description: string }[] = [
  { label: "Minimal", value: PostImageStyle.Minimal, description: "Elegant and minimalist with sophisticated typography on a subtle gradient." },
  { label: "Techy", value: PostImageStyle.Techy, description: "Sleek, futuristic design with sharp lines and neon accents." },
  { label: "Casual", value: PostImageStyle.Casual, description: "Friendly and approachable with rounded fonts and bright colors." },
  { label: "Professional", value: PostImageStyle.Professional, description: "Corporate colors and clean fonts, perfect for LinkedIn." },
  { label: "Bold / Viral", value: PostImageStyle.Bold, description: "High-contrast colors and huge fonts for maximum attention." },
  { label: "Dark Mode", value: PostImageStyle.DarkMode, description: "A sleek dark background with crisp white or neon text." },
  { label: "Notebook", value: PostImageStyle.Notebook, description: "A casual, handwritten or typewriter look on a paper texture." },
  { label: "Infographic", value: PostImageStyle.Infographic, description: "Clean icons and diagrams for an educational, data-driven feel." },
  { label: "Gradient", value: PostImageStyle.Gradient, description: "Modern aesthetic with beautiful pastel or vibrant gradients." },
];
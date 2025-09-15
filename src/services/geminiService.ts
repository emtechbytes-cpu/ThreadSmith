import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, GeneratedThread, PostImageStyle, HookVariations, Niche, Audience, Style } from '../types';

// FIX: Corrected the API key initialization to use process.env.API_KEY as per guidelines.
// The 'ai' instance is now initialized conditionally to prevent app crashes if the key is missing.
const apiKey = import.meta.env.VITE_API_KEY;
let ai: GoogleGenAI | undefined;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

const checkAiInitialized = () => {
    if (!ai) {
        // FIX: Updated error message to reference API_KEY instead of VITE_API_KEY.
        throw new Error("Gemini AI client is not initialized. Please make sure your API_KEY is set correctly in your .env file and that you have restarted the development server.");
    }
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    hookVariations: {
      type: Type.OBJECT,
      description: "4 variations for the opening post (hook) of the thread.",
      properties: {
        curiosity: { type: Type.STRING, description: "A hook that piques curiosity." },
        listicle: { type: Type.STRING, description: "A hook formatted as a listicle teaser." },
        emotional: { type: Type.STRING, description: "A hook that connects on an emotional level." },
        contrarian: { type: Type.STRING, description: "A hook that presents a contrarian viewpoint." },
      },
      required: ["curiosity", "listicle", "emotional", "contrarian"],
    },
    bodyPosts: {
      type: Type.ARRAY,
      description: "The main body of the thread, with each element being a separate post.",
      items: { type: Type.STRING },
    },
    ctaVariations: {
      type: Type.OBJECT,
      description: "3 variations for the closing post (Call To Action) of the thread.",
      properties: {
        question: { type: Type.STRING, description: "A CTA that asks the audience a question." },
        recap: { type: Type.STRING, description: "A CTA that recaps the thread's main points." },
        promotional: { type: Type.STRING, description: "A promotional CTA (e.g., follow, subscribe)." },
      },
      required: ["question", "recap", "promotional"],
    },
    hashtags: {
      type: Type.ARRAY,
      description: "An array of 3-5 relevant hashtags.",
      items: { type: Type.STRING },
    },
  },
  required: ["hookVariations", "bodyPosts", "ctaVariations", "hashtags"],
};

const bodySchema = {
    type: Type.OBJECT,
    properties: {
        bodyPosts: {
            type: Type.ARRAY,
            description: "The main body of the thread, with each element being a separate post.",
            items: { type: Type.STRING },
        },
    },
    required: ["bodyPosts"],
};

const getStyleDescription = (style: Style): string => {
  switch (style) {
    case 'Punchy':
      return 'This means short, concise, and highly skim-able sentences.';
    case 'Detailed':
      return 'This means more explanatory, step-by-step, and in-depth content.';
    case 'Storytelling':
      return 'This means crafting a narrative, telling a story to engage the reader emotionally.';
    case 'Humorous':
      return 'This means using wit, jokes, and a lighthearted tone to entertain.';
    case 'Professional':
      return 'This means using a formal, objective, and authoritative tone suitable for a corporate or academic audience.';
    default:
      return '';
  }
};

const getAudienceDescription = (audience: Audience): string => {
    switch (audience) {
      case 'Beginners':
        return 'The content should be simple, easy-to-understand, and avoid jargon. Explain concepts from the ground up.';
      case 'Pros':
        return 'The content should be advanced, technical, and provide deep insights. Assume the audience is already knowledgeable on the topic.';
      case 'General Audience':
        return 'The content should be accessible and engaging for a broad audience with varying levels of knowledge. Strike a balance between simplicity and depth.';
      default:
        return '';
    }
};

const generatePrompt = (formData: FormData): string => {
  const niche = formData.niche === 'Other' && formData.otherNiche ? formData.otherNiche : formData.niche;
  return `
    You are ThreadSmith, an expert social media content strategist specializing in creating viral threads for platforms like Twitter/X.
    Your task is to generate a content thread based on the user's specifications.

    **CRITICAL RULES:**
    1.  **Character Limit:** EACH individual post (hook, body post, CTA) MUST be under 280 characters. This is non-negotiable.
    2.  **JSON Output:** Your entire output MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, explanations, or markdown formatting outside of the JSON object.
    3.  **No Markdown:** Do not use any markdown formatting (like **, __, #) within the post content strings.
    4.  **Actionable Steps:** If the topic is a 'how-to', a guide, or involves giving instructions (e.g., 'PC tips'), you MUST provide clear, numbered, step-by-step instructions. For example, instead of just "Open Task Manager", you should write "1. Press Ctrl + Shift + Esc to open Task Manager." Break down complex tasks into simple steps, ideally one major step per post.

    **User Specifications:**
    -   **Topic:** "${formData.topic}"
    -   **Niche:** "${niche}"
    -   **Audience:** "${formData.audience}". ${getAudienceDescription(formData.audience)}
    -   **Style:** "${formData.style}". ${getStyleDescription(formData.style)}
    -   **Thread Length:** The body should have exactly ${formData.length} posts.
    -   **Emoji Frequency:** "${formData.emojiFrequency}". Use emojis accordingly.
    ${formData.numberingStyle === 'None'
      ? '-   **Numbering Style:** Do not add any numbering or prefixes (like 1., ➡️, etc.) to the start of each body post.'
      : `-   **Numbering Style:** Use "${formData.numberingStyle}" to start each body post. For example, if the style is "1️⃣", the posts should start with "1️⃣", "2️⃣", etc.`
    }
    ${formData.toneAndVoice ? `-   **Tone & Voice:** Emulate this writing style: "${formData.toneAndVoice}"` : ''}

    Generate the complete thread now.
  `;
};


export const generateThread = async (formData: FormData): Promise<GeneratedThread> => {
  checkAiInitialized();
  const prompt = generatePrompt(formData);

  const response = await ai!.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  try {
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("The AI returned an invalid response. Please try again.");
  }
};


export const refineThread = async (
  currentThread: GeneratedThread,
  formData: FormData,
  instruction: string
): Promise<GeneratedThread> => {
  checkAiInitialized();
  const niche = formData.niche === 'Other' && formData.otherNiche ? formData.otherNiche : formData.niche;
  const prompt = `
    You are ThreadSmith, an AI assistant refining an existing social media thread.
    
    **Original Thread:**
    ${JSON.stringify(currentThread, null, 2)}

    **Original User Specifications:**
    -   **Topic:** "${formData.topic}"
    -   **Niche:** "${niche}"
    -   **Audience:** "${formData.audience}". ${getAudienceDescription(formData.audience)}
    -   **Style:** "${formData.style}". ${getStyleDescription(formData.style)}
    -   **Thread Length:** ${formData.length} body posts
    -   **Emoji Frequency:** "${formData.emojiFrequency}"
    ${formData.numberingStyle === 'None'
        ? '-   **Numbering Style:** None (No numbering prefixes on body posts)'
        : `-   **Numbering Style:** "${formData.numberingStyle}"`
    }
    ${formData.toneAndVoice ? `-   **Tone & Voice:** Emulate this writing style: "${formData.toneAndVoice}"` : ''}

    **User's Refinement Request:**
    "${instruction}"

    **Your Task:**
    Regenerate the entire thread based on the refinement request. You MUST adhere to all original specifications unless the refinement request explicitly overrides them.

    **CRITICAL RULES:**
    1.  **Character Limit:** EACH individual post (hook, body post, CTA) MUST be under 280 characters.
    2.  **JSON Output:** Your entire output MUST be a single, valid JSON object that strictly adheres to the provided schema.
    3.  **No Markdown:** Do not use any markdown formatting within the post content strings.
    4.  **Actionable Steps:** Ensure the thread follows the actionable steps rule: if the topic is a 'how-to' or a guide, each step must be a clear, explicit instruction (e.g., "Press Ctrl + Shift + Esc" instead of "Open Task Manager").

    Generate the refined thread now.
  `;

  const response = await ai!.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse Gemini refinement response:", response.text);
    throw new Error("The AI returned an invalid refinement. Please try again.");
  }
};

export const regenerateHook = async (
  formData: FormData,
  hookType: keyof HookVariations,
  existingHooks: HookVariations
): Promise<string> => {
  checkAiInitialized();
  const niche = formData.niche === 'Other' && formData.otherNiche ? formData.otherNiche : formData.niche;
  const hookDescription = {
      curiosity: "A hook that piques curiosity.",
      listicle: "A hook formatted as a listicle teaser.",
      emotional: "A hook that connects on an emotional level.",
      contrarian: "A hook that presents a contrarian viewpoint."
  };

  const prompt = `
    You are ThreadSmith, an expert social media content strategist.
    Your task is to regenerate a single hook for a thread.

    **CRITICAL RULES:**
    1.  **Character Limit:** The hook MUST be under 280 characters.
    2.  **Plain Text Output:** Your output MUST be only the text of the new hook. Do not include JSON, markdown, or any explanations.
    3.  **Be Different:** The new hook must be substantially different from the existing ones provided below.

    **Topic:** "${formData.topic}"
    **Niche:** "${niche}"
    **Audience:** "${formData.audience}"
    **Tone & Voice:** ${formData.toneAndVoice ? `Emulate this style: "${formData.toneAndVoice}"` : 'Professional yet engaging.'}

    **Existing Hooks (for reference, do not repeat):**
    - Curiosity: "${existingHooks.curiosity}"
    - Listicle: "${existingHooks.listicle}"
    - Emotional: "${existingHooks.emotional}"
    - Contrarian: "${existingHooks.contrarian}"

    **Regenerate this specific hook type:**
    -   **Type:** ${hookType}
    -   **Description:** ${hookDescription[hookType]}

    Generate only the new hook text now.
  `;

  const response = await ai!.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.trim();
};

export const regenerateBody = async (formData: FormData, currentThread: GeneratedThread): Promise<string[]> => {
    checkAiInitialized();
    const niche = formData.niche === 'Other' && formData.otherNiche ? formData.otherNiche : formData.niche;
    const prompt = `
        You are ThreadSmith, an AI assistant regenerating the body of an existing social media thread.

        **Context:**
        - **Hook:** "${currentThread.hookVariations.curiosity}"
        - **Original Body Posts (Do NOT repeat these):** ${JSON.stringify(currentThread.bodyPosts)}
        - **Call to Action:** "${currentThread.ctaVariations.question}"

        **User Specifications:**
        -   **Topic:** "${formData.topic}"
        -   **Niche:** "${niche}"
        -   **Audience:** "${formData.audience}". ${getAudienceDescription(formData.audience)}
        -   **Style:** "${formData.style}". ${getStyleDescription(formData.style)}
        -   **Thread Length:** The new body MUST have exactly ${formData.length} posts.
        -   **Emoji Frequency:** "${formData.emojiFrequency}". Use emojis accordingly.
        ${formData.numberingStyle === 'None'
            ? '-   **Numbering Style:** Do not add any numbering or prefixes.'
            : `-   **Numbering Style:** Use "${formData.numberingStyle}" to start each body post.`
        }
        ${formData.toneAndVoice ? `-   **Tone & Voice:** Emulate this style: "${formData.toneAndVoice}"` : ''}

        **Your Task:**
        Generate a completely new set of body posts for the thread. The new posts must be substantially different from the original ones but still logically connect the hook to the call to action.

        **CRITICAL RULES:**
        1.  **Character Limit:** EACH individual body post MUST be under 280 characters.
        2.  **JSON Output:** Your entire output MUST be a single, valid JSON object containing only a 'bodyPosts' array.
        3.  **Actionable Steps:** If the topic is instructional, provide clear, step-by-step instructions.

        Generate the new thread body posts now.
    `;

    const response = await ai!.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: bodySchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.bodyPosts;
    } catch (error) {
        console.error("Failed to parse Gemini body regeneration response:", response.text);
        throw new Error("The AI returned an invalid response for the thread body. Please try again.");
    }
};

export const getTrendingTopics = async (niche: Niche | string): Promise<{ topics: string[]; sources: {uri: string, title: string}[] }> => {
    checkAiInitialized();
    const prompt = `Using Google Search, find 5 current, viral, or highly debated trending topics in the "${niche}" niche. These topics should be perfect for creating a social media thread. Present them as a numbered list of concise, engaging titles. Do not include any other text, titles, or explanations before or after the list.`;
    
    try {
        const response = await ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const text = response.text.trim();
        const topics = text
            .split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(line => line.length > 0);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map((chunk: any) => chunk.web)
            .filter((web: any) => web?.uri)
            .map((web: any) => ({ uri: web.uri, title: web.title || web.uri }));

        const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

        return { topics, sources: uniqueSources };
    } catch (error) {
        console.error("Failed to fetch trending topics:", error);
        throw new Error("Could not fetch trending topics. The API may be unavailable or the request was blocked.");
    }
};

const getPostImagePrompt = (
    postText: string, 
    style: PostImageStyle, 
    niche: Niche | string, 
    branding: { add: boolean; handle: string; }, 
    options: { includeNicheIcon?: boolean; includeDownwardArrow?: boolean; } = {}
): string => {
    let stylePrefix = '';
    switch (style) {
        case 'Minimal':
            stylePrefix = 'An elegant, minimalist graphic with a subtle gradient background.';
            break;
        case 'Techy':
            stylePrefix = 'A sleek, futuristic graphic with glowing neon accents on a dark background.';
            break;
        case 'Casual':
            stylePrefix = 'A friendly graphic with a bright, vibrant solid color background.';
            break;
        case 'Professional':
            stylePrefix = 'A clean, authoritative graphic with a corporate color palette (e.g., blues, grays).';
            break;
        case 'Bold / Viral':
            stylePrefix = 'A maximum attention-grabbing graphic with high-contrast colors (like black, yellow, red).';
            break;
        case 'Dark Mode':
            stylePrefix = 'A sleek dark mode graphic with a charcoal background and crisp neon or white text.';
            break;
        case 'Notebook / Handwritten':
            stylePrefix = 'A casual graphic resembling a page from a notebook with a textured paper background and a handwritten or typewriter font.';
            break;
        case 'Infographic':
            stylePrefix = 'An educational, infographic-style graphic with clean icons and a structured layout.';
            break;
        case 'Gradient / Aesthetic':
            stylePrefix = 'A modern, aesthetic graphic with a beautiful pastel or vibrant gradient background.';
            break;
    }

    const textInstruction = `The image features the centered text: "${postText}". The typography is the main focus, extremely large, bold, and well-designed.`;
    
    const iconInstruction = (options.includeNicheIcon)
      ? `Includes a small, subtle, stylish icon related to the niche: "${niche}".`
      : '';
      
    const brandingInstruction = (branding.add && branding.handle)
      ? `A subtle, stylish, italic signature in the bottom-right corner reads: "${branding.handle}".`
      : '';
      
    const arrowInstruction = (options.includeDownwardArrow)
      ? 'A large, stylish downward-pointing arrow icon (↓) is at the bottom.'
      : '';
      
    const qualityInstruction = `Ensure zero spelling errors. High quality.`;

    return [stylePrefix, textInstruction, iconInstruction, arrowInstruction, brandingInstruction, qualityInstruction].filter(Boolean).join(' ');
};

const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    checkAiInitialized();
    try {
        const response = await ai!.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        throw new Error("Image generation succeeded but no image data was returned.");
    } catch (error) {
        console.error("Error during Gemini image generation from prompt:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unexpected error occurred during post image generation.");
    }
};

export const generateTopicImage = async (formData: FormData, branding: { add: boolean; handle: string; }): Promise<string> => {
    let prompt: string;

    if (formData.topicImagePromptMode === 'custom' && formData.customTopicImagePrompt) {
        prompt = formData.customTopicImagePrompt;
        const brandingInstruction = (branding.add && branding.handle)
          ? ` A subtle, stylish, italic signature in the bottom-right corner reads: "${branding.handle}".`
          : '';
        prompt += brandingInstruction;
    } else {
        // Fallback to style mode
        prompt = getPostImagePrompt(formData.topic, formData.imageStyle, '', branding, { includeNicheIcon: false, includeDownwardArrow: false });
    }
    
    return generateImageFromPrompt(prompt);
};

export const generateHookImage = async (hookText: string, style: PostImageStyle, niche: Niche | string, branding: { add: boolean; handle: string; }): Promise<string> => {
    const prompt = getPostImagePrompt(hookText, style, niche, branding, { includeNicheIcon: true, includeDownwardArrow: true });
    return generateImageFromPrompt(prompt);
};

export const generateBodyPostImage = async (postText: string, style: PostImageStyle, niche: Niche | string, branding: { add: boolean; handle: string; }): Promise<string> => {
    const prompt = getPostImagePrompt(postText, style, niche, branding, { includeNicheIcon: true, includeDownwardArrow: false });
    return generateImageFromPrompt(prompt);
};
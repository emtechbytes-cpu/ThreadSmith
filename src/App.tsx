import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';
import HistoryPanel from './components/HistoryPanel';
import MobileHeader from './components/MobileHeader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { generateThread, refineThread, generateTopicImage, generateHookImage, generateBodyPostImage, regenerateHook, regenerateBody } from './services/geminiService';
import type { FormData, GeneratedThread, HistoryItem, PostImageStyle, HookVariations } from './types';
import { Style as StyleEnum, Niche as NicheEnum, EmojiFrequency as EmojiFrequencyEnum, NumberingStyle as NumberingStyleEnum, PostImageStyle as PostImageStyleEnum, Audience as AudienceEnum } from './types';

const initialFormData: FormData = {
  topic: '',
  style: StyleEnum.Punchy,
  length: 5,
  niche: NicheEnum.Tech,
  otherNiche: '',
  emojiFrequency: EmojiFrequencyEnum.Few,
  numberingStyle: NumberingStyleEnum.Emoji,
  toneAndVoice: '',
  audience: AudienceEnum.General,
  generateImage: false,
  imageStyle: PostImageStyleEnum.Minimal,
  topicImagePromptMode: 'style',
  customTopicImagePrompt: '',
  generateHookImage: false,
  generateBodyImages: false,
  postImageStyle: PostImageStyleEnum.Minimal,
  addBranding: false,
  usernameHandle: '',
};

// Helper to parse complex error messages from the API
const parseApiError = (error: any): string => {
    const message = error.message || 'An unexpected error occurred.';
    try {
        // Errors from the Gemini API can be a JSON string within the message
        const jsonMatch = message.match(/\{.*\}/);
        if (jsonMatch) {
            const errorObj = JSON.parse(jsonMatch[0]);
            return errorObj.error?.message || message;
        }
    } catch (e) {
        // Not a JSON error, return original message
    }
    return message;
};


const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generatedThread, setGeneratedThread] = useState<GeneratedThread | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedHookImage, setGeneratedHookImage] = useState<string | null>(null);
  const [generatedBodyImages, setGeneratedBodyImages] = useState<(string | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRefinement, setIsLoadingRefinement] = useState(false);
  const [isRegeneratingTopicImage, setIsRegeneratingTopicImage] = useState(false);
  const [isRegeneratingHookImage, setIsRegeneratingHookImage] = useState(false);
  const [isRegeneratingBodyImage, setIsRegeneratingBodyImage] = useState<number | null>(null);
  const [isRegeneratingHook, setIsRegeneratingHook] = useState(false);
  const [isRegeneratingThreadBody, setIsRegeneratingThreadBody] = useState(false);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('threadsmith_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  const saveHistory = useCallback((newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem('threadsmith_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, []);

  const getBrandingInfo = (currentFormData: FormData) => {
    let handle = currentFormData.usernameHandle || '';
    if (handle && !handle.startsWith('@')) {
        handle = `@${handle}`;
    }
    return { add: currentFormData.addBranding, handle };
  };
  
  const generateImages = async (
    currentFormData: FormData,
    thread: GeneratedThread
  ): Promise<{ topicImage: string | null; hookImage: string | null; bodyImages: (string | null)[] }> => {
      const branding = getBrandingInfo(currentFormData);
      const niche = currentFormData.niche === 'Other' ? currentFormData.otherNiche || currentFormData.niche : currentFormData.niche;
      
      const topicImagePromise = currentFormData.generateImage
          ? generateTopicImage(currentFormData, branding)
          : Promise.resolve(null);
      
      const hookImagePromise = currentFormData.generateHookImage
          ? generateHookImage(thread.hookVariations.curiosity, currentFormData.postImageStyle, niche, branding)
          : Promise.resolve(null);
          
      const bodyImagesPromises = currentFormData.generateBodyImages
          ? Promise.all(thread.bodyPosts.map(post => generateBodyPostImage(post, currentFormData.postImageStyle, niche, branding)))
          : Promise.resolve([]);

      const [topicImage, hookImage, bodyImages] = await Promise.all([topicImagePromise, hookImagePromise, bodyImagesPromises]);
      
      return { topicImage, hookImage, bodyImages: bodyImages as (string|null)[] };
  };

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setFormData(data);
    setGeneratedThread(null);
    setGeneratedImage(null);
    setGeneratedHookImage(null);
    setGeneratedBodyImages([]);
    if (window.innerWidth < 1024) { // Close sidebar on mobile
        setIsSidebarOpen(false);
    }

    try {
      const thread = await generateThread(data);
      setGeneratedThread(thread);

      const { topicImage, hookImage, bodyImages } = await generateImages(data, thread);
      setGeneratedImage(topicImage);
      setGeneratedHookImage(hookImage);
      setGeneratedBodyImages(bodyImages);
      
      const newHistoryItem: HistoryItem = {
        id: `ts-${Date.now()}`,
        timestamp: Date.now(),
        formData: data,
        thread,
        topicImage,
        hookImage,
        bodyImages,
      };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // Keep last 50
      setHistory(updatedHistory);
      saveHistory(updatedHistory);

    } catch (err: any) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!generatedThread) return;
    setIsLoadingRefinement(true);
    setError(null);
    try {
      const refinedThread = await refineThread(generatedThread, formData, instruction);
      setGeneratedThread(refinedThread);
      // Optionally regenerate images if text changed significantly
    } catch (err: any) {
      setError(parseApiError(err));
    } finally {
      setIsLoadingRefinement(false);
    }
  };

  const handleRegenerateTopicImage = async (newStyle: PostImageStyle) => {
    setIsRegeneratingTopicImage(true);
    setError(null);
    try {
        const branding = getBrandingInfo(formData);
        const updatedFormData = { 
          ...formData, 
          imageStyle: newStyle, 
          topicImagePromptMode: 'style' as const 
        };
        setFormData(updatedFormData);
        const newImage = await generateTopicImage(updatedFormData, branding);
        setGeneratedImage(newImage);
        // Update history if needed
    } catch (err: any) {
        setError(parseApiError(err));
    } finally {
        setIsRegeneratingTopicImage(false);
    }
  };
  
  const handleRegenerateHookImage = async (hookKey: keyof HookVariations, newStyle: PostImageStyle) => {
      if (!generatedThread) return;
      setIsRegeneratingHookImage(true);
      setError(null);
      try {
          const hookText = generatedThread.hookVariations[hookKey];
          const branding = getBrandingInfo(formData);
          const niche = formData.niche === 'Other' ? formData.otherNiche || formData.niche : formData.niche;
          const newImage = await generateHookImage(hookText, newStyle, niche, branding);
          setGeneratedHookImage(newImage);
          const updatedFormData = { ...formData, postImageStyle: newStyle };
          setFormData(updatedFormData);
      } catch (err: any) {
          setError(parseApiError(err));
      } finally {
          setIsRegeneratingHookImage(false);
      }
  };
  
  const handleRegenerateBodyImage = async (index: number, newStyle: PostImageStyle) => {
      if (!generatedThread || !generatedThread.bodyPosts[index]) return;
      setIsRegeneratingBodyImage(index);
      setError(null);
      try {
          const postText = generatedThread.bodyPosts[index];
          const branding = getBrandingInfo(formData);
          const niche = formData.niche === 'Other' ? formData.otherNiche || formData.niche : formData.niche;
          const newImage = await generateBodyPostImage(postText, newStyle, niche, branding);
          setGeneratedBodyImages(prev => {
              const newImages = [...prev];
              newImages[index] = newImage;
              return newImages;
          });
          const updatedFormData = { ...formData, postImageStyle: newStyle };
          setFormData(updatedFormData);
      } catch (err: any) {
          setError(parseApiError(err));
      } finally {
          setIsRegeneratingBodyImage(null);
      }
  };

  const handleRegenerateHook = async (hookKey: keyof HookVariations) => {
      if (!generatedThread) return;
      setIsRegeneratingHook(true);
      setError(null);
      try {
          const newHookText = await regenerateHook(formData, hookKey, generatedThread.hookVariations);
          setGeneratedThread(prev => {
              if (!prev) return null;
              const newVariations = { ...prev.hookVariations, [hookKey]: newHookText };
              return { ...prev, hookVariations: newVariations };
          });
      } catch (err: any) {
          setError(parseApiError(err));
      } finally {
          setIsRegeneratingHook(false);
      }
  };

  const handleRegenerateThreadBody = async () => {
      if (!generatedThread) return;
      setIsRegeneratingThreadBody(true);
      setError(null);
      try {
          const newBodyPosts = await regenerateBody(formData, generatedThread);
          setGeneratedThread(prev => prev ? { ...prev, bodyPosts: newBodyPosts } : null);
          // Regenerate body images if enabled
          if(formData.generateBodyImages) {
              const niche = formData.niche === 'Other' ? formData.otherNiche || formData.niche : formData.niche;
              const branding = getBrandingInfo(formData);
              const bodyImagesPromises = Promise.all(newBodyPosts.map(post => generateBodyPostImage(post, formData.postImageStyle, niche, branding)));
              const newBodyImages = await bodyImagesPromises;
              setGeneratedBodyImages(newBodyImages as (string|null)[]);
          }
      } catch (err: any) {
          setError(parseApiError(err));
      } finally {
          setIsRegeneratingThreadBody(false);
      }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setFormData(item.formData);
    setGeneratedThread(item.thread);
    setGeneratedImage(item.topicImage || null);
    setGeneratedHookImage(item.hookImage || null);
    setGeneratedBodyImages(item.bodyImages || []);
    setShowHistory(false);
    setIsSidebarOpen(false);
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-200">
      <div className={`fixed inset-0 z-30 lg:hidden transition-opacity ${isSidebarOpen ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
      <div className={`fixed lg:relative z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
        <Sidebar onShowHistory={() => setShowHistory(true)}>
          <InputForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={formData}
          />
        </Sidebar>
      </div>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
        <div className="max-w-4xl mx-auto">
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8" role="alert">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 animate-pulse-glow mb-6">
                        <SparklesIcon className="w-16 h-16 text-primary p-3" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Generating your content...</h2>
                    <p className="mt-2 max-w-lg text-gray-500 dark:text-slate-400">
                        The AI is working its magic. Please wait a moment.
                    </p>
                </div>
            ) : generatedThread ? (
            <div className="animate-fade-in-up">
              <OutputDisplay
                  thread={generatedThread}
                  onRefine={handleRefine}
                  isLoadingRefinement={isLoadingRefinement}
                  generatedImage={generatedImage}
                  generatedHookImage={generatedHookImage}
                  generatedBodyImages={generatedBodyImages}
                  onRegenerateTopicImage={handleRegenerateTopicImage}
                  isRegeneratingTopicImage={isRegeneratingTopicImage}
                  onRegenerateHookImage={handleRegenerateHookImage}
                  isRegeneratingHookImage={isRegeneratingHookImage}
                  onRegenerateBodyImage={handleRegenerateBodyImage}
                  isRegeneratingBodyImage={isRegeneratingBodyImage}
                  onRegenerateHook={handleRegenerateHook}
                  isRegeneratingHook={isRegeneratingHook}
                  onRegenerateThreadBody={handleRegenerateThreadBody}
                  isRegeneratingThreadBody={isRegeneratingThreadBody}
              />
            </div>
            ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-6 bg-primary/10 rounded-full mb-6">
                    <SparklesIcon className="w-16 h-16 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome to ThreadSmith AI</h2>
                <p className="mt-2 max-w-lg text-gray-500 dark:text-slate-400">
                Fill out the form on the left to generate your next viral thread. Customize everything from the topic and tone to image styles and branding.
                </p>
            </div>
            )}
        </div>
      </main>

      <HistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

export default App;
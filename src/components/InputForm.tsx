import React, { useState, useCallback, useEffect } from 'react';
import type { FormData, Niche, Style, EmojiFrequency, NumberingStyle, PostImageStyle, Audience } from '../types';
import { NICHES, STYLES, AUDIENCES, EMOJI_FREQUENCIES, NUMBERING_STYLES, POST_IMAGE_STYLES } from '../constants';
import { getTrendingTopics } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  initialData: FormData;
}

// FIX: Define a type for the result of getTrendingTopics to include sources.
interface TrendingTopicsResult {
    topics: string[];
    sources: { uri: string; title: string }[];
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  // FIX: Updated state to hold both topics and sources from getTrendingTopics.
  const [trendingTopicsResult, setTrendingTopicsResult] = useState<TrendingTopicsResult | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, length: parseInt(e.target.value, 10) }));
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // FIX: Updated to handle the new return type of getTrendingTopics.
  const fetchTrendingTopics = useCallback(async () => {
    if (formData.niche === 'Other' && !formData.otherNiche) return;
    setIsLoadingTopics(true);
    setTrendingTopicsResult(null); // Clear previous results
    try {
        const niche = formData.niche === 'Other' ? formData.otherNiche! : formData.niche;
        const result = await getTrendingTopics(niche);
        setTrendingTopicsResult(result);
    } catch (error) {
        console.error("Failed to fetch trending topics", error);
        // Maybe show a toast notification here
    } finally {
        setIsLoadingTopics(false);
    }
  }, [formData.niche, formData.otherNiche]);

  // FIX: Reset trending topics result when niche changes.
  useEffect(() => {
      setTrendingTopicsResult(null);
  }, [formData.niche]);

  const renderSelect = (name: keyof FormData, label: string, options: readonly any[], valueKey?: string, labelKey?: string) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="font-semibold text-slate-800 dark:text-slate-200">{label}</label>
      <select id={name} name={name} value={formData[name] as string} onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors">
        {options.map((option) => (
          <option key={valueKey ? option[valueKey] : option} value={valueKey ? option[valueKey] : option}>
            {labelKey ? option[labelKey] : option}
          </option>
        ))}
      </select>
    </div>
  );
  
  const renderCheckbox = (name: keyof FormData, label: string, description?: string) => (
    <label htmlFor={name} className="flex items-start gap-3 p-3 bg-white dark:bg-dark-surface/50 border border-light-border dark:border-dark-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
        <input type="checkbox" id={name} name={name} checked={formData[name] as boolean} onChange={handleInputChange} className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
        <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{label}</span>
            {description && <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>}
        </div>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Topic */}
      <div className="flex flex-col gap-2">
        <label htmlFor="topic" className="font-semibold text-slate-800 dark:text-slate-200">Topic</label>
        <p className="text-sm text-gray-500 dark:text-slate-400">What's the main idea of your thread?</p>
        <textarea id="topic" name="topic" value={formData.topic} onChange={handleInputChange} rows={3} required className="w-full p-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" placeholder="e.g., 5 AI tools that will save you hours of work" />
        <div className="mt-2">
            <button type="button" onClick={fetchTrendingTopics} disabled={isLoadingTopics} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-primary/10 text-primary-dark dark:text-primary-light rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50">
                {isLoadingTopics ? (
                    <div className="w-4 h-4 border-2 border-primary/50 border-t-primary rounded-full animate-spin"></div>
                ) : (
                    <SparklesIcon className="w-4 h-4" />
                )}
                <span>Suggest Trending Topics</span>
            </button>
            {/* FIX: Updated to render topics and sources from the new state structure. */}
            {trendingTopicsResult && trendingTopicsResult.topics.length > 0 && (
                <div className="mt-3 space-y-2">
                    {trendingTopicsResult.topics.map((topic, i) => (
                        <button type="button" key={i} onClick={() => setFormData(prev => ({...prev, topic}))} className="w-full text-left p-2 bg-gray-100 dark:bg-dark-border/50 rounded-md hover:bg-gray-200 dark:hover:bg-dark-border transition-colors text-sm text-slate-700 dark:text-slate-300">
                            {topic}
                        </button>
                    ))}
                    {trendingTopicsResult.sources && trendingTopicsResult.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border">
                            <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-2">Sources from Google Search</h4>
                            <ul className="space-y-1">
                                {trendingTopicsResult.sources.map((source, i) => (
                                    <li key={i}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-primary dark:text-primary-light hover:underline truncate block" title={source.title}>
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Niche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSelect('niche', 'Niche', NICHES)}
        {formData.niche === 'Other' && (
          <div className="flex flex-col gap-2">
            <label htmlFor="otherNiche" className="font-semibold text-slate-800 dark:text-slate-200">Other Niche</label>
            <input type="text" id="otherNiche" name="otherNiche" value={formData.otherNiche} onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" placeholder="e.g., Woodworking" />
          </div>
        )}
      </div>

      {/* Style & Audience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSelect('style', 'Style', STYLES)}
        {renderSelect('audience', 'Audience', AUDIENCES)}
      </div>
      
      {/* Length */}
      <div className="flex flex-col gap-2">
        <label htmlFor="length" className="font-semibold text-slate-800 dark:text-slate-200">Thread Length (Body Posts)</label>
        <div className="flex items-center gap-4">
            <input type="range" id="length" name="length" min="2" max="15" value={formData.length} onChange={handleSliderChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            <span className="font-bold text-lg text-primary dark:text-primary-light w-8 text-center">{formData.length}</span>
        </div>
      </div>
      
      {/* Formatting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderSelect('emojiFrequency', 'Emoji Frequency', EMOJI_FREQUENCIES)}
          {renderSelect('numberingStyle', 'Numbering Style', NUMBERING_STYLES, 'value', 'label')}
      </div>

      {/* Tone & Voice */}
      <div className="flex flex-col gap-2">
        <label htmlFor="toneAndVoice" className="font-semibold text-slate-800 dark:text-slate-200">Tone & Voice (Optional)</label>
        <p className="text-sm text-gray-500 dark:text-slate-400">Provide an example of writing you'd like the AI to emulate.</p>
        <textarea id="toneAndVoice" name="toneAndVoice" value={formData.toneAndVoice} onChange={handleInputChange} rows={3} className="w-full p-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" placeholder="e.g., Write like a pirate who's excited about JavaScript." />
      </div>
      
      {/* Image Generation */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-light-border dark:border-dark-border pb-2">Image Generation</h3>
        <div className="space-y-4">
            {renderCheckbox('generateImage', 'Generate Topic Image', 'Create a main image for the thread based on your topic.')}
            
            {formData.generateImage && (
              <div className="pl-6 space-y-4 border-l-2 border-primary/20">
                  <div className="flex flex-col gap-2">
                      <label className="font-semibold text-slate-800 dark:text-slate-200">Generation Mode</label>
                      <div className="flex flex-wrap gap-2">
                          {(['style', 'custom'] as const).map((mode) => (
                              <button
                                  type="button"
                                  key={mode}
                                  onClick={() => setFormData(prev => ({...prev, topicImagePromptMode: mode}))}
                                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                      formData.topicImagePromptMode === mode
                                      ? 'bg-primary text-white shadow'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-border dark:text-slate-300 dark:hover:bg-dark-border/80'
                                  }`}
                              >
                                  {mode === 'style' ? 'Use Style' : 'Custom Prompt'}
                              </button>
                          ))}
                      </div>
                  </div>

                  {formData.topicImagePromptMode === 'style' ? (
                      renderSelect('imageStyle', 'Topic Image Style', POST_IMAGE_STYLES, 'value', 'label')
                  ) : (
                      <div className="flex flex-col gap-2">
                          <label htmlFor="customTopicImagePrompt" className="font-semibold text-slate-800 dark:text-slate-200">Custom Image Prompt</label>
                          <textarea 
                              id="customTopicImagePrompt" 
                              name="customTopicImagePrompt" 
                              value={formData.customTopicImagePrompt || ''} 
                              onChange={handleInputChange} 
                              rows={4} 
                              className="w-full p-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" 
                              placeholder="e.g., A minimalist photo of a vintage typewriter on a wooden desk..." 
                          />
                      </div>
                  )}
              </div>
            )}

            {renderCheckbox('generateHookImage', 'Generate Hook Image', 'Create a separate image for the first post (hook).')}
            {renderCheckbox('generateBodyImages', 'Generate Images for Body Posts', 'Create an image for each post in the thread body.')}

            {(formData.generateHookImage || formData.generateBodyImages) && renderSelect('postImageStyle', 'Post Image Style', POST_IMAGE_STYLES, 'value', 'label')}

            {renderCheckbox('addBranding', 'Add Branding', 'Add your username handle to the corner of generated images.')}
            {formData.addBranding && (
                <div className="flex flex-col gap-2 pl-6">
                    <label htmlFor="usernameHandle" className="font-semibold text-slate-800 dark:text-slate-200">Username / Handle</label>
                    <input type="text" id="usernameHandle" name="usernameHandle" value={formData.usernameHandle} onChange={handleInputChange} className="w-full p-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" placeholder="@yourhandle" />
                </div>
            )}
        </div>
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-lg transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-wait disabled:transform-none">
        {isLoading ? (
            <div className="w-6 h-6 border-4 border-white/50 border-t-white rounded-full animate-spin"></div>
        ) : (
            <SparklesIcon className="w-6 h-6" />
        )}
        <span>{isLoading ? 'Generating...' : 'Generate Thread'}</span>
      </button>
    </form>
  );
};

export default InputForm;
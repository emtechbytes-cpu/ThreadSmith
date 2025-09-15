import React, { useState, useCallback, useEffect } from 'react';
import type { GeneratedThread, HookVariations, CtaVariations, PostImageStyle } from '../types';
import { POST_IMAGE_STYLES } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { TweetIcon } from './icons/TweetIcon';
import { WandIcon } from './icons/WandIcon';

interface OutputDisplayProps {
  thread: GeneratedThread;
  onRefine: (instruction: string) => void;
  isLoadingRefinement: boolean;
  generatedImage?: string | null;
  generatedHookImage?: string | null;
  generatedBodyImages: (string | null)[];
  onRegenerateTopicImage: (newStyle: PostImageStyle) => void;
  onRegenerateHookImage: (hookKey: keyof HookVariations, newStyle: PostImageStyle) => void;
  onRegenerateBodyImage: (index: number, newStyle: PostImageStyle) => void;
  isRegeneratingTopicImage: boolean;
  isRegeneratingHookImage: boolean;
  isRegeneratingBodyImage: number | null;
  onRegenerateHook: (hookKey: keyof HookVariations) => void;
  isRegeneratingHook: boolean;
  onRegenerateThreadBody: () => void;
  isRegeneratingThreadBody: boolean;
}

const Post: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const charCount = text ? text.length : 0;
  const charColor = charCount > 280 ? 'text-red-500' : 'text-gray-400 dark:text-slate-400';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-xl border border-light-border dark:border-dark-border transition-all duration-300 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0"></div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">You</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">@username</p>
          </div>
        </div>
        <TweetIcon className="w-6 h-6 fill-gray-400 dark:fill-slate-500"/>
      </div>
      <p className="text-slate-800 dark:text-slate-200 text-base whitespace-pre-wrap my-4">{text}</p>
      <div className="flex items-center justify-end mt-2 text-sm">
        <span className={`${charColor} mr-4 font-mono text-xs`}>{charCount} / 280</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-dark-border hover:text-gray-800 dark:hover:text-white transition-colors"
          aria-label="Copy post"
        >
          {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

const VariationSelector: React.FC<{
  title: string;
  variations: HookVariations | CtaVariations;
  selected: string;
  setSelected: (key: string) => void;
  onRegenerate?: (key: string) => void;
  isRegenerating?: boolean;
}> = ({ title, variations, selected, setSelected, onRegenerate, isRegenerating }) => (
  <div className="p-4 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-primary dark:text-primary-light">{title}</h3>
      {onRegenerate && (
        <button
          onClick={() => onRegenerate(selected)}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-3 py-1 text-sm font-semibold bg-gray-100 dark:bg-dark-border/70 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-wait"
          aria-label="Regenerate"
        >
          {isRegenerating ? (
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-slate-400 border-t-gray-800 dark:border-t-white rounded-full animate-spin"></div>
          ) : (
            <RefreshIcon className="w-4 h-4" />
          )}
          <span>Regenerate</span>
        </button>
      )}
    </div>
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.keys(variations).map((key) => (
        <button
          key={key}
          onClick={() => setSelected(key)}
          className={`px-3 py-1 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${
            selected === key
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-border dark:text-slate-300 dark:hover:bg-dark-border/80'
          }`}
        >
          {key.charAt(0).toUpperCase() + key.slice(1)}
        </button>
      ))}
    </div>
    <Post text={variations[selected as keyof typeof variations]} />
  </div>
);

const RefinementControls: React.FC<{ 
    onRefine: (instruction: string) => void; 
    isLoading: boolean;
    selectedHookKey: string;
}> = ({ onRefine, isLoading, selectedHookKey }) => {
    const suggestions = ["Make it shorter", "Add more stats/examples", "Add more humor", "Make it more punchy"];
    return (
        <div className="mt-8 p-6 bg-gray-100/50 dark:bg-dark-surface/50 rounded-xl border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <WandIcon className="w-6 h-6 text-primary dark:text-primary-light"/>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Co-Pilot Mode</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 my-3">Need changes? Just ask.</p>
            <div className="flex flex-wrap gap-3">
                {suggestions.map(s => (
                    <button
                        key={s}
                        onClick={() => onRefine(s)}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-dark-border/70 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {s}
                    </button>
                ))}
                <button
                    onClick={() => onRefine(`Make the current '${selectedHookKey}' hook shorter and more punchy. Keep the rest of the thread the same.`)}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-semibold bg-secondary/20 text-secondary-dark dark:text-secondary-light rounded-lg hover:bg-secondary/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Make Hook Shorter
                </button>
            </div>
        </div>
    );
};


const safeFileName = (str: string, prefix: string) => {
  const cleanStr = str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `threadsmith_${prefix}_${cleanStr.split('_').slice(0, 4).join('_')}.jpg`;
};

const ImageCard: React.FC<{
  image: string;
  alt: string;
  downloadFileName: string;
  styles: readonly { label: string; value: any; description: string; }[];
  onRegenerate: (newStyle: any) => void;
  isRegenerating: boolean;
}> = ({ image, alt, downloadFileName, styles, onRegenerate, isRegenerating }) => {
  const [regeneratingStyle, setRegeneratingStyle] = useState<any | null>(null);

  useEffect(() => {
    if (!isRegenerating) {
      setRegeneratingStyle(null);
    }
  }, [isRegenerating]);

  const handleRegenerateClick = (style: any) => {
    setRegeneratingStyle(style);
    onRegenerate(style);
  };

  return (
    <div className="relative group overflow-hidden rounded-xl border border-light-border dark:border-dark-border">
      <img
        src={`data:image/jpeg;base64,${image}`}
        alt={alt}
        className="w-full h-auto"
      />
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 p-4">
          <a
            href={`data:image/jpeg;base64,${image}`}
            download={downloadFileName}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold bg-primary/90 hover:bg-primary/100 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            aria-label="Download Image"
          >
            <DownloadIcon className="w-5 h-5" />
            <span>Download</span>
          </a>
          <div className="w-full border-t border-white/20"></div>
          <div className="text-white text-sm text-center font-semibold">Regenerate as...</div>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {styles.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleRegenerateClick(value)}
                disabled={isRegenerating}
                className="flex items-center justify-center gap-1.5 text-white text-xs font-semibold bg-slate-600/80 hover:bg-slate-700/90 px-3 py-1.5 rounded-lg transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                aria-label={`Regenerate as ${label}`}
              >
                {isRegenerating && regeneratingStyle === value ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <RefreshIcon className="w-4 h-4" />
                )}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const OutputDisplay: React.FC<OutputDisplayProps> = ({
  thread,
  onRefine,
  isLoadingRefinement,
  generatedImage,
  generatedHookImage,
  generatedBodyImages,
  onRegenerateTopicImage,
  onRegenerateHookImage,
  onRegenerateBodyImage,
  isRegeneratingTopicImage,
  isRegeneratingHookImage,
  isRegeneratingBodyImage,
  onRegenerateHook,
  isRegeneratingHook,
  onRegenerateThreadBody,
  isRegeneratingThreadBody,
}) => {
  const [selectedHookKey, setSelectedHookKey] = useState<string>(Object.keys(thread.hookVariations)[0]);
  const [selectedCtaKey, setSelectedCtaKey] = useState<string>(Object.keys(thread.ctaVariations)[0]);
  
  const fullThreadText = [
    thread.hookVariations[selectedHookKey as keyof HookVariations],
    ...thread.bodyPosts,
    thread.ctaVariations[selectedCtaKey as keyof CtaVariations],
    thread.hashtags.join(' ')
  ].join('\n\n');

  const [copiedAll, setCopiedAll] = useState(false);
  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullThreadText).then(() => {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  return (
    <div className="space-y-8">
       {generatedImage && (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Generated Topic Image</h2>
          <ImageCard
            image={generatedImage}
            alt="Generated topic visual"
            downloadFileName={safeFileName(thread.hookVariations.curiosity, 'topic')}
            styles={POST_IMAGE_STYLES}
            onRegenerate={onRegenerateTopicImage}
            isRegenerating={isRegeneratingTopicImage}
          />
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Generated Thread</h2>
        <button onClick={handleCopyAll} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transform hover:scale-105">
            {copiedAll ? <CheckIcon className="w-5 h-5"/> : <CopyIcon className="w-5 h-5"/>}
            {copiedAll ? 'Copied!' : 'Copy Full Thread'}
        </button>
      </div>
      
      {generatedHookImage && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-primary dark:text-primary-light">Generated Hook Image</h3>
           <ImageCard
            image={generatedHookImage}
            alt="Generated hook visual"
            downloadFileName={safeFileName(thread.hookVariations.curiosity, 'hook')}
            styles={POST_IMAGE_STYLES}
            onRegenerate={(newStyle) => onRegenerateHookImage(selectedHookKey as keyof HookVariations, newStyle)}
            isRegenerating={isRegeneratingHookImage}
          />
        </div>
      )}

      <VariationSelector
        title="1. Choose Your Hook"
        variations={thread.hookVariations}
        selected={selectedHookKey}
        setSelected={setSelectedHookKey}
        onRegenerate={(key) => onRegenerateHook(key as keyof HookVariations)}
        isRegenerating={isRegeneratingHook}
      />

      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-primary dark:text-primary-light">2. Thread Body</h3>
            <button
              onClick={onRegenerateThreadBody}
              disabled={isRegeneratingThreadBody}
              className="flex items-center gap-2 px-3 py-1 text-sm font-semibold bg-gray-100 dark:bg-dark-border/70 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-wait"
              aria-label="Regenerate Thread Body"
            >
              {isRegeneratingThreadBody ? (
                <div className="w-4 h-4 border-2 border-gray-300 dark:border-slate-400 border-t-gray-800 dark:border-t-white rounded-full animate-spin"></div>
              ) : (
                <RefreshIcon className="w-4 h-4" />
              )}
              <span>Regenerate</span>
            </button>
        </div>
        <div className="space-y-6">
          {thread.bodyPosts.map((post, index) => (
            <div key={index} className="space-y-4">
              {generatedBodyImages[index] && (
                 <ImageCard
                    image={generatedBodyImages[index]!}
                    alt={`Generated image for post ${index + 1}`}
                    downloadFileName={safeFileName(post, `post_${index + 1}`)}
                    styles={POST_IMAGE_STYLES}
                    onRegenerate={(newStyle) => onRegenerateBodyImage(index, newStyle)}
                    isRegenerating={isRegeneratingBodyImage === index}
                  />
              )}
              <Post text={post} />
            </div>
          ))}
        </div>
      </div>
      
      <VariationSelector
        title="3. Choose Your Call to Action"
        variations={thread.ctaVariations}
        selected={selectedCtaKey}
        setSelected={setSelectedCtaKey}
      />

      <div>
        <h3 className="text-lg font-semibold text-primary dark:text-primary-light mb-4">4. Suggested Hashtags</h3>
        <div className="p-4 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border">
            <p className="text-primary-dark dark:text-primary-light font-mono tracking-wide">{thread.hashtags.join(' ')}</p>
        </div>
      </div>

      <RefinementControls 
        onRefine={onRefine} 
        isLoading={isLoadingRefinement} 
        selectedHookKey={selectedHookKey}
      />
    </div>
  );
};

export default OutputDisplay;
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/language';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}

interface ParsedItem {
  name: string;
  price: number;
  quantity: number;
}

interface VoiceAssistantProps {
  onItemsDetected: (items: ParsedItem[]) => void;
  currency: string;
}

export function VoiceAssistant({ onItemsDetected, currency }: VoiceAssistantProps) {
  const { t, language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Parse transcript to extract items and prices
  const parseTranscript = useCallback((text: string): ParsedItem[] => {
    const items: ParsedItem[] = [];
    const cleanText = text.toLowerCase();

    // Patterns for French and English
    const patterns = [
      // "un steak à 15 euros" / "a steak at 15 euros"
      /(?:un|une|a|one|deux|two|trois|three|\d+)?\s*([a-zàâäéèêëïîôùûüç\s-]+?)(?:\s+à|\s+at|\s+pour|\s+for)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro|euros|dollar|dollars|\$|£|pound|pounds)?/gi,
      // "15 euros le steak" / "15 euros for steak"
      /(\d+(?:[.,]\d{1,2})?)\s*(?:€|euro|euros|dollar|dollars|\$|£|pound|pounds)?\s*(?:le|la|les|the|for)?\s+([a-zàâäéèêëïîôùûüç\s-]+)/gi,
      // "steak 15" (simple pattern)
      /([a-zàâäéèêëïîôùûüç]{3,}(?:\s+[a-zàâäéèêëïîôùûüç]+)?)\s+(\d+(?:[.,]\d{1,2})?)/gi,
    ];

    // Number words to digits
    const numberWords: Record<string, number> = {
      un: 1, une: 1, a: 1, one: 1,
      deux: 2, two: 2,
      trois: 3, three: 3,
      quatre: 4, four: 4,
      cinq: 5, five: 5,
    };

    // Extract items using patterns
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(cleanText)) !== null) {
        let name: string;
        let price: number;

        // Pattern 1 & 3: name first, then price
        if (match[1] && isNaN(parseFloat(match[1].replace(',', '.')))) {
          name = match[1].trim();
          price = parseFloat((match[2] || '0').replace(',', '.'));
        }
        // Pattern 2: price first, then name
        else {
          price = parseFloat((match[1] || '0').replace(',', '.'));
          name = (match[2] || '').trim();
        }

        // Clean up name
        name = name
          .replace(/^\s*(un|une|a|one|deux|two|trois|three)\s+/i, '')
          .replace(/\s+/g, ' ')
          .trim();

        // Capitalize first letter
        name = name.charAt(0).toUpperCase() + name.slice(1);

        if (name.length >= 2 && price > 0) {
          // Check for quantity words
          let quantity = 1;
          for (const [word, num] of Object.entries(numberWords)) {
            if (cleanText.includes(`${word} ${name.toLowerCase()}`)) {
              quantity = num;
              break;
            }
          }

          // Avoid duplicates
          const existingIndex = items.findIndex(i =>
            i.name.toLowerCase() === name.toLowerCase()
          );
          if (existingIndex === -1) {
            items.push({ name, price, quantity });
          }
        }
      }
    }

    return items;
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setParsedItems([]);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);

      // Parse in real-time
      if (fullTranscript.length > 3) {
        const items = parseTranscript(fullTranscript);
        setParsedItems(items);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setShowModal(true);
  }, [language, parseTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const confirmItems = () => {
    if (parsedItems.length > 0) {
      onItemsDetected(parsedItems);
      setShowModal(false);
      setTranscript('');
      setParsedItems([]);
    }
  };

  const removeItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
    };
    return `${price.toFixed(2)} ${symbols[currency] || currency}`;
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Voice button */}
      <button
        onClick={startListening}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label={language === 'fr' ? 'Assistant vocal' : 'Voice assistant'}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </button>

      {/* Voice modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => {
              stopListening();
              setShowModal(false);
            }}
          />

          <div className="relative w-full sm:max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-white/10 animate-slide-up overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 ${isListening ? 'animate-pulse' : ''}`} />
              {isListening && (
                <>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-ping" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '150ms' }} />
                </>
              )}
            </div>

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center ${isListening ? 'animate-bounce' : ''}`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {language === 'fr' ? 'Assistant Vocal' : 'Voice Assistant'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {isListening
                        ? (language === 'fr' ? 'Je vous écoute...' : 'Listening...')
                        : (language === 'fr' ? 'Prêt' : 'Ready')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    stopListening();
                    setShowModal(false);
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {language === 'fr'
                    ? '💡 Dites vos articles avec leurs prix. Ex: "Un steak à 18 euros, deux cocas à 3 euros"'
                    : '💡 Say your items with prices. Ex: "A steak at 18 dollars, two cokes at 3 dollars"'}
                </p>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    {language === 'fr' ? 'Transcription' : 'Transcript'}
                  </p>
                  <p className="text-white">{transcript}</p>
                </div>
              )}

              {/* Parsed items */}
              {parsedItems.length > 0 && (
                <div className="bg-emerald-500/10 rounded-2xl p-4 mb-4 border border-emerald-500/30">
                  <p className="text-xs text-emerald-400 uppercase tracking-wide mb-3">
                    {language === 'fr' ? 'Articles détectés' : 'Detected items'}
                  </p>
                  <div className="space-y-2">
                    {parsedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{item.name}</span>
                          {item.quantity > 1 && (
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                              x{item.quantity}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold">{formatPrice(item.price)}</span>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Waveform visualization */}
              {isListening && (
                <div className="flex items-center justify-center gap-1 h-16 mb-4">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-violet-500 to-fuchsia-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 50}ms`,
                        animationDuration: `${300 + Math.random() * 200}ms`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex-1 py-4 rounded-2xl font-semibold text-white transition-all ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90'
                  }`}
                >
                  {isListening
                    ? (language === 'fr' ? '⏹ Arrêter' : '⏹ Stop')
                    : (language === 'fr' ? '🎤 Commencer' : '🎤 Start')}
                </button>
                {parsedItems.length > 0 && (
                  <button
                    onClick={confirmItems}
                    className="flex-1 py-4 rounded-2xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                  >
                    {language === 'fr' ? '✓ Ajouter' : '✓ Add'} ({parsedItems.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


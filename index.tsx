/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from '@google/genai';
import { marked } from 'marked';

// Constants
const ADDITIONAL_INSTRUCTIONS = `
Use a fun story about lots of robots as a metaphor.
Keep sentences short but conversational, casual, and engaging.
Generate a cute, minimal illustration for each sentence with black ink on white background.
No commentary, just begin your explanation.
Keep going until you're done.
Tüm anlatım Türkçe olacak, başka dil kullanılmayacak.
Açıklama tamamlanana kadar kesintisiz devam et.
Bu açıklama, mizah anlayışı olan meraklı gençlere ve yetişkinlere yönelik.`;

const MODEL_NAME = 'gemini-2.0-flash-preview-image-generation';

// Types
interface SlideContent {
  text: string;
  image: HTMLImageElement;
}

interface ErrorResponse {
  error: {
    message: string;
  };
}

// DOM Elements - with null checks
const userInput = document.querySelector('#input') as HTMLTextAreaElement | null;
const modelOutput = document.querySelector('#output') as HTMLDivElement | null;
const slideshow = document.querySelector('#slideshow') as HTMLDivElement | null;
const slidesContainer = document.querySelector('#slides-container') as HTMLDivElement | null;
const errorElement = document.querySelector('#error') as HTMLDivElement | null;
const sendButton = document.querySelector('#send-button') as HTMLButtonElement | null;
const loadingOverlay = document.querySelector('#loading-overlay') as HTMLDivElement | null;
const prevSlideButton = document.querySelector('#prev-slide') as HTMLButtonElement | null;
const nextSlideButton = document.querySelector('#next-slide') as HTMLButtonElement | null;
const slideCounter = document.querySelector('#slide-counter') as HTMLSpanElement | null;

// Validation
if (!userInput || !modelOutput || !slideshow || !slidesContainer || !errorElement || !sendButton || !loadingOverlay) {
  throw new Error('Required DOM elements not found');
}

// Initialize AI
const apiKey = process.env.GEMINI_API_KEY;
console.log('🔑 API Key status:', apiKey ? 'Present ✅' : 'Missing ❌');
console.log('🔑 API Key length:', apiKey?.length || 0);

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

console.log('🤖 Initializing Google AI...');
const ai = new GoogleGenAI({ apiKey });

console.log('💬 Creating chat instance...');
const chat = ai.chats.create({
  model: MODEL_NAME,
  config: {
    responseModalities: [Modality.TEXT, Modality.IMAGE],
  },
  history: [],
});

console.log('✅ AI initialization complete');

// State management
let currentSlideIndex = 0;
let totalSlides = 0;
let slides: HTMLDivElement[] = [];

/**
 * Hides loading overlay
 */
function hideLoading(): void {
  console.log('🔄 Attempting to hide loading overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
    loadingOverlay.setAttribute('hidden', 'true');
    console.log('✅ Loading overlay hidden');
  } else {
    console.error('❌ Loading overlay element not found');
  }
}

/**
 * Shows loading overlay
 */
function showLoading(): void {
  console.log('🔄 Showing loading overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
    loadingOverlay.removeAttribute('hidden');
    console.log('✅ Loading overlay shown');
  } else {
    console.error('❌ Loading overlay element not found');
  }
}

/**
 * Updates slide counter and navigation buttons
 */
function updateSlideControls(): void {
  if (!slideCounter || !prevSlideButton || !nextSlideButton) return;
  
  slideCounter.textContent = `${currentSlideIndex + 1} / ${totalSlides}`;
  prevSlideButton.disabled = currentSlideIndex === 0;
  nextSlideButton.disabled = currentSlideIndex === totalSlides - 1;
}

/**
 * Navigates to specific slide
 */
function goToSlide(index: number): void {
  if (index < 0 || index >= totalSlides) return;
  
  currentSlideIndex = index;
  const slideWidth = slides[0]?.offsetWidth || 400;
  const gap = 32; // 2rem gap
  const scrollPosition = (slideWidth + gap) * index;
  
  slidesContainer!.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  });
  
  updateSlideControls();
}

/**
 * Creates and adds a slide to the slideshow
 */
async function addSlide(slideContent: SlideContent): Promise<void> {
  const slide = document.createElement('div');
  slide.className = 'slide';
  
  const caption = document.createElement('div');
  caption.innerHTML = await marked.parse(slideContent.text);
  
  slide.append(slideContent.image);
  slide.append(caption);
  slidesContainer!.append(slide);
  
  slides.push(slide);
  totalSlides = slides.length;
  updateSlideControls();
}

/**
 * Parses error message from API response
 */
function parseError(error: unknown): string {
  if (typeof error !== 'string') {
    return 'Bilinmeyen bir hata oluştu';
  }

  const regex = /{"error":(.*)}/gm;
  const match = regex.exec(error);
  
  if (!match || !match[1]) {
    return error;
  }

  try {
    const errorData = JSON.parse(match[1]) as ErrorResponse['error'];
    return errorData.message || 'Bilinmeyen hata';
  } catch {
    return error;
  }
}

/**
 * Clears the UI state
 */
function clearUI(): void {
  modelOutput!.innerHTML = '';
  slidesContainer!.innerHTML = '';
  errorElement!.innerHTML = '';
  errorElement!.toggleAttribute('hidden', true);
  slideshow!.toggleAttribute('hidden', true);
  
  // Reset slide state
  slides = [];
  totalSlides = 0;
  currentSlideIndex = 0;
  updateSlideControls();
}

/**
 * Shows error message to user
 */
function showError(message: string): void {
  errorElement!.innerHTML = `❌ Bir sorun oluştu: ${message}`;
  errorElement!.removeAttribute('hidden');
}

/**
 * Creates user message element
 */
async function createUserMessage(message: string): Promise<HTMLDivElement> {
  const userTurn = document.createElement('div');
  userTurn.innerHTML = await marked.parse(`**Soru:** ${message}`);
  userTurn.className = 'user-turn';
  return userTurn;
}

/**
 * Cleans and filters API response text
 */
function cleanResponseText(text: string): string {
  // Remove system messages and unwanted prefixes
  const cleanText = text
    .replace(/^Image Generation: enabled\.\s*/i, '') // Remove "Image Generation: enabled."
    .replace(/^Image generation is enabled\.\s*/i, '') // Alternative format
    .replace(/^Image generation:\s*enabled\.\s*/i, '') // Another format
    .replace(/^System:\s*/i, '') // Remove "System:" prefix
    .replace(/^Assistant:\s*/i, '') // Remove "Assistant:" prefix
    .replace(/^AI:\s*/i, '') // Remove "AI:" prefix
    .replace(/^Bot:\s*/i, '') // Remove "Bot:" prefix
    .replace(/^Model:\s*/i, '') // Remove "Model:" prefix
    .replace(/^\*\*System\*\*:\s*/i, '') // Remove "**System**:" prefix
    .replace(/^\*\*Assistant\*\*:\s*/i, '') // Remove "**Assistant**:" prefix
    .replace(/^---\s*/gm, '') // Remove separator lines
    .replace(/^\s*[\r\n]+/, '') // Remove leading whitespace and newlines
    .replace(/\s+$/, '') // Remove trailing whitespace
    .trim();
  
  // If the entire text was just system messages, return empty
  if (cleanText.length === 0) {
    return '';
  }
  
  // Don't return text that's only punctuation or very short system remnants
  if (cleanText.length < 3 && /^[.,!?;:\s]*$/.test(cleanText)) {
    return '';
  }
  
  console.log('🧹 Cleaned text:', cleanText.substring(0, 100) + (cleanText.length > 100 ? '...' : ''));
  return cleanText;
}

/**
 * Processes a single chunk from the AI response
 */
function processChunk(chunk: any): { text: string; image: HTMLImageElement | null } {
  let text = '';
  let image: HTMLImageElement | null = null;

  const candidates = chunk.candidates;
  if (!candidates) {
    return { text, image };
  }

  for (const candidate of candidates) {
    const content = candidate.content;
    if (!content?.parts) {
      continue;
    }

    for (const part of content.parts) {
      if (part.text) {
        const cleanedText = cleanResponseText(part.text);
        if (cleanedText) { // Only add non-empty cleaned text
          text += cleanedText;
        }
      } else if (part.inlineData?.data) {
        image = document.createElement('img');
        image.src = `data:image/png;base64,${part.inlineData.data}`;
        image.alt = 'Robot hikayesi illüstrasyonu';
      }
    }
  }

  return { text, image };
}

/**
 * Disables/enables input controls
 */
function setInputsDisabled(disabled: boolean): void {
  userInput!.disabled = disabled;
  sendButton!.disabled = disabled;
  
  const examples = document.querySelectorAll('.example-card') as NodeListOf<HTMLButtonElement>;
  examples.forEach(button => {
    button.disabled = disabled;
  });
}

/**
 * Main function to generate AI response with images
 */
async function generate(message: string): Promise<void> {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return;
  }

  console.log('🚀 Generation started for:', trimmedMessage);
  setInputsDisabled(true);
  showLoading();
  clearUI();

  // Timeout mechanism
  const timeoutId = setTimeout(() => {
    console.error('⏰ Request timeout after 60 seconds');
    hideLoading();
    setInputsDisabled(false);
    showError('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
  }, 60000); // Increased to 60 seconds

  try {
    // Add user message to output
    const userMessage = await createUserMessage(trimmedMessage);
    modelOutput!.append(userMessage);
    userInput!.value = '';

    console.log('📤 Sending message to AI...');
    console.log('📝 Full prompt:', trimmedMessage + ADDITIONAL_INSTRUCTIONS);
    
    // Try streaming first
    try {
      const result = await chat.sendMessageStream({
        message: trimmedMessage + ADDITIONAL_INSTRUCTIONS,
      });

      console.log('📥 Stream started, processing chunks...');
      
      let accumulatedText = '';
      let currentImage: HTMLImageElement | null = null;
      let chunkCount = 0;
      let lastChunkTime = Date.now();

      for await (const chunk of result) {
        chunkCount++;
        lastChunkTime = Date.now();
        console.log(`📦 Processing chunk ${chunkCount}:`, chunk);
        
        // Check if chunk has the expected structure
        if (!chunk || !chunk.candidates) {
          console.warn('⚠️ Chunk missing candidates:', chunk);
          continue;
        }
        
        const { text, image } = processChunk(chunk);
        
        if (text) {
          accumulatedText += text;
          console.log('📝 Text accumulated:', text.substring(0, 50) + '...');
        }
        
        if (image) {
          currentImage = image;
          console.log('🖼️ Image received');
        }

        // If we have both text and image, create a slide
        if (accumulatedText && currentImage) {
          console.log('🎪 Creating slide with text and image');
          await addSlide({ text: accumulatedText, image: currentImage });
          slideshow!.removeAttribute('hidden');
          accumulatedText = '';
          currentImage = null;
        }
      }

      console.log(`✅ Stream completed. Total chunks: ${chunkCount}`);

      // Handle remaining content
      if (currentImage && accumulatedText) {
        console.log('🎪 Creating final slide');
        await addSlide({ text: accumulatedText, image: currentImage });
        slideshow!.removeAttribute('hidden');
      }

      // Check if we got any content
      if (chunkCount === 0) {
        console.warn('⚠️ No chunks received from stream, trying non-stream approach...');
        throw new Error('No chunks received');
      }

    } catch (streamError) {
      console.warn('⚠️ Streaming failed, trying regular sendMessage:', streamError);
      
      // Fallback to non-streaming
      const result = await chat.sendMessage({
        message: trimmedMessage + ADDITIONAL_INSTRUCTIONS,
      });

      console.log('📥 Non-stream response received:', result);
      
      if (result.candidates && result.candidates.length > 0) {
        const candidate = result.candidates[0];
        if (candidate.content && candidate.content.parts) {
          let accumulatedText = '';
          let currentImage: HTMLImageElement | null = null;
          
          for (const part of candidate.content.parts) {
            if (part.text) {
              const cleanedText = cleanResponseText(part.text);
              if (cleanedText) {
                accumulatedText += cleanedText;
                console.log('📝 Text from non-stream:', cleanedText.substring(0, 50) + '...');
              }
            } else if (part.inlineData?.data) {
              currentImage = document.createElement('img');
              currentImage.src = `data:image/png;base64,${part.inlineData.data}`;
              currentImage.alt = 'Robot hikayesi illüstrasyonu';
              console.log('🖼️ Image from non-stream');
            }
          }
          
          if (accumulatedText || currentImage) {
            await addSlide({ 
              text: accumulatedText || 'Robot hikayesi...', 
              image: currentImage || new Image()
            });
            slideshow!.removeAttribute('hidden');
          }
        }
      }
    }

    // Auto-scroll to first slide
    if (totalSlides > 0) {
      console.log(`🎯 Auto-scrolling to first slide. Total slides: ${totalSlides}`);
      setTimeout(() => goToSlide(0), 500);
    } else {
      console.warn('⚠️ No slides were created');
      showError('Hiçbir slayt oluşturulamadı. Lütfen farklı bir soru deneyin.');
    }

  } catch (error) {
    console.error('❌ Error during generation:', error);
    const errorMessage = parseError(error);
    showError(errorMessage);
  } finally {
    console.log('🏁 Generation finished');
    clearTimeout(timeoutId);
    hideLoading();
    setInputsDisabled(false);
    userInput!.focus();
  }
}

/**
 * Handle keyboard events for user input
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (event.code === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    const message = userInput!.value;
    generate(message);
  }
}

/**
 * Handle send button click
 */
function handleSendClick(): void {
  const message = userInput!.value;
  generate(message);
}

/**
 * Handle example click events
 */
function handleExampleClick(event: Event): void {
  const target = event.currentTarget as HTMLElement;
  const textElement = target.querySelector('.example-text');
  const text = textElement?.textContent;
  
  if (text) {
    userInput!.value = text;
    generate(text);
  }
}

/**
 * Handle slide navigation
 */
function handlePrevSlide(): void {
  goToSlide(currentSlideIndex - 1);
}

function handleNextSlide(): void {
  goToSlide(currentSlideIndex + 1);
}

/**
 * Handle keyboard navigation for slides
 */
function handleSlideKeyboard(event: KeyboardEvent): void {
  if (totalSlides === 0) return;
  
  switch (event.code) {
    case 'ArrowLeft':
      event.preventDefault();
      handlePrevSlide();
      break;
    case 'ArrowRight':
      event.preventDefault();
      handleNextSlide();
      break;
    case 'Home':
      event.preventDefault();
      goToSlide(0);
      break;
    case 'End':
      event.preventDefault();
      goToSlide(totalSlides - 1);
      break;
  }
}

/**
 * Initialize event listeners
 */
function initializeEventListeners(): void {
  // Input events
  userInput!.addEventListener('keydown', handleKeyDown);
  sendButton!.addEventListener('click', handleSendClick);

  // Example cards
  const examples = document.querySelectorAll('.example-card');
  examples.forEach((example) => {
    example.addEventListener('click', handleExampleClick);
  });

  // Slide navigation
  if (prevSlideButton && nextSlideButton) {
    prevSlideButton.addEventListener('click', handlePrevSlide);
    nextSlideButton.addEventListener('click', handleNextSlide);
  }

  // Keyboard navigation
  document.addEventListener('keydown', handleSlideKeyboard);

  // Force hide loading on initialization
  console.log('🔧 Force hiding loading overlay');
  hideLoading();
  
  // Also ensure inputs are enabled
  setInputsDisabled(false);
}

// Initialize the application
console.log('🚀 Initializing application...');
initializeEventListeners();

// Focus input on load
userInput!.focus();

// Emergency loading fix - force hide after a short delay
setTimeout(() => {
  console.log('🆘 Emergency loading hide');
  hideLoading();
  setInputsDisabled(false);
}, 1000);

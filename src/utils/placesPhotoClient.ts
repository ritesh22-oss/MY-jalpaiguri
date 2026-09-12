/**
 * MYJPG - Google Places Photo Client & Multi-Tier Fallback Engine
 * 
 * Strict Requirement:
 * EVERY place card ALWAYS has a visible image. NO place card should ever appear without an image.
 * 
 * Priority Hierarchy:
 * 1. Google Places official photo (via /api/places/photo)
 * 2. Existing database photo (place.photoUrl)
 * 3. Gemini Image Generation API (via /api/places/generate-image)
 * 4. Category-specific Bengal architectural SVG illustration fallback
 * 
 * Attribution Rules:
 * - Real Google photo -> 'Google Photo' badge
 * - Curated DB photo -> 'Verified Photo' badge
 * - Gemini AI photo -> 'AI Preview' / 'AI-generated' badge (NEVER labeled as real)
 * - Category vector -> 'Local Illustration' badge
 */

import { ExplorePlaceItem } from '../types';
import { getCategoryIllustrationUri } from './placeCategoryIllustrations';
import { apiClient } from './apiClient';

export type PlaceImageSourceType = 'google' | 'database' | 'wikipedia' | 'gemini' | 'category_illustration';

export interface ResolvedPlaceImage {
  imageUrl: string;
  sourceType: PlaceImageSourceType;
  badgeLabel: 'Google Photo' | 'Verified Photo' | 'Wikipedia Commons' | 'AI Preview' | 'Stock Photo';
  attribution?: string;
  isAiGenerated: boolean;
}

// Helper to fetch an image from Wikipedia Commons based on title
async function fetchWikipediaImage(title: string): Promise<{ url: string; attribution: string } | null> {
  try {
    // 1. Search for the closest Wikipedia page
    const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title + ' Jalpaiguri')}&utf8=&format=json&origin=*`);
    const searchData = await searchRes.json();
    if (!searchData.query?.search?.length) return null;
    
    const pageTitle = searchData.query.search[0].title;
    
    // 2. Get the main image of that page
    const imageRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(pageTitle)}&origin=*`);
    const imageData = await imageRes.json();
    const pages = imageData.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const sourceUrl = pages[pageId]?.original?.source;
      if (pageId !== "-1" && sourceUrl) {
        return {
          url: sourceUrl,
          attribution: `Wikipedia: ${pageTitle}`
        };
      }
    }
  } catch {
    // Silently fail to continue down the fallback chain
  }
  return null;
}

interface CachedPhotoData {
  photoUrl: string | null;
  attribution?: string;
  hasPhoto: boolean;
  timestamp: number;
}

const MEMORY_CACHE = new Map<string, CachedPhotoData>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LOCAL_STORAGE_PREFIX = 'jpg_place_photo_';
const AI_IMAGE_STORAGE_PREFIX = 'jpg_place_ai_img_';

function getStorageCache(key: string): CachedPhotoData | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed: CachedPhotoData = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${key}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setStorageCache(key: string, data: CachedPhotoData) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota limits
  }
}

export async function fetchPlacePhoto(
  placeId: string,
  photoResourceName?: string,
  maxWidth = 600,
  maxHeight = 400
): Promise<{ photoUrl: string | null; attribution?: string; hasPhoto: boolean }> {
  const cacheKey = `${placeId}_${maxWidth}`;

  // 1. Check in-memory cache
  const inMem = MEMORY_CACHE.get(cacheKey);
  if (inMem && Date.now() - inMem.timestamp < CACHE_TTL_MS) {
    return inMem;
  }

  // 2. Check localStorage cache
  const inStore = getStorageCache(cacheKey);
  if (inStore) {
    MEMORY_CACHE.set(cacheKey, inStore);
    return inStore;
  }

  // 3. Dynamic fetch via centralized apiClient to prevent CORS and safeguard API credentials
  try {
    const data = await apiClient.getPlacePhoto({
      placeId,
      name: photoResourceName,
      width: maxWidth,
      height: maxHeight
    });

    const result: CachedPhotoData = {
      photoUrl: data.photoUrl || null,
      attribution: data.attribution,
      hasPhoto: Boolean(data.photoUrl),
      timestamp: Date.now()
    };

    MEMORY_CACHE.set(cacheKey, result);
    setStorageCache(cacheKey, result);
    return result;
  } catch {
    // Silently handle error and return missing-photo state
    const fallbackData: CachedPhotoData = {
      photoUrl: null,
      hasPhoto: false,
      timestamp: Date.now()
    };
    MEMORY_CACHE.set(cacheKey, fallbackData);
    return fallbackData;
  }
}

/**
 * Resolves the absolute best available image for any Explore Place
 * Guarantees that a high-resolution, thematic image is ALWAYS returned.
 */
export async function resolvePlaceImage(
  place: ExplorePlaceItem,
  maxWidth = 600,
  maxHeight = 400
): Promise<ResolvedPlaceImage> {
  // Step 0: Check admin-approved custom thumbnail override
  try {
    const customThumbs = JSON.parse(localStorage.getItem('jpg_custom_thumbnails') || '{}');
    if (customThumbs[place.placeId] || customThumbs[place.id]) {
      const customUrl = customThumbs[place.placeId] || customThumbs[place.id];
      return {
        imageUrl: customUrl,
        sourceType: 'database',
        badgeLabel: 'Verified Photo',
        isAiGenerated: false
      };
    }
  } catch {}

  // Step 1: Attempt official Google Places photo
  try {
    const googleRes = await fetchPlacePhoto(place.placeId, place.photoResourceName, maxWidth, maxHeight);
    if (googleRes.hasPhoto && googleRes.photoUrl) {
      return {
        imageUrl: googleRes.photoUrl,
        sourceType: 'google',
        badgeLabel: 'Google Photo',
        attribution: googleRes.attribution || '© Google Maps Contributor',
        isAiGenerated: false
      };
    }
  } catch {
    // Proceed to next tier
  }

  // Step 2: Check database curated photo
  if (place.photoUrl) {
    return {
      imageUrl: place.photoUrl,
      sourceType: 'database',
      badgeLabel: 'Verified Photo',
      attribution: place.photoAttribution || 'Verified Landmark Archive',
      isAiGenerated: false
    };
  }

  // Step 3: Fetch Wikipedia image fallback (Real-world public domain photo)
  try {
    const wikiImage = await fetchWikipediaImage(place.name);
    if (wikiImage) {
      return {
        imageUrl: wikiImage.url,
        sourceType: 'wikipedia',
        badgeLabel: 'Wikipedia Commons',
        attribution: wikiImage.attribution,
        isAiGenerated: false
      };
    }
  } catch {
    // Proceed to stock fallback
  }

  // Step 4: Photorealistic Real-World Stock Image Fallback
  return {
    imageUrl: getCategoryIllustrationUri(place.category),
    sourceType: 'category_illustration',
    badgeLabel: 'Stock Photo',
    attribution: 'Unsplash Photorealistic Collection',
    isAiGenerated: false
  };
}

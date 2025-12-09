// NSFW Image Detection using Sightengine API
// Sign up at: https://sightengine.com/
// Free tier: 500 images/month

interface SightengineResponse {
  status: string;
  request: {
    id: string;
    timestamp: number;
    operations: number;
  };
  nudity?: {
    sexual_activity: number;
    sexual_display: number;
    erotica: number;
    sextoy: number;
    none: number;
  };
  weapon?: number;
  alcohol?: number;
  drugs?: number;
  offensive?: {
    prob: number;
  };
}

export interface NSFWResult {
  isNSFW: boolean;
  confidence: number;
  categories: string[];
  shouldReject: boolean;
}

// Track if we've already logged the warning to avoid log spam
let nsfwWarningLogged = false;

/**
 * Check image for NSFW content using Sightengine
 */
export async function detectNSFW(imageUrl: string): Promise<NSFWResult> {
  const API_USER = process.env.SIGHTENGINE_API_USER;
  const API_SECRET = process.env.SIGHTENGINE_API_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  // If API keys not configured, log a warning (especially important in production)
  if (!API_USER || !API_SECRET) {
    if (!nsfwWarningLogged) {
      if (isProduction) {
        console.error('🚨 SECURITY WARNING: NSFW detection is DISABLED in production!');
        console.error('   Set SIGHTENGINE_API_USER and SIGHTENGINE_API_SECRET environment variables.');
        console.error('   Without NSFW detection, inappropriate images may be uploaded.');
      } else {
        console.warn('⚠️ NSFW detection disabled - Sightengine API not configured');
        console.warn('   This is acceptable for development but MUST be configured for production.');
      }
      nsfwWarningLogged = true;
    }
    
    return {
      isNSFW: false,
      confidence: 0,
      categories: [],
      shouldReject: false,
    };
  }

  try {
    const params = new URLSearchParams({
      url: imageUrl,
      models: 'nudity-2.0,wad,offensive',
      api_user: API_USER,
      api_secret: API_SECRET,
    });

    const response = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Sightengine API error:', response.status);
      return {
        isNSFW: false,
        confidence: 0,
        categories: [],
        shouldReject: false,
      };
    }

    const data: SightengineResponse = await response.json();

    const categories: string[] = [];
    let maxConfidence = 0;

    // Check nudity
    if (data.nudity) {
      if (data.nudity.sexual_activity > 0.5) {
        categories.push('sexual_activity');
        maxConfidence = Math.max(maxConfidence, data.nudity.sexual_activity);
      }
      if (data.nudity.sexual_display > 0.5) {
        categories.push('sexual_display');
        maxConfidence = Math.max(maxConfidence, data.nudity.sexual_display);
      }
      if (data.nudity.erotica > 0.5) {
        categories.push('erotica');
        maxConfidence = Math.max(maxConfidence, data.nudity.erotica);
      }
    }

    // Check weapons
    if (data.weapon && data.weapon > 0.5) {
      categories.push('weapon');
      maxConfidence = Math.max(maxConfidence, data.weapon);
    }

    // Check drugs
    if (data.drugs && data.drugs > 0.5) {
      categories.push('drugs');
      maxConfidence = Math.max(maxConfidence, data.drugs);
    }

    // Check offensive content
    if (data.offensive && data.offensive.prob > 0.5) {
      categories.push('offensive');
      maxConfidence = Math.max(maxConfidence, data.offensive.prob);
    }

    const isNSFW = categories.length > 0;
    const shouldReject = maxConfidence > 0.7; // Reject if >70% confidence

    return {
      isNSFW,
      confidence: maxConfidence,
      categories,
      shouldReject,
    };
  } catch (error) {
    console.error('NSFW detection error:', error);
    // On error, fail safe (allow image)
    return {
      isNSFW: false,
      confidence: 0,
      categories: [],
      shouldReject: false,
    };
  }
}

/**
 * Fallback: Basic client-side NSFW check using TensorFlow.js
 * This is less accurate but works without external API
 */
export async function detectNSFWLocal(imageFile: File): Promise<NSFWResult> {
  // TODO: Implement NSFWJS (TensorFlow.js model)
  // npm install nsfwjs @tensorflow/tfjs
  // This would run in a serverless function or edge function
  
  console.log('⚠️ Local NSFW detection not implemented yet');
  
  return {
    isNSFW: false,
    confidence: 0,
    categories: [],
    shouldReject: false,
  };
}

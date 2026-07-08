export interface BrandKit {
  name: string;
  websiteUrl: string;
  logoUrl: string | null;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    text: string;
  };
  fonts: {
    headline: string;
    body: string;
  };
  tone: string;
  offers: string[];
  testimonials: {
    quote: string;
    author: string;
    role?: string;
    rating?: number;
  }[];
  images: string[];
}

export type PlatformType = 'instagram-post' | 'instagram-story' | 'instagram-square' | 'facebook-feed' | 'linkedin-post';

export interface PlatformConfig {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  iconName: string;
}

export const PLATFORMS: Record<PlatformType, PlatformConfig> = {
  'instagram-post': { name: 'Instagram Post', width: 1080, height: 1350, aspectRatio: '4:5', iconName: 'Instagram' },
  'instagram-story': { name: 'Instagram Story', width: 1080, height: 1920, aspectRatio: '9:16', iconName: 'Tv' },
  'instagram-square': { name: 'Instagram Square', width: 1080, height: 1080, aspectRatio: '1:1', iconName: 'Instagram' },
  'facebook-feed': { name: 'Facebook Feed', width: 1200, height: 628, aspectRatio: '1.91:1', iconName: 'Facebook' },
  'linkedin-post': { name: 'LinkedIn Post', width: 1200, height: 627, aspectRatio: '1.91:1', iconName: 'Linkedin' },
};

export type ElementType = 'text' | 'image' | 'shape' | 'button' | 'logo';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;          // percentage (0-100) relative to canvas width
  y: number;          // percentage (0-100) relative to canvas height
  width: number;      // percentage (0-100)
  height: number;     // percentage (0-100)
  content: string;    // text content, image URL, shape type
  fontSize?: number;  // px (will scale)
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right';
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  fontFamily?: string;
  zIndex: number;
}

export interface AdProject {
  id: string;
  name: string;
  brand: BrandKit;
  activePlatform: PlatformType;
  selectedTemplateIndex: number; // 0: Offer, 1: Benefit, 2: Testimonial
  ads: {
    'instagram-post': CanvasElement[];
    'instagram-story': CanvasElement[];
    'instagram-square': CanvasElement[];
    'facebook-feed': CanvasElement[];
    'linkedin-post': CanvasElement[];
  };
  createdAt: string;
  updatedAt: string;
}

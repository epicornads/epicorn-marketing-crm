import { BrandKit, AdProject } from '../types';

export const MOCK_BRANDS: Record<string, BrandKit> = {
  'glow-skincare': {
    name: 'Glow Organics',
    websiteUrl: 'https://gloworganics.co',
    logoUrl: '✨ Glow',
    colors: {
      primary: '#4b6700',
      secondary: '#5b5e66',
      tertiary: '#586152',
      background: '#f8f9ff',
      text: '#0b1c30'
    },
    fonts: {
      headline: 'Manrope',
      body: 'Hanken Grotesk'
    },
    tone: 'Premium, clean, and nature-inspired',
    offers: [
      'Get 20% OFF on all skincare products',
      'Free shipping on orders over $50',
      'Buy 2 serums, get a toner free'
    ],
    testimonials: [
      { quote: 'This changed my skin forever. The dark spots are completely gone!', author: 'Sarah M.', role: 'Verified Buyer', rating: 5 },
      { quote: 'Extremely clean ingredients. No breakout, just pure natural glow.', author: 'Emily R.', role: 'Skincare Enthusiast', rating: 5 }
    ],
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop', // skincare bottle
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop', // organic leaves
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop'  // face serum application
    ]
  },
  'apex-saas': {
    name: 'Apex Analytics',
    websiteUrl: 'https://apexanalytics.io',
    logoUrl: '▲ Apex',
    colors: {
      primary: '#0F172A',
      secondary: '#06B6D4',
      tertiary: '#475569',
      background: '#F8FAFC',
      text: '#0F172A'
    },
    fonts: {
      headline: 'Manrope',
      body: 'Hanken Grotesk'
    },
    tone: 'Professional, analytical, and highly tech-forward',
    offers: [
      'Start your 14-day free trial today',
      'Save 30% on annual developer plans',
      'Get a free live demo with our strategist'
    ],
    testimonials: [
      { quote: 'We scaled our deployment by 3x and cut monitoring costs in half.', author: 'David K.', role: 'CTO, TechFlow', rating: 5 },
      { quote: 'The cleanest dashboard metrics we have ever integrated.', author: 'Jessica L.', role: 'VP of Product', rating: 5 }
    ],
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop', // analytics chart
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop', // dashboard UI representation
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop'  // high tech code matrix
    ]
  },
  'urban-cup': {
    name: 'Urban Cup Coffee',
    websiteUrl: 'https://urbancup.coffee',
    logoUrl: '☕ Urban Cup',
    colors: {
      primary: '#4E3629',
      secondary: '#D2B48C',
      tertiary: '#8B5A2B',
      background: '#FAF5EF',
      text: '#2C1D11'
    },
    fonts: {
      headline: 'Manrope',
      body: 'Hanken Grotesk'
    },
    tone: 'Warm, cozy, and community-centric',
    offers: [
      'Buy one cold brew, get one half off',
      'Get a free croissant with any large drink before 9 AM',
      'Join our rewards app for a free birthday muffin'
    ],
    testimonials: [
      { quote: 'The cold brew is smooth and chocolatey, and the space is beautiful.', author: 'Marcus T.', role: 'Remote Worker', rating: 5 },
      { quote: 'My favorite daily ritual. The baristas know my order by heart!', author: 'Sophia V.', role: 'Neighborhood Local', rating: 5 }
    ],
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop', // latte art
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop', // coffee shop interior
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600&auto=format&fit=crop'  // beans roasting
    ]
  }
};

export const MOCK_PROJECTS: AdProject[] = [
  {
    id: 'proj-1',
    name: 'Glow Serum Summer Launch',
    brand: MOCK_BRANDS['glow-skincare'],
    activePlatform: 'instagram-post',
    selectedTemplateIndex: 0,
    ads: {
      'instagram-post': [],
      'instagram-story': [],
      'instagram-square': [],
      'facebook-feed': [],
      'linkedin-post': []
    },
    createdAt: '2026-06-25T14:32:00Z',
    updatedAt: '2026-07-01T10:15:00Z'
  },
  {
    id: 'proj-2',
    name: 'Apex Annual Promo Campaign',
    brand: MOCK_BRANDS['apex-saas'],
    activePlatform: 'instagram-square',
    selectedTemplateIndex: 1,
    ads: {
      'instagram-post': [],
      'instagram-story': [],
      'instagram-square': [],
      'facebook-feed': [],
      'linkedin-post': []
    },
    createdAt: '2026-06-28T09:00:00Z',
    updatedAt: '2026-06-28T09:45:00Z'
  }
];

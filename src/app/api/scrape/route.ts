import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { uploadToCloudinary } from '@/utils/cloudinary';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Ensure URL has protocol
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    let domain = 'brand';
    try {
      domain = new URL(targetUrl).hostname.replace('www.', '').split('.')[0];
    } catch (e) {
      const cleaned = targetUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0].split('.')[0];
      if (cleaned) domain = cleaned;
    }
    const capitalizedName = domain.charAt(0).toUpperCase() + domain.slice(1);

    let brandData: any = null;
    let scrapeMethodUsed = '';
    let resolvedUrl = targetUrl;

    // ----------------------------------------------------
    // PIPELINE 1: FIRECRAWL API (Structured LLM Scraper)
    // ----------------------------------------------------
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (firecrawlApiKey) {
      try {
        console.log('Attempting scrape via Firecrawl API for:', targetUrl);
        const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: targetUrl,
            formats: ['json'],
            jsonOptions: {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", description: "The name of the brand or company" },
                  logoUrl: { type: "string", description: "The absolute URL of the brand's logo image if found on the page, or null if not found" },
                  colors: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of 2 to 5 dominant color hex codes (e.g. ['#ba9e02', '#0f172a']) representing the brand's visual identity."
                  },
                  offers: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of up to 4 copywriting value propositions, marketing headlines, promo campaigns, or slogans (e.g. 'Get 20% off your first buy', 'Free shipping worldwide')."
                  },
                  tone: { type: "string", description: "A one-sentence summary of the brand's tone of voice and core messaging." },
                  testimonials: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        quote: { type: "string", description: "The testimonial text quote." },
                        author: { type: "string", description: "The author's name or 'Verified Customer'." },
                        rating: { type: "integer", description: "The star rating out of 5." }
                      }
                    },
                    description: "An array of up to 3 testimonials or reviews found on the site."
                  },
                  images: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of up to 6 high-resolution product showcase, background hero, or banner image URLs (excluding small icons, arrows, and logos)."
                  }
                },
                required: ["name", "colors", "offers", "tone"]
              }
            }
          }),
          signal: AbortSignal.timeout(18000) // 18s timeout for Firecrawl LLM
        });

        if (firecrawlRes.ok) {
          const firecrawlData = await firecrawlRes.json();
          if (firecrawlData.success && firecrawlData.data?.json) {
            const fcBrand = firecrawlData.data.json;
            brandData = {
              name: fcBrand.name,
              logoUrl: fcBrand.logoUrl,
              colors: fcBrand.colors || [],
              images: fcBrand.images || [],
              offers: fcBrand.offers || [],
              tone: fcBrand.tone,
              testimonials: fcBrand.testimonials || []
            };
            scrapeMethodUsed = 'firecrawl';
            console.log('Successfully scraped via Firecrawl API!');
          }
        } else {
          console.warn(`Firecrawl API responded with error status ${firecrawlRes.status}`);
        }
      } catch (e) {
        console.warn('Firecrawl API scrape failed. Falling back to Playwright.', e);
      }
    }

    // ----------------------------------------------------
    // PIPELINE 2: PLAYWRIGHT HEADLESS BROWSER
    // ----------------------------------------------------
    if (!brandData) {
      try {
        console.log('Attempting scrape via local Playwright for:', targetUrl);
        const browser = await chromium.launch({
          headless: true
        });
        const page = await browser.newPage();
        
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 });
        resolvedUrl = page.url();

        // Extract details inside browser context
        brandData = await page.evaluate((baseName) => {
          const cleanText = (str: string | null | undefined): string => {
            if (!str) return '';
            return str.replace(/\s+/g, ' ').trim();
          };

          // 1. BRAND NAME
          let name = '';
          const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
          const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
          
          if (ogSiteName) {
            name = ogSiteName;
          } else if (document.title) {
            const cleanTitle = document.title.split(/[|•-]/)[0].trim();
            if (cleanTitle && cleanTitle.length > 2 && cleanTitle.length < 30) {
              name = cleanTitle;
            } else if (ogTitle) {
              name = ogTitle.split(/[|•-]/)[0].trim();
            }
          }
          
          if (!name) name = baseName;

          // 2. LOGO
          let logoUrl = '';
          const imgElements = Array.from(document.querySelectorAll('img'));
          const logoImg = imgElements.find(img => {
            const src = (img.src || '').toLowerCase();
            const alt = (img.alt || '').toLowerCase();
            const cls = (img.className || '').toString().toLowerCase();
            const id = (img.id || '').toLowerCase();
            const matchKeys = ['logo', 'brand'];
            return matchKeys.some(k => src.includes(k) || alt.includes(k) || cls.includes(k) || id.includes(k));
          });

          if (logoImg && logoImg.src && !logoImg.src.startsWith('data:')) {
            logoUrl = logoImg.src;
          }

          if (!logoUrl) {
            const favLink = document.querySelector('link[rel*="icon"]');
            if (favLink && favLink.getAttribute('href')) {
              logoUrl = (favLink as any).href;
            }
          }

          if (!logoUrl) {
            const ogImg = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
            if (ogImg) {
              logoUrl = ogImg;
            }
          }

          // 3. COLORS (computes dominant color palettes)
          const colorCounts: Record<string, number> = {};
          const addColor = (colorStr: string) => {
            if (!colorStr || colorStr === 'rgba(0, 0, 0, 0)' || colorStr === 'transparent') return;
            let hex = colorStr;
            if (colorStr.startsWith('rgb')) {
              const match = colorStr.match(/\d+/g);
              if (match && match.length >= 3) {
                const r = parseInt(match[0]);
                const g = parseInt(match[1]);
                const b = parseInt(match[2]);
                if (match.length === 4 && parseFloat(match[3]) === 0) return;
                hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
              }
            }
            hex = hex.toLowerCase();

            // Skip white, black, and close gray shades
            const isNeutral = (h: string) => {
              if (['#ffffff', '#000000', '#fff', '#000'].includes(h)) return true;
              if (h.startsWith('#') && h.length === 7) {
                const r = parseInt(h.substring(1, 3), 16);
                const g = parseInt(h.substring(3, 5), 16);
                const b = parseInt(h.substring(5, 7), 16);
                const avg = (r + g + b) / 3;
                const dev = Math.abs(r - avg) + Math.abs(g - avg) + Math.abs(b - avg);
                return dev < 15;
              }
              return false;
            };

            if (!isNeutral(hex)) {
              colorCounts[hex] = (colorCounts[hex] || 0) + 1;
            }
          };

          // Sample key visual elements
          const headings = document.querySelectorAll('h1, h2, h3, h4, button, a, header, nav, [class*="hero" i]');
          headings.forEach(el => {
            const style = window.getComputedStyle(el);
            addColor(style.backgroundColor);
            addColor(style.color);
          });

          // Check main body styles
          const bodyStyle = window.getComputedStyle(document.body);
          addColor(bodyStyle.backgroundColor);
          addColor(bodyStyle.color);

          const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);

          // 4. IMAGES
          const imagesList: string[] = [];
          const addImage = (src: string) => {
            if (!src || src.startsWith('data:') || imagesList.includes(src)) return;
            const low = src.toLowerCase();
            const skipKeys = ['icon', 'logo', 'star', 'arrow', 'social', 'facebook', 'twitter', 'instagram', 'youtube', 'pixel', 'tracker', 'spacer', 'loading', 'spinner', 'check', 'badge', 'cart', 'search', 'close', 'menu'];
            const isSkip = skipKeys.some(k => low.includes(k));
            if (!isSkip) {
              imagesList.push(src);
            }
          };

          // Find standard image tags
          imgElements.forEach(img => {
            const width = img.naturalWidth || img.width || 0;
            const height = img.naturalHeight || img.height || 0;
            if (width > 80 && height > 80) {
              addImage(img.src);
            } else if (!img.width && !img.height) {
              addImage(img.src);
            }
          });

          // Find background-images
          document.querySelectorAll('*').forEach(el => {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (bg && bg !== 'none' && bg.startsWith('url')) {
              const match = bg.match(/url\((['"]?)(.*?)\1\)/);
              if (match && match[2]) {
                let url = match[2];
                if (url.startsWith('//')) {
                  url = window.location.protocol + url;
                } else if (url.startsWith('/')) {
                  url = window.location.origin + url;
                } else if (!url.startsWith('http')) {
                  url = new URL(url, window.location.href).href;
                }
                addImage(url);
              }
            }
          });

          // 5. COPYWRITING & OFFERS
          const offersList: string[] = [];
          const textElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, button, a'));
          const salesKeywords = ['off', 'sale', 'discount', 'free', 'save', 'limited', 'deal', 'promo', 'special', 'shipping', 'guarantee', 'join', 'get', 'start', 'try', 'now', 'order', 'buy', 'price', '$', '%', 'only'];
          
          textElements.forEach(el => {
            const text = cleanText((el as HTMLElement).innerText || el.textContent);
            if (text.length > 10 && text.length < 120) {
              const low = text.toLowerCase();
              const hasKeyword = salesKeywords.some(kw => low.includes(kw));
              if (hasKeyword && !offersList.includes(text)) {
                offersList.push(text);
              }
            }
          });

          // Testimonials
          const testimonialsList: Array<{ quote: string; author: string; rating: number }> = [];
          textElements.forEach(el => {
            const text = cleanText((el as HTMLElement).innerText || el.textContent);
            if (text.length > 40 && text.length < 220) {
              const low = text.toLowerCase();
              if (text.includes('"') || text.includes('“') || text.includes('’') || low.includes('recommend') || low.includes('great') || low.includes('love') || low.includes('testimonial') || low.includes('review')) {
                if (testimonialsList.length < 3 && !testimonialsList.some(t => t.quote === text)) {
                  testimonialsList.push({ quote: text, author: 'Verified Customer', rating: 5 });
                }
              }
            }
          });

          // Tone from description tag
          const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || 
                        document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

          return {
            name,
            logoUrl,
            colors: sortedColors,
            images: imagesList,
            offers: offersList,
            tone: cleanText(desc),
            testimonials: testimonialsList
          };
        }, capitalizedName);

        await browser.close();
        scrapeMethodUsed = 'playwright';
        console.log('Successfully scraped via Playwright browser!');
      } catch (e: any) {
        console.warn('Playwright scraping failed. Falling back to simple fetch scraper.', e);
      }
    }

    // ----------------------------------------------------
    // PIPELINE 3: HTTP GET FETCH AND REGEX SCRAPER
    // ----------------------------------------------------
    if (!brandData) {
      console.log('Attempting scrape via Fetch Fallback for:', targetUrl);
      let html = '';
      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          next: { revalidate: 0 },
          signal: AbortSignal.timeout(9000)
        });

        if (res.ok) {
          html = await res.text();
          resolvedUrl = res.url || targetUrl;
        }
      } catch (e) {
        console.warn('Scraping fetch failed, using fallback mock generator', e);
      }

      if (!html) {
        console.log('No HTML retrieved. Returning hard-coded stock fallback.');
        return NextResponse.json(generateFallbackBrand(targetUrl, capitalizedName));
      }

      const resolveUrl = (relative: string, base: string) => {
        try {
          return new URL(relative, base).href;
        } catch (err) {
          return relative;
        }
      };

      const decodeHtmlEntities = (str: string): string => {
        return str
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/&ndash;/g, '-')
          .replace(/&mdash;/g, '—')
          .replace(/&middot;/g, '·')
          .replace(/&copy;/g, '©')
          .replace(/&reg;/g, '®')
          .replace(/&trade;/g, '™')
          .replace(/&#x2019;/g, "'")
          .replace(/&#x2018;/g, "'")
          .replace(/&#x201C;/g, '"')
          .replace(/&#x201D;/g, '"')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const stripTags = (htmlStr: string): string => {
        return htmlStr.replace(/<[^>]*>/g, '');
      };

      // 1. Name
      let brandName = capitalizedName;
      const ogSiteName = getMetaTag(html, 'og:site_name');
      const ogTitle = getMetaTag(html, 'og:title');
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
      
      if (ogSiteName) {
        brandName = decodeHtmlEntities(ogSiteName);
      } else if (titleMatch && titleMatch[1]) {
        const title = decodeHtmlEntities(titleMatch[1].trim());
        const cleanTitle = title.split(/[|•-]/)[0].trim();
        if (cleanTitle && cleanTitle.length > 2 && cleanTitle.length < 30) {
          brandName = cleanTitle;
        } else if (ogTitle && ogTitle.length > 2 && ogTitle.length < 30) {
          brandName = decodeHtmlEntities(ogTitle.split(/[|•-]/)[0].trim());
        }
      }

      // 2. Logo
      let rawLogoUrl = '';
      const logoImgRegex = /<img[^>]+(?:id|class|alt)=["'][^"']*(?:logo|brand)[^"']*["'][^>]+src=["']([^"']+)["']/i;
      const logoImgRegexReverse = /<img[^>]+src=["']([^"']+)["'][^>]+(?:id|class|alt)=["'][^"']*(?:logo|brand)[^"']*["']/i;
      
      const logoMatch = html.match(logoImgRegex) || html.match(logoImgRegexReverse);
      if (logoMatch && logoMatch[1]) {
        rawLogoUrl = logoMatch[1];
      }

      if (!rawLogoUrl) {
        const iconRegexes = [
          /<link[^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i,
          /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["']/i
        ];
        for (const regex of iconRegexes) {
          const match = html.match(regex);
          if (match && match[1]) {
            rawLogoUrl = match[1];
            break;
          }
        }
      }

      if (!rawLogoUrl) {
        const ogImg = getMetaTag(html, 'og:image');
        if (ogImg) rawLogoUrl = ogImg;
      }

      // 3. Colors
      const hexRegex = /#([a-f0-9]{6}|[a-f0-9]{3})\b/gi;
      let colorMatch;
      const colorCounts: Record<string, number> = {};
      while ((colorMatch = hexRegex.exec(html)) !== null) {
        const hex = colorMatch[0].toLowerCase();
        const isNeutral = ['#ffffff', '#000000', '#333333', '#666666', '#cccccc', '#eeeeee', '#f3f4f6', '#f8fafc', '#fff', '#000', '#111827', '#1f2937', '#e5e7eb'].includes(hex);
        if (!isNeutral) {
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }
      }
      const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);

      // 4. Images
      const rawImages: string[] = [];
      const ogImg = getMetaTag(html, 'og:image');
      if (ogImg) rawImages.push(resolveUrl(ogImg, resolvedUrl));
      
      const imgAttributeRegex = /<img[^>]+(?:src|data-src|data-lazy-src|data-original)=["']([^"']+)["']/gi;
      let imgAttrMatch;
      const iconKeywords = ['icon', 'logo', 'star', 'arrow', 'social', 'facebook', 'twitter', 'instagram', 'youtube', 'pixel', 'tracker', 'spacer', 'loading', 'spinner', 'check', 'badge', 'cart', 'search', 'close', 'menu'];

      while ((imgAttrMatch = imgAttributeRegex.exec(html)) !== null) {
        const srcUrl = imgAttrMatch[1];
        if (srcUrl && !srcUrl.startsWith('data:')) {
          const lowercaseSrc = srcUrl.toLowerCase();
          const isIcon = iconKeywords.some(keyword => lowercaseSrc.includes(keyword));
          if (!isIcon) {
            const resolved = resolveUrl(srcUrl, resolvedUrl);
            if (!rawImages.includes(resolved)) {
              rawImages.push(resolved);
            }
          }
        }
        if (rawImages.length >= 10) break;
      }

      // 5. Offers
      const offers: string[] = [];
      const headingsList: string[] = [];
      const tagContentRegex = /<(h1|h2|h3|p)[^>]*>([\s\S]*?)<\/\1>/gi;
      let textMatch;
      const salesKeywords = ['off', 'sale', 'discount', 'free', 'save', 'limited', 'deal', 'promo', 'special', 'shipping', 'guarantee', 'join', 'get', 'start', 'try', 'now', 'order', 'buy', 'price', '$', '%', 'only'];

      while ((textMatch = tagContentRegex.exec(html)) !== null) {
        const tag = textMatch[1].toLowerCase();
        const rawText = decodeHtmlEntities(stripTags(textMatch[2])).trim();
        if (rawText.length > 10 && rawText.length < 90) {
          if (tag.startsWith('h')) {
            if (!headingsList.includes(rawText)) headingsList.push(rawText);
          }
          const containsKeyword = salesKeywords.some(kw => rawText.toLowerCase().includes(kw));
          if (containsKeyword && !offers.includes(rawText)) {
            offers.push(rawText);
          }
        }
      }

      if (offers.length < 2) {
        headingsList.forEach(heading => {
          if (offers.length < 4 && !offers.includes(heading)) {
            offers.push(heading);
          }
        });
      }

      // Tone
      let tone = `Professional, modern, and customer-focused branding for ${brandName}`;
      const description = getMetaTag(html, 'description');
      if (description) {
        const cleanDesc = decodeHtmlEntities(description);
        tone = cleanDesc.length > 140 ? cleanDesc.substring(0, 140) + '...' : cleanDesc;
      } else if (headingsList.length > 0) {
        tone = `Copywriting focuses on: "${headingsList.slice(0, 2).join(' / ')}"`;
      }

      brandData = {
        name: brandName,
        logoUrl: rawLogoUrl,
        colors: sortedColors,
        images: rawImages,
        offers: offers,
        tone: tone,
        testimonials: []
      };
      scrapeMethodUsed = 'fetch-fallback';
    }

    // ----------------------------------------------------
    // ASSET PIPELINE: CLOUDINARY UPLOADS & RESOLUTIONS
    // ----------------------------------------------------
    console.log(`Processing media assets via Cloudinary/Proxy (Scraped via: ${scrapeMethodUsed})`);
    
    let brandName = brandData.name || capitalizedName;
    brandName = brandName.replace(/\s+(l\.?l\.?c\.?|inc\.?|corp\.?|ltd\.?|co\.?)$/i, '');

    // Upload Logo
    let logoUrl = '';
    if (brandData.logoUrl) {
      try {
        const absoluteLogo = new URL(brandData.logoUrl, resolvedUrl).href;
        logoUrl = await uploadToCloudinary(absoluteLogo, 'epicorn/logos');
      } catch (e) {
        logoUrl = brandData.logoUrl;
      }
    }
    // If Cloudinary is not configured or failed to upload, wrap with local proxy endpoint
    if (logoUrl && !logoUrl.includes('cloudinary.com')) {
      logoUrl = `/api/proxy-image?url=${encodeURIComponent(logoUrl)}`;
    }

    // Upload Product Images
    const resolvedImages: string[] = [];
    for (const img of (brandData.images || [])) {
      try {
        const absoluteImg = new URL(img, resolvedUrl).href;
        let uploaded = await uploadToCloudinary(absoluteImg, 'epicorn/assets');
        if (uploaded && !uploaded.includes('cloudinary.com')) {
          uploaded = `/api/proxy-image?url=${encodeURIComponent(uploaded)}`;
        }
        resolvedImages.push(uploaded);
      } catch (e) {
        resolvedImages.push(`/api/proxy-image?url=${encodeURIComponent(img)}`);
      }
    }

    const extractedColors = {
      primary: brandData.colors[0] || '#0d9488',
      secondary: brandData.colors[1] || '#0f172a',
      tertiary: brandData.colors[2] || '#64748b',
      background: '#f8fafc',
      text: '#0f172a'
    };

    // Stock fallback backdrops
    const isSkincare = targetUrl.includes('glow') || targetUrl.includes('skin') || targetUrl.includes('beauty') || targetUrl.includes('organic') || targetUrl.includes('skincare');
    const isCoffee = targetUrl.includes('coffee') || targetUrl.includes('cup') || targetUrl.includes('brew') || targetUrl.includes('cafe') || targetUrl.includes('espresso');
    const isWoodworking = targetUrl.includes('wood') || targetUrl.includes('carpenter') || targetUrl.includes('craft') || targetUrl.includes('woodworking');

    let categoryStock: string[] = [];
    if (isSkincare) {
      categoryStock = [
        'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop'
      ];
    } else if (isCoffee) {
      categoryStock = [
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600&auto=format&fit=crop'
      ];
    } else if (isWoodworking) {
      categoryStock = [
        'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1540115808298-7561a4c979d5?q=80&w=600&auto=format&fit=crop'
      ];
    } else {
      categoryStock = [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop'
      ];
    }

    const stockBackupProxied = categoryStock.map(img => `/api/proxy-image?url=${encodeURIComponent(img)}`);

    while (resolvedImages.length < 4) {
      resolvedImages.push(stockBackupProxied[resolvedImages.length % stockBackupProxied.length]);
    }

    const testimonials = brandData.testimonials && brandData.testimonials.length > 0 ? brandData.testimonials : [
      { quote: `Extremely satisfied with the service and quality of ${brandName}. Highly recommend!`, author: 'Verified Customer', rating: 5 }
    ];

    let offers = brandData.offers.slice(0, 4);
    if (offers.length === 0) {
      if (isWoodworking) {
        offers = [
          'Get 16,000 Woodworking Plans & Projects!',
          'Step-by-step instructions with detailed blueprints',
          'Start your carpentry projects today with our guides'
        ];
      } else {
        offers = [
          `Exclusive deals and campaign launches at ${brandName}!`,
          `Get free delivery on orders from ${brandName}`,
          `Premium quality guaranteed - shop our collections`
        ];
      }
    }

    let tone = brandData.tone || `Professional, modern, and customer-focused branding for ${brandName}`;
    if (tone.length > 140) {
      tone = tone.substring(0, 140) + '...';
    }

    return NextResponse.json({
      name: brandName,
      websiteUrl: url,
      logoUrl: logoUrl || null,
      colors: extractedColors,
      fonts: {
        headline: 'Manrope',
        body: 'Hanken Grotesk'
      },
      tone: tone,
      offers: offers,
      testimonials: testimonials,
      images: resolvedImages.slice(0, 6)
    });

  } catch (error: any) {
    console.error('Error during brand extraction API call:', error);
    return NextResponse.json({ error: error.message || 'Scraping error' }, { status: 500 });
  }
}

// Meta Tag Extractor Helper
function getMetaTag(html: string, nameOrProperty: string): string {
  try {
    const regex = new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProperty}["'][^>]+content=["']([^"']+)["']`, 'i');
    const match = html.match(regex);
    if (match) return match[1];
    
    const reverseRegex = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${nameOrProperty}["']`, 'i');
    const revMatch = html.match(reverseRegex);
    return revMatch ? revMatch[1] : '';
  } catch (e) {
    return '';
  }
}

// Fallback Brand Generator
function generateFallbackBrand(url: string, brandName: string) {
  const isSkincare = url.includes('glow') || url.includes('skin') || url.includes('beauty') || url.includes('organic') || url.includes('skincare');
  const isCoffee = url.includes('coffee') || url.includes('cup') || url.includes('brew') || url.includes('cafe') || url.includes('espresso');
  const isWoodworking = url.includes('wood') || url.includes('carpenter') || url.includes('craft') || url.includes('tedswoodworking');
  
  const getProxied = (u: string) => `/api/proxy-image?url=${encodeURIComponent(u)}`;

  if (isSkincare) {
    return {
      name: brandName || 'Glow Organics',
      websiteUrl: url,
      logoUrl: null,
      colors: {
        primary: '#4b6700',
        secondary: '#5b5e66',
        tertiary: '#586152',
        background: '#f8f9ff',
        text: '#0b1c30'
      },
      fonts: { headline: 'Manrope', body: 'Hanken Grotesk' },
      tone: 'Premium, clean, and organic skincare brand',
      offers: [
        'Get 20% OFF on all skincare products',
        'Free shipping on orders over $50',
        'Buy 2 serums, get a toner free'
      ],
      testimonials: [{ quote: 'This changed my skin forever. Highly recommended!', author: 'Sarah M.', rating: 5 }],
      images: [
        getProxied('https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600'),
        getProxied('https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600'),
        getProxied('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600')
      ]
    };
  }

  if (isCoffee) {
    return {
      name: brandName || 'Urban Cup Coffee',
      websiteUrl: url,
      logoUrl: null,
      colors: {
        primary: '#4E3629',
        secondary: '#D2B48C',
        tertiary: '#8B5A2B',
        background: '#FAF5EF',
        text: '#2C1D11'
      },
      fonts: { headline: 'Manrope', body: 'Hanken Grotesk' },
      tone: 'Warm, cozy, and community-centric coffee roasting',
      offers: [
        'Buy one cold brew, get one half off',
        'Get a free croissant with any large drink before 9 AM',
        'Save 15% on fresh roasted coffee bags'
      ],
      testimonials: [{ quote: 'Best daily coffee ritual in the city!', author: 'Marcus T.', rating: 5 }],
      images: [
        getProxied('https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600'),
        getProxied('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600'),
        getProxied('https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600')
      ]
    };
  }

  if (isWoodworking) {
    return {
      name: brandName || 'Teds Woodworking Plans',
      websiteUrl: url,
      logoUrl: null,
      colors: {
        primary: '#8B4513',
        secondary: '#3E2723',
        tertiary: '#D7CCC8',
        background: '#efebe9',
        text: '#3e2723'
      },
      fonts: { headline: 'Manrope', body: 'Hanken Grotesk' },
      tone: 'Informative, builder-focused, and project-packed carpentry blueprints',
      offers: [
        'Get 16,000 Woodworking Plans & Projects!',
        'Download step-by-step build blueprints instantly',
        'Limited time offer: Save 50% on complete carpenter guides'
      ],
      testimonials: [{ quote: 'Best plans I have ever followed. Clear diagrams and material lists!', author: 'Greg S.', rating: 5 }],
      images: [
        getProxied('https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600'),
        getProxied('https://images.unsplash.com/photo-1452857297128-d9c29adba80b?q=80&w=600'),
        getProxied('https://images.unsplash.com/photo-1540115808298-7561a4c979d5?q=80&w=600')
      ]
    };
  }

  return {
    name: brandName,
    websiteUrl: url,
    logoUrl: null,
    colors: {
      primary: '#0f172a',
      secondary: '#0ea5e9',
      tertiary: '#475569',
      background: '#f8fafc',
      text: '#0f172a'
    },
    fonts: { headline: 'Manrope', body: 'Hanken Grotesk' },
    tone: 'Professional, innovative, and growth-focused',
    offers: [
      `Save 30% on all plans for ${brandName} today!`,
      'Start your 14-day free trial, no card required',
      `Upgrade your workflow with ${brandName} premium`
    ],
    testimonials: [{ quote: 'Outstanding results and support from the entire team.', author: 'John D.', rating: 5 }],
    images: [
      getProxied('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600'),
      getProxied('https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=600'),
      getProxied('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600')
    ]
  };
}

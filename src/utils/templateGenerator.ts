import { BrandKit, PlatformType, CanvasElement } from '../types';

export function generateAdElements(
  brand: BrandKit,
  platform: PlatformType,
  angleIndex: number // 0: Offer, 1: Benefit, 2: Testimonial
): CanvasElement[] {
  const elements: CanvasElement[] = [];
  const isVertical = platform === 'instagram-story';
  const isWide = platform === 'facebook-feed' || platform === 'linkedin-post';
  const isPortrait = platform === 'instagram-post';

  // Extract brand styling
  const primaryColor = brand.colors.primary || '#4b6700';
  const secondaryColor = brand.colors.secondary || '#5b5e66';
  const bgColor = brand.colors.background || '#f8f9ff';
  const textColor = brand.colors.text || '#0b1c30';
  const logoText = brand.logoUrl || brand.name;
  
  // Custom template assets
  const mainImage = brand.images[0] || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600';
  const secondaryImage = brand.images[1] || brand.images[0] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600';

  if (angleIndex === 0) {
    // ----------------------------------------------------
    // TEMPLATE 1: OFFER-FOCUSED (Bold, High Contrast, Action)
    // ----------------------------------------------------
    
    // 1. Background Image
    elements.push({
      id: 'bg-img',
      type: 'image',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      content: mainImage,
      zIndex: 1,
    });

    // 2. Dark/Glass Overlay for readability
    elements.push({
      id: 'bg-overlay',
      type: 'shape',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      content: 'rectangle',
      backgroundColor: 'rgba(11, 28, 48, 0.45)',
      zIndex: 2,
    });

    // 3. Brand Logo (Top Center)
    elements.push({
      id: 'logo',
      type: 'logo',
      x: 10,
      y: isVertical ? 6 : 8,
      width: 80,
      height: 6,
      content: logoText,
      fontSize: isVertical ? 22 : 18,
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center',
      zIndex: 3,
    });

    // 4. Headline (The Offer)
    const offerText = brand.offers[0] || 'LIMITED TIME OFFER';
    elements.push({
      id: 'headline',
      type: 'text',
      x: 10,
      y: isVertical ? 28 : isWide ? 22 : 26,
      width: 80,
      height: isVertical ? 22 : isWide ? 26 : 22,
      content: offerText.toUpperCase(),
      fontSize: isVertical ? 38 : isWide ? 34 : 32,
      fontWeight: 'bold',
      color: '#baf91a', // Neon Green contrast accent
      align: 'center',
      zIndex: 4,
    });

    // 5. Body Copy / Urgency Text
    elements.push({
      id: 'body-text',
      type: 'text',
      x: 15,
      y: isVertical ? 54 : isWide ? 50 : 52,
      width: 70,
      height: 10,
      content: 'Upgrade your routine. Experience the difference today with our premium items.',
      fontSize: isVertical ? 16 : 14,
      color: '#ffffff',
      align: 'center',
      zIndex: 5,
    });

    // 6. Action Button (CTA)
    elements.push({
      id: 'cta-button',
      type: 'button',
      x: 30,
      y: isVertical ? 80 : isWide ? 76 : 78,
      width: 40,
      height: isVertical ? 8 : isWide ? 10 : 9,
      content: 'SHOP THE SALE',
      fontSize: isVertical ? 15 : 13,
      fontWeight: 'bold',
      color: '#0b1c30',
      backgroundColor: '#baf91a', // Neon Green
      borderRadius: 9999, // Pill shape
      align: 'center',
      zIndex: 6,
    });

  } else if (angleIndex === 1) {
    // ----------------------------------------------------
    // TEMPLATE 2: BENEFIT-FOCUSED (Clean, Product-focused, Informative)
    // ----------------------------------------------------
    
    // 1. Clean Solid Background
    elements.push({
      id: 'bg-color',
      type: 'shape',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      content: 'rectangle',
      backgroundColor: bgColor,
      zIndex: 1,
    });

    if (isWide) {
      // Wide layouts (Facebook/LinkedIn): Left side copy, Right side image
      elements.push({
        id: 'product-img',
        type: 'image',
        x: 55,
        y: 0,
        width: 45,
        height: 100,
        content: secondaryImage,
        zIndex: 2,
      });

      elements.push({
        id: 'logo',
        type: 'logo',
        x: 6,
        y: 10,
        width: 45,
        height: 6,
        content: logoText,
        fontSize: 18,
        fontWeight: 'bold',
        color: primaryColor,
        align: 'left',
        zIndex: 3,
      });

      elements.push({
        id: 'headline',
        type: 'text',
        x: 6,
        y: 22,
        width: 45,
        height: 20,
        content: 'Why Choose Glow Organics?',
        fontSize: 26,
        fontWeight: 'bold',
        color: textColor,
        align: 'left',
        zIndex: 4,
      });

      elements.push({
        id: 'body-text',
        type: 'text',
        x: 6,
        y: 45,
        width: 45,
        height: 25,
        content: '✓ 100% Cruelty-free & organic\n✓ Dermatologist tested & approved\n✓ Instant glowing hydration',
        fontSize: 14,
        color: secondaryColor,
        align: 'left',
        zIndex: 5,
      });

      elements.push({
        id: 'cta-button',
        type: 'button',
        x: 6,
        y: 76,
        width: 25,
        height: 12,
        content: 'LEARN MORE',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: primaryColor,
        borderRadius: 6,
        align: 'center',
        zIndex: 6,
      });

    } else if (isVertical) {
      // Tall layouts (Instagram Story): Stacked vertically
      elements.push({
        id: 'product-img',
        type: 'image',
        x: 0,
        y: 42,
        width: 100,
        height: 58,
        content: secondaryImage,
        zIndex: 2,
      });

      // Subtle gradient overlay over bottom image
      elements.push({
        id: 'img-overlay',
        type: 'shape',
        x: 0,
        y: 42,
        width: 100,
        height: 20,
        content: 'rectangle',
        backgroundColor: `linear-gradient(to bottom, ${bgColor}, transparent)`,
        zIndex: 3,
      });

      elements.push({
        id: 'logo',
        type: 'logo',
        x: 10,
        y: 8,
        width: 80,
        height: 6,
        content: logoText,
        fontSize: 20,
        fontWeight: 'bold',
        color: primaryColor,
        align: 'center',
        zIndex: 4,
      });

      elements.push({
        id: 'headline',
        type: 'text',
        x: 10,
        y: 16,
        width: 80,
        height: 10,
        content: 'Nourish Your Natural Beauty',
        fontSize: 26,
        fontWeight: 'bold',
        color: textColor,
        align: 'center',
        zIndex: 5,
      });

      elements.push({
        id: 'body-text',
        type: 'text',
        x: 15,
        y: 28,
        width: 70,
        height: 12,
        content: '✔ 100% cruelty-free  ✔ Certified organic  ✔ Instant hydration',
        fontSize: 13,
        color: secondaryColor,
        align: 'center',
        zIndex: 6,
      });

      elements.push({
        id: 'cta-button',
        type: 'button',
        x: 30,
        y: 84,
        width: 40,
        height: 7,
        content: 'ORDER TODAY',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: primaryColor,
        borderRadius: 8,
        align: 'center',
        zIndex: 7,
      });

    } else {
      // Square layouts (Instagram Square/Post): Stacking/overlapping
      elements.push({
        id: 'product-img',
        type: 'image',
        x: 52,
        y: 12,
        width: 43,
        height: 76,
        content: secondaryImage,
        borderRadius: 12,
        zIndex: 2,
      });

      elements.push({
        id: 'logo',
        type: 'logo',
        x: 8,
        y: 10,
        width: 40,
        height: 6,
        content: logoText,
        fontSize: 18,
        fontWeight: 'bold',
        color: primaryColor,
        align: 'left',
        zIndex: 3,
      });

      elements.push({
        id: 'headline',
        type: 'text',
        x: 8,
        y: 22,
        width: 40,
        height: 20,
        content: 'Clean formulas that work.',
        fontSize: 26,
        fontWeight: 'bold',
        color: textColor,
        align: 'left',
        zIndex: 4,
      });

      elements.push({
        id: 'body-text',
        type: 'text',
        x: 8,
        y: 46,
        width: 40,
        height: 25,
        content: '• Dermatologist approved\n• Vegan and cruelty-free\n• Lightweight formula\n• Visible results in 7 days',
        fontSize: 13,
        color: secondaryColor,
        align: 'left',
        zIndex: 5,
      });

      elements.push({
        id: 'cta-button',
        type: 'button',
        x: 8,
        y: 78,
        width: 32,
        height: 10,
        content: 'BUY NOW',
        fontSize: 13,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: primaryColor,
        borderRadius: 8,
        align: 'center',
        zIndex: 6,
      });
    }

  } else {
    // ----------------------------------------------------
    // TEMPLATE 3: TESTIMONIAL-FOCUSED (Social proof, High trust)
    // ----------------------------------------------------

    // 1. Soft Textured/Tinted Background
    elements.push({
      id: 'bg-color',
      type: 'shape',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      content: 'rectangle',
      backgroundColor: bgColor,
      zIndex: 1,
    });

    // 2. Large Subtle Quote Mark Icon
    elements.push({
      id: 'quote-mark',
      type: 'text',
      x: 8,
      y: isVertical ? 15 : isWide ? 10 : 12,
      width: 20,
      height: 10,
      content: '“',
      fontSize: 80,
      fontWeight: 'bold',
      color: 'rgba(186, 249, 26, 0.45)', // Neon Tint
      align: 'left',
      zIndex: 2,
    });

    // 3. The Testimonial Text
    const testimonial = brand.testimonials[0] || { quote: 'Best purchase I have made this year!', author: 'Happy Customer' };
    elements.push({
      id: 'headline',
      type: 'text',
      x: 10,
      y: isVertical ? 24 : isWide ? 20 : 22,
      width: 80,
      height: isVertical ? 25 : isWide ? 28 : 25,
      content: `“${testimonial.quote}”`,
      fontSize: isVertical ? 22 : isWide ? 20 : 18,
      fontStyle: 'italic',
      fontWeight: '600',
      color: textColor,
      align: 'center',
      zIndex: 3,
    });

    // 4. Rating Stars (⭐⭐⭐⭐⭐)
    elements.push({
      id: 'rating-stars',
      type: 'text',
      x: 10,
      y: isVertical ? 50 : isWide ? 50 : 48,
      width: 80,
      height: 6,
      content: '★ ★ ★ ★ ★',
      fontSize: 18,
      color: '#F59E0B', // Gold Star color
      align: 'center',
      zIndex: 4,
    });

    // 5. Author Attribution
    elements.push({
      id: 'author',
      type: 'text',
      x: 10,
      y: isVertical ? 58 : isWide ? 58 : 56,
      width: 80,
      height: 6,
      content: `— ${testimonial.author}, ${testimonial.role || 'Verified Buyer'}`,
      fontSize: 14,
      fontWeight: 'bold',
      color: secondaryColor,
      align: 'center',
      zIndex: 5,
    });

    // 6. Inline Product Card/Image
    elements.push({
      id: 'product-img',
      type: 'image',
      x: 40,
      y: isVertical ? 66 : isWide ? 66 : 64,
      width: 20,
      height: isVertical ? 12 : isWide ? 15 : 14,
      content: mainImage,
      borderRadius: 9999, // Circular image
      zIndex: 6,
    });

    // 7. Small Brand Logo
    elements.push({
      id: 'logo',
      type: 'logo',
      x: 10,
      y: isVertical ? 80 : isWide ? 84 : 82,
      width: 80,
      height: 6,
      content: logoText,
      fontSize: 14,
      fontWeight: 'bold',
      color: primaryColor,
      align: 'center',
      zIndex: 7,
    });

    // 8. Tiny CTA Link
    elements.push({
      id: 'cta-button',
      type: 'button',
      x: 35,
      y: isVertical ? 86 : isWide ? 90 : 88,
      width: 30,
      height: 6,
      content: 'VISIT WEBSITE →',
      fontSize: 11,
      fontWeight: 'bold',
      color: primaryColor,
      backgroundColor: 'transparent',
      align: 'center',
      zIndex: 8,
    });
  }

  // Set default font families
  return elements.map(el => ({
    ...el,
    fontFamily: el.type === 'logo' || el.id === 'headline' ? brand.fonts.headline : brand.fonts.body,
  }));
}

'use client';

import { useEffect } from 'react';

const TOUR_KEY = 'skynkarma_tour_complete';

interface ProductTourProps {
  onOpenChat: () => void;
  onOpenIngredients: () => void;
}

export default function ProductTour({ onOpenChat, onOpenIngredients }: ProductTourProps) {
  useEffect(() => {
    // Only show tour once
    if (localStorage.getItem(TOUR_KEY)) return;

    let driver: any;

    const initTour = async () => {
      const { driver: driverFn } = await import('driver.js');
      await import('driver.js/dist/driver.css');

      driver = driverFn({
        showProgress: true,
        animate: true,
        overlayColor: '#0f172a',
        overlayOpacity: 0.7,
        smoothScroll: true,
        allowClose: true,
        progressText: '{{current}} of {{total}}',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: "Let's go! ✨",
        onDestroyStarted: () => {
          localStorage.setItem(TOUR_KEY, 'true');
          driver.destroy();
        },
        steps: [
          {
            element: '#tour-welcome',
            popover: {
              title: '👋 Welcome to Skyn Karma!',
              description: "We're your personal AI skincare advisor. Let us show you around — it'll take less than a minute.",
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-chat',
            popover: {
              title: '💬 Your AI Skin Advisor',
              description: 'Ask anything about skincare — ingredients, routines, products. Get honest, science-backed advice tailored to your skin.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-tools',
            popover: {
              title: '🔬 Powerful Skincare Tools',
              description: 'Three tools to help you make smarter decisions: decode ingredients, check product compatibility, and spot misleading claims.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-saved',
            popover: {
              title: '🔖 Save & Find Best Prices',
              description: 'Save products you love or want to try, then find the best price across major retailers with one tap.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-profile',
            popover: {
              title: '✨ Set Up Your Skin Profile',
              description: 'Tell us about your skin type, concerns and sensitivities — every piece of advice will be personalised to you. Takes 2 minutes.',
              side: 'bottom',
              align: 'start',
            },
          },
        ],
      });

      // Small delay to let the dashboard render fully
      setTimeout(() => driver.drive(), 800);
    };

    initTour();

    return () => {
      if (driver) driver.destroy();
    };
  }, []);

  return null;
}
'use client';

import { useEffect } from 'react';
import { driver } from 'driver.js';

const TOUR_KEY = 'skynkarma_tour_complete';

interface ProductTourProps {
  onOpenChat: () => void;
  onOpenIngredients: () => void;
}

export default function ProductTour({ onOpenChat, onOpenIngredients }: ProductTourProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(TOUR_KEY)) return;

    const isMobile = window.innerWidth < 641;
    const ids = isMobile
      ? { chat: '#mob-tour-chat', tools: '#mob-tour-tools', saved: '#mob-tour-saved', profile: '#mob-tour-profile' }
      : { chat: '#tour-chat', tools: '#tour-tools', saved: '#tour-saved', profile: '#tour-profile' };

    const driverObj = driver({
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
        driverObj.destroy();
      },
      steps: [
        {
          popover: {
            title: '👋 Welcome to skynkarma!',
            description: "We're your personal AI skincare advisor. Let us show you around — it'll take less than a minute.",
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: ids.profile,
          popover: {
            title: '✨ Set Up Your Skin Profile',
            description: 'Tell us about your skin type and concerns — every piece of advice will be personalised to you. Takes 2 minutes.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: ids.chat,
          popover: {
            title: '💬 Your AI Skin Advisor',
            description: 'Ask anything about skincare — ingredients, routines, products. Get honest, science-backed advice tailored to your skin.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: ids.tools,
          popover: {
            title: '🔬 Powerful Skincare Tools',
            description: 'Three tools to help you make smarter decisions: decode ingredients, check product compatibility, and spot misleading claims.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: ids.saved,
          popover: {
            title: '🔖 Save & Find Best Prices',
            description: 'Save products you love or want to try, then find the best price across major retailers with one tap.',
            side: 'top',
            align: 'center',
          },
        },
      ],
    });

    setTimeout(() => driverObj.drive(), 1000);

    return () => {
      driverObj.destroy();
    };
  }, []);

  return null;
}
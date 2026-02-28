import { useEffect, useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_DISMISSED_KEY = 'scent-recipe-tour-dismissed';

const tourSteps: DriveStep[] = [
  {
    element: '#tour-hero',
    popover: {
      title: 'Welcome to COGS Calculator! 🕯️',
      description: 'This app helps you calculate the true cost of your home fragrance products and set profitable prices. Let\'s take a quick tour!',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-materials-card',
    popover: {
      title: 'Step 1: Add Your Materials',
      description: 'Start here. Add your raw ingredients (wax, fragrance oil, dye) and packaging (vessels, lids, labels, boxes) with their costs. You only need to do this once — they\'re reusable across all products.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-calculator-card',
    popover: {
      title: 'Step 2: Build a Product',
      description: 'Once you have materials, come here to create a product. Set your formula percentages, add packaging, and the calculator will work out your COGS and suggest wholesale & retail prices.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-help-section',
    popover: {
      title: 'Need Help? Look for These',
      description: 'Each page has a help button like this one. Click it to expand detailed instructions and explanations for that page.',
      side: 'bottom',
      align: 'start',
    },
  },
];

export function useGuidedTour(isNewUser: boolean) {
  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'scent-tour-popover',
      steps: tourSteps,
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
        driverObj.destroy();
      },
    });

    // Small delay to ensure DOM elements are rendered
    setTimeout(() => driverObj.drive(), 600);
  }, []);

  useEffect(() => {
    const dismissed = localStorage.getItem(TOUR_DISMISSED_KEY);
    if (isNewUser && !dismissed) {
      startTour();
    }
  }, [isNewUser, startTour]);

  return { startTour };
}

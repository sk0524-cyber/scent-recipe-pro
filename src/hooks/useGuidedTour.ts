import { useEffect, useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_DISMISSED_KEY = 'scent-recipe-tour-dismissed';

const tourSteps: DriveStep[] = [
  {
    element: '#tour-hero',
    popover: {
      title: 'Welcome to COGS Calculator! 🕯️',
      description: 'This app helps you calculate the true cost of your products and set profitable prices. Let\'s take a quick tour of everything you can do!',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-materials-card',
    popover: {
      title: '1. Add Your Materials',
      description: 'Start here. Add your raw ingredients (wax, fragrance oil, dye) and packaging (vessels, lids, labels, boxes) with their costs. You only need to do this once — they\'re reusable across all products.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-calculator-card',
    popover: {
      title: '2. Build a Product',
      description: 'Once you have materials, create a product here. Set your formula percentages, add packaging components, and the calculator will work out your COGS and suggest wholesale & retail prices.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#tour-retail-stores',
    popover: {
      title: '3. Track Retail Store Sales',
      description: 'Add your retail partners in Settings, then come here to assign products and log monthly sales. See which stores are most profitable at a glance.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    popover: {
      title: '4. Export Reports 📄',
      description: 'Generate PDF cost sheets for any product and download retail performance reports. Find export buttons on the Calculator and Retail Stores pages.',
    },
  },
  {
    popover: {
      title: '5. Set Your Defaults ⚙️',
      description: 'Head to Settings to configure your retail store directory, manage your account, and set up your business preferences.',
    },
  },
  {
    element: '#tour-help-section',
    popover: {
      title: 'Need Help? Look for These',
      description: 'Each page has an expandable help section like this. Click it for detailed instructions, formulas, and tips specific to that page.',
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

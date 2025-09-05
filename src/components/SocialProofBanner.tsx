import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Activity } from 'lucide-react';

interface NotificationData {
  name: string;
  town: string;
  businessType: string;
  type: 'analysis' | 'speedTest';
  timestamp: string;
}

const SocialProofBanner: React.FC = () => {
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const names = ["Sarah", "Mike", "Jenny", "Dave", "Emma", "Tom", "Lisa", "Chris", "Kate", "James", "Michelle", "Paul", "Rebecca", "Steve", "Amanda"];
  const towns = ["Bairnsdale", "Lakes Entrance", "Orbost", "Mallacoota", "Bendigo", "Ballarat", "Warrnambool", "Shepparton", "Wodonga", "Traralgon", "Sale", "Mildura", "Geelong", "Paynesville", "Metung"];
  const businessTypes = ["café", "plumbing", "electrical", "restaurant", "motel", "retail shop", "hair salon", "real estate", "automotive", "bakery", "construction", "accounting firm", "dental practice", "fitness studio", "florist"];

  const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const getTimestamp = (): string => {
    const options = ["just now", "2 minutes ago", "5 minutes ago"];
    return getRandomItem(options);
  };

  const generateNotification = (): NotificationData => {
    const shownKey = 'socialProofShown';
    const shown = JSON.parse(sessionStorage.getItem(shownKey) || '[]');
    
    let attempts = 0;
    let notification: NotificationData;
    
    do {
      notification = {
        name: getRandomItem(names),
        town: getRandomItem(towns),
        businessType: getRandomItem(businessTypes),
        type: Math.random() > 0.5 ? 'analysis' : 'speedTest',
        timestamp: getTimestamp()
      };
      attempts++;
    } while (shown.some((n: NotificationData) => 
      n.name === notification.name && 
      n.town === notification.town && 
      n.businessType === notification.businessType
    ) && attempts < 10);

    shown.push(notification);
    if (shown.length > 50) shown.shift(); // Keep only last 50
    sessionStorage.setItem(shownKey, JSON.stringify(shown));
    
    return notification;
  };

  const showNotification = () => {
    if (isPaused) return;
    
    const notification = generateNotification();
    setCurrentNotification(notification);
    setIsVisible(true);
    setProgress(100);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev - 2; // Decrease by 2% every 100ms for 5 second duration
      });
    }, 100);

    // Hide notification after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
      clearInterval(progressInterval);
      setTimeout(() => {
        setCurrentNotification(null);
      }, 300); // Wait for fade out animation
    }, 5000);
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsPaused(true);
    setTimeout(() => {
      setCurrentNotification(null);
      // Resume after 5 minutes
      setTimeout(() => {
        setIsPaused(false);
      }, 5 * 60 * 1000);
    }, 300);
  };

  useEffect(() => {
    // Initial delay 8-12 seconds
    const initialDelay = Math.random() * 4000 + 8000;
    
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, initialDelay);

    // Recurring notifications every 15-25 seconds
    const recurringInterval = setInterval(() => {
      if (!isPaused && !isVisible) {
        const delay = Math.random() * 10000 + 15000;
        setTimeout(showNotification, delay);
      }
    }, 20000); // Check every 20 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(recurringInterval);
    };
  }, [isPaused, isVisible]);

  if (!currentNotification) return null;

  const getBannerText = () => {
    if (currentNotification.type === 'analysis') {
      return (
        <>
          <strong>{currentNotification.name}</strong> from{' '}
          <span className="text-[#FF6200] font-semibold">{currentNotification.town}</span> just got a{' '}
          <strong>Free Website Analysis</strong> for their {currentNotification.businessType} business
        </>
      );
    } else {
      return (
        <>
          <strong>{currentNotification.name}</strong> from{' '}
          <span className="text-[#FF6200] font-semibold">{currentNotification.town}</span> just tested their {currentNotification.businessType} website with the{' '}
          <strong>Free Website Speed Tester</strong>
        </>
      );
    }
  };

  return (
    <div
      className={`fixed bottom-5 left-5 max-w-[380px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 transition-all duration-400 ease-out z-50 md:max-w-[380px] sm:left-4 sm:right-4 sm:max-w-none ${
        isVisible
          ? 'transform translate-x-0 opacity-100'
          : 'transform -translate-x-full opacity-0 pointer-events-none'
      }`}
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      aria-live="polite"
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {currentNotification.type === 'analysis' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Activity className="w-5 h-5 text-blue-500" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-700 leading-relaxed">
            {getBannerText()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {currentNotification.timestamp}
          </div>
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-gray-100 rounded-b-lg overflow-hidden w-full">
        <div
          className="h-full bg-[#FF6200] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default SocialProofBanner;
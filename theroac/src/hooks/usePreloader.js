import { useEffect, useState } from 'react';

export const usePreloader = (delay = 1000) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Also hide any existing preloader elements
      const preloaders = document.querySelectorAll('.preloader');
      preloaders.forEach(preloader => {
        preloader.style.display = 'none';
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isLoading;
};
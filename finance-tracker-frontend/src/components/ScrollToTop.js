import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop - Automatically resets window scroll position to the top
 * on every React Router navigation event.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant' // Instant scroll ensures the page immediately displays from the top without jumping animations
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

import { useEffect } from 'react';
import { toast } from 'react-toastify';

const PageReloadNotifier: React.FC = () => {
  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry?.type === 'reload') {
      toast.info('🔄 Page was refreshed', { autoClose: 4000 });
    }
  }, []);

  return null;
};

export default PageReloadNotifier;

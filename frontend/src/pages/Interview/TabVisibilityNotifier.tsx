import { useEffect } from 'react';
import { toast } from 'react-toastify';

const TabVisibilityNotifier: React.FC = () => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        toast.warn(
          '⚠️ Tab was changed. Please stay on this tab — screen recording in progress.',
          { autoClose: 5000 }
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};

export default TabVisibilityNotifier;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const PageReloadNotifier: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navEntry?.type === 'reload') {
      localStorage.removeItem('i_token');
      toast.warn('⚠️ You refreshed the page. Exam has ended.', { autoClose: 3000 });

      // Navigate using React Router to avoid full page reload
      setTimeout(() => {
        navigate('/');
      },3100);
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Recording may be interrupted.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  return null;
};

export default PageReloadNotifier;

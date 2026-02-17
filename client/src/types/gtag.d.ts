// Google Analytics gtag type declaration
interface Window {
  gtag?: (
    command: 'event' | 'config' | 'js' | 'set',
    targetId: string | Date,
    config?: Record<string, any>
  ) => void;
  dataLayer?: any[];
}

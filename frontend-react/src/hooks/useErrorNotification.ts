import { useState, useEffect, useCallback } from "react";

export const useErrorNotification = (duration: number = 5000) => {
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState("");

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setShowError(true);
  }, []);

  const close = useCallback(() => {
    setShowError(false);
  }, []);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [showError, duration]);

  return {
    showError,
    message,
    show,
    close,
  };
};

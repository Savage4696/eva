'use client';

import { useState, useEffect } from 'react';

const MAX_DAILY_LIMIT = 20;
const STORAGE_KEY = 'eva_ai_usage_count';
const DATE_KEY = 'eva_ai_usage_date';

export function useUsageLimit() {
  const [count, setCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(DATE_KEY);
    const storedCount = localStorage.getItem(STORAGE_KEY);

    if (storedDate !== today) {
      localStorage.setItem(DATE_KEY, today);
      localStorage.setItem(STORAGE_KEY, '0');
      setCount(0);
    } else if (storedCount) {
      setCount(parseInt(storedCount, 10));
    }
    setMounted(true);
  }, []);

  const incrementUsage = () => {
    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());
  };

  const isLimitReached = count >= MAX_DAILY_LIMIT;

  return {
    count,
    limit: MAX_DAILY_LIMIT,
    incrementUsage,
    isLimitReached,
    mounted
  };
}

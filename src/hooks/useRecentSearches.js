// src/hooks/useRecentSearches.js
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'recentSearches';
const MAX_ITEMS = 5;

export const useRecentSearches = () => {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setRecent(JSON.parse(stored));
  }, []);

  const addSearch = (query) => {
    if (!query.trim()) return;
    const newRecent = [query, ...recent.filter(q => q !== query)].slice(0, MAX_ITEMS);
    setRecent(newRecent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecent));
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { recent, addSearch, clearRecent };
};
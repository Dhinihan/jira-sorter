'use client';

import { useState, useCallback, useMemo } from 'react';
import { JiraIssue } from '@/app/actions/jira';

interface BinarySearchState {
  low: number;
  high: number;
  mid: number;
}

interface HistoryState {
  sorted: JiraIssue[];
  currentIndex: number;
  binarySearch: BinarySearchState | null;
}

interface StoredSession {
  projectKey: string;
  issues: JiraIssue[];
  sorted: JiraIssue[];
  currentIndex: number;
  binarySearch: BinarySearchState | null;
  comparisonCache: Array<[string, 'left' | 'right']>;
  history: HistoryState[];
  timestamp: number;
  isComplete: boolean;
}

const SESSION_EXPIRY_DAYS = 7;
const MAX_HISTORY_SIZE = 10;

function generateSessionId(projectKey: string, issueCount: number): string {
  return `jira-sorter-${projectKey}-${issueCount}-${Date.now()}`;
}

function getCacheKey(key1: string, key2: string): string {
  return [key1, key2].sort().join(':');
}

function loadSession(sessionId: string | null): StoredSession | null {
  if (!sessionId || typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(sessionId);
    if (!stored) return null;
    
    const session: StoredSession = JSON.parse(stored);
    
    // Check expiration
    const daysSince = (Date.now() - session.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSince > SESSION_EXPIRY_DAYS) {
      localStorage.removeItem(sessionId);
      return null;
    }
    
    return session;
  } catch (e) {
    console.error('Failed to load session:', e);
    return null;
  }
}

export function useBinaryInsertionSort(
  issues: JiraIssue[],
  projectKey: string,
  sessionId?: string | null
) {
  const effectiveSessionId = sessionId || generateSessionId(projectKey, issues.length);
  const loadedSession = useMemo(() => loadSession(sessionId), [sessionId]);
  
  // Check if session is expired or mismatched
  const isSessionValid = loadedSession && 
    loadedSession.issues.length === issues.length && 
    loadedSession.projectKey === projectKey;
  
  // Initialize state from session or defaults
  const [sorted, setSorted] = useState<JiraIssue[]>(() => 
    isSessionValid ? loadedSession!.sorted : []
  );
  const [currentIndex, setCurrentIndex] = useState(() => 
    isSessionValid ? loadedSession!.currentIndex : 0
  );
  const [binarySearch, setBinarySearch] = useState<BinarySearchState | null>(() => 
    isSessionValid ? loadedSession!.binarySearch : null
  );
  const [isComplete, setIsComplete] = useState(() => 
    isSessionValid ? loadedSession!.isComplete : false
  );
  
  // Cache as state (not ref) to avoid render issues
  const [comparisonCache] = useState<Map<string, 'left' | 'right'>>(() => {
    const cache = new Map<string, 'left' | 'right'>();
    if (isSessionValid && loadedSession) {
      loadedSession.comparisonCache.forEach(([key, value]) => {
        cache.set(key, value);
      });
    }
    return cache;
  });
  
  const [history, setHistory] = useState<HistoryState[]>(() => 
    isSessionValid ? loadedSession!.history : []
  );
  
  // Save to localStorage
  const saveToStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const session: StoredSession = {
        projectKey,
        issues,
        sorted,
        currentIndex,
        binarySearch,
        comparisonCache: Array.from(comparisonCache.entries()),
        history,
        timestamp: Date.now(),
        isComplete,
      };
      localStorage.setItem(effectiveSessionId, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }, [effectiveSessionId, projectKey, issues, sorted, currentIndex, binarySearch, comparisonCache, history, isComplete]);
  
  // Start binary search for current issue
  const startBinarySearch = useCallback((issue: JiraIssue) => {
    if (sorted.length === 0) {
      // First issue goes directly
      const newSorted = [issue];
      setSorted(newSorted);
      const nextIndex = 1;
      setCurrentIndex(nextIndex);
      if (nextIndex >= issues.length) {
        setIsComplete(true);
      }
      return;
    }
    
    // Check cache first
    for (let i = 0; i < sorted.length; i++) {
      const cacheKey = getCacheKey(issue.key, sorted[i].key);
      const cached = comparisonCache.get(cacheKey);
      if (cached) {
        // Use cached result to determine position
        if (cached === 'left') {
          // Current issue is MORE important (comes before)
          if (i === 0) {
            setSorted(prev => [issue, ...prev]);
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            if (nextIndex >= issues.length) {
              setIsComplete(true);
            }
            return;
          }
        } else {
          // Current issue is LESS important (comes after)
          if (i === sorted.length - 1) {
            setSorted(prev => [...prev, issue]);
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            if (nextIndex >= issues.length) {
              setIsComplete(true);
            }
            return;
          }
        }
      }
    }
    
    // Start fresh binary search
    const mid = Math.floor(sorted.length / 2);
    setBinarySearch({ low: 0, high: sorted.length - 1, mid });
  }, [sorted, comparisonCache, currentIndex, issues.length]);
  
  // Handle user choice
  const handleChoice = useCallback((choice: 'left' | 'right') => {
    if (!binarySearch || currentIndex >= issues.length) return;
    
    const currentIssue = issues[currentIndex];
    const comparedIssue = sorted[binarySearch.mid];
    
    // Save state to history before changing (for undo)
    setHistory(prev => {
      const newHistory = [...prev, { sorted, currentIndex, binarySearch }];
      return newHistory.slice(-MAX_HISTORY_SIZE);
    });
    
    // Cache this comparison
    const cacheKey = getCacheKey(currentIssue.key, comparedIssue.key);
    comparisonCache.set(cacheKey, choice);
    
    const { low, high, mid } = binarySearch;
    
    if (choice === 'left') {
      // Current issue is MORE important (comes before comparedIssue)
      if (low >= mid) {
        // Found position: insert at low
        const newSorted = [...sorted];
        newSorted.splice(low, 0, currentIssue);
        setSorted(newSorted);
        setBinarySearch(null);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        if (nextIndex >= issues.length) {
          setIsComplete(true);
        }
      } else {
        // Continue search in left half
        const newHigh = mid - 1;
        setBinarySearch({ 
          low, 
          high: newHigh, 
          mid: Math.floor((low + newHigh) / 2) 
        });
      }
    } else {
      // Current issue is LESS important (comes after comparedIssue)
      if (high <= mid) {
        // Found position: insert at high + 1
        const newSorted = [...sorted];
        newSorted.splice(high + 1, 0, currentIssue);
        setSorted(newSorted);
        setBinarySearch(null);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        if (nextIndex >= issues.length) {
          setIsComplete(true);
        }
      } else {
        // Continue search in right half
        const newLow = mid + 1;
        setBinarySearch({ 
          low: newLow, 
          high, 
          mid: Math.floor((newLow + high) / 2) 
        });
      }
    }
  }, [binarySearch, currentIndex, issues, sorted, comparisonCache]);
  
  // Undo last choice
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setSorted(lastState.sorted);
    setCurrentIndex(lastState.currentIndex);
    setBinarySearch(lastState.binarySearch);
    setHistory(prev => prev.slice(0, -1));
    setIsComplete(false);
  }, [history]);
  
  // Restart (clear everything)
  const handleRestart = useCallback(() => {
    setSorted([]);
    setCurrentIndex(0);
    setBinarySearch(null);
    setHistory([]);
    setIsComplete(false);
    comparisonCache.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(effectiveSessionId);
    }
  }, [effectiveSessionId, comparisonCache]);
  
  // Compute current pair for comparison
  const currentPair: [JiraIssue, JiraIssue] | null = (() => {
    if (isComplete || currentIndex >= issues.length || !binarySearch) {
      // Auto-start if needed
      if (!isComplete && currentIndex < issues.length && !binarySearch && sorted.length > 0) {
        // Need to start - schedule it
        setTimeout(() => startBinarySearch(issues[currentIndex]), 0);
      }
      return null;
    }
    return [issues[currentIndex], sorted[binarySearch.mid]];
  })();
  
  // Compute progress
  const progress = {
    current: Math.min(currentIndex + 1, issues.length),
    total: issues.length,
  };
  
  // Compute max comparisons (n log n approximation)
  const maxComparisons = issues.length > 0 
    ? Math.ceil(issues.length * Math.log2(issues.length))
    : 0;
  
  return {
    currentPair,
    progress,
    handleChoice,
    sortedResult: isComplete ? sorted : null,
    isComplete,
    canSave: sorted.length > 0,
    canUndo: history.length > 0,
    handleUndo,
    handleRestart,
    isExpired: loadedSession !== null && !isSessionValid,
    maxComparisons,
  };
}

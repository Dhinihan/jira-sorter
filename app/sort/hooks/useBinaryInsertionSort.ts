'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
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

type SessionLoadResult = 
  | { status: 'valid'; session: StoredSession }
  | { status: 'expired' }
  | { status: 'not_found' };

const SESSION_EXPIRY_DAYS = 7;
const MAX_HISTORY_SIZE = 10;
const SESSION_ID_KEY = 'jira-sorter-current-session-id';

function generateSessionId(projectKey: string, issueCount: number): string {
  return `jira-sorter-${projectKey}-${issueCount}-${Date.now()}`;
}

function getOrCreateSessionId(projectKey: string, issueCount: number): string {
  if (typeof window === 'undefined') {
    return generateSessionId(projectKey, issueCount);
  }
  
  // Try to get existing session ID from storage
  const existingId = localStorage.getItem(SESSION_ID_KEY);
  if (existingId) {
    // Verify it matches current project/issues using string prefix check (no regex)
    const expectedPrefix = `jira-sorter-${projectKey}-${issueCount}-`;
    if (existingId.startsWith(expectedPrefix)) {
      return existingId;
    }
  }
  
  // Generate new ID and persist it
  const newId = generateSessionId(projectKey, issueCount);
  localStorage.setItem(SESSION_ID_KEY, newId);
  return newId;
}

function getCacheKey(key1: string, key2: string): string {
  return [key1, key2].sort().join(':');
}

function loadSession(sessionId: string | null): SessionLoadResult {
  if (!sessionId || typeof window === 'undefined') {
    return { status: 'not_found' };
  }
  
  try {
    const stored = localStorage.getItem(sessionId);
    if (!stored) return { status: 'not_found' };
    
    const session: StoredSession = JSON.parse(stored);
    
    // Check expiration
    const daysSince = (Date.now() - session.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSince > SESSION_EXPIRY_DAYS) {
      localStorage.removeItem(sessionId);
      return { status: 'expired' };
    }
    
    return { status: 'valid', session };
  } catch (e) {
    console.error('Failed to load session:', e);
    return { status: 'not_found' };
  }
}

export function useBinaryInsertionSort(
  issuesInput: JiraIssue[],
  projectKeyInput: string,
  sessionId?: string | null
) {
  // Input validation (use local variables to avoid mutating props)
  const issues = Array.isArray(issuesInput) ? issuesInput : [];
  if (!Array.isArray(issuesInput)) {
    console.warn('useBinaryInsertionSort: issues must be an array');
  }
  
  const projectKey = projectKeyInput && typeof projectKeyInput === 'string' && projectKeyInput.trim() !== '' 
    ? projectKeyInput 
    : 'unknown';
  if (!projectKeyInput || typeof projectKeyInput !== 'string' || projectKeyInput.trim() === '') {
    console.warn('useBinaryInsertionSort: projectKey must be a non-empty string');
  }
  
  // Check for duplicate issue keys
  const keySet = new Set<string>();
  const duplicates: string[] = [];
  issues.forEach(issue => {
    if (keySet.has(issue.key)) {
      duplicates.push(issue.key);
    } else {
      keySet.add(issue.key);
    }
  });
  if (duplicates.length > 0) {
    console.warn('useBinaryInsertionSort: duplicate issue keys found:', duplicates);
  }
  
  // Use provided sessionId, or get/create a stable one
  const effectiveSessionId = sessionId || getOrCreateSessionId(projectKey, issues.length);
  const loadResult = useMemo(() => loadSession(effectiveSessionId), [effectiveSessionId]);
  
  // Determine if session is valid and not expired
  const isExpired = loadResult.status === 'expired';
  const isSessionValid = loadResult.status === 'valid' && 
    loadResult.session.projectKey === projectKey;
  
  const loadedSession = isSessionValid ? loadResult.session : null;
  
  // Initialize state from session or defaults
  const [sorted, setSorted] = useState<JiraIssue[]>(() => 
    loadedSession ? loadedSession.sorted : []
  );
  const [currentIndex, setCurrentIndex] = useState(() => 
    loadedSession ? loadedSession.currentIndex : 0
  );
  const [binarySearch, setBinarySearch] = useState<BinarySearchState | null>(() => 
    loadedSession ? loadedSession.binarySearch : null
  );
  const [isComplete, setIsComplete] = useState(() => 
    loadedSession ? loadedSession.isComplete : false
  );
  
  // Cache as state (immutable updates)
  const [comparisonCache, setComparisonCache] = useState<Map<string, 'left' | 'right'>>(() => {
    const cache = new Map<string, 'left' | 'right'>();
    if (loadedSession) {
      loadedSession.comparisonCache.forEach(([key, value]) => {
        cache.set(key, value);
      });
    }
    return cache;
  });
  
  const [history, setHistory] = useState<HistoryState[]>(() => 
    loadedSession ? loadedSession.history : []
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
  
  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveToStorage();
    }
  }, [saveToStorage]);
  
  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToStorage();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveToStorage]);
  
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
    
    // Start fresh binary search
    const mid = Math.floor(sorted.length / 2);
    setBinarySearch({ low: 0, high: sorted.length - 1, mid });
  }, [sorted, issues.length]);
  
  // Auto-start binary search when needed (moved from render to useEffect)
  useEffect(() => {
    if (isComplete || currentIndex >= issues.length || binarySearch) return;
    
    const timer = setTimeout(() => {
      startBinarySearch(issues[currentIndex]);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [isComplete, currentIndex, issues, binarySearch, startBinarySearch]);
  
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
    
    // Cache this comparison (immutable update)
    const cacheKey = getCacheKey(currentIssue.key, comparedIssue.key);
    setComparisonCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cacheKey, choice);
      return newCache;
    });
    
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
  }, [binarySearch, currentIndex, issues, sorted]);
  
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
    setComparisonCache(new Map());
    if (typeof window !== 'undefined') {
      localStorage.removeItem(effectiveSessionId);
      localStorage.removeItem(SESSION_ID_KEY);
    }
  }, [effectiveSessionId]);
  
  // Compute current pair for comparison (pure computation, no side effects)
  const currentPair: [JiraIssue, JiraIssue] | null = 
    !isComplete && currentIndex < issues.length && binarySearch
      ? [issues[currentIndex], sorted[binarySearch.mid]]
      : null;
  
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
    isExpired,
    maxComparisons,
  };
}

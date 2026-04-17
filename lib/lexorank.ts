// LexoRank generation utilities
// Jira uses LexoRank for issue ordering in the backlog
// Format: "0|i0000n:0000000000" where the last part varies

const RANK_PREFIX = "0|i007ap:";

/**
 * Generate initial ranks for a sorted list of issues
 * Creates evenly spaced rank values from top to bottom
 */
export function generateInitialRanks(count: number): string[] {
  if (count === 0) return [];
  if (count === 1) return [`${RANK_PREFIX}0000000000`];
  
  const ranks: string[] = [];
  const baseValue = 0x10000000000; // Large base to create spacing
  const step = Math.floor(baseValue / (count + 1));
  
  for (let i = 1; i <= count; i++) {
    const value = i * step;
    ranks.push(`${RANK_PREFIX}${value.toString(36).padStart(10, '0')}`);
  }
  
  return ranks;
}

/**
 * Generate a rank between two existing ranks
 * Used when inserting between two issues
 */
export function generateRankBetween(prevRank: string | null, nextRank: string | null): string {
  // If no previous, generate something before next
  if (!prevRank && nextRank) {
    const nextValue = parseRankValue(nextRank);
    const newValue = Math.floor(nextValue / 2);
    return `${RANK_PREFIX}${newValue.toString(36).padStart(10, '0')}`;
  }
  
  // If no next, generate something after previous
  if (prevRank && !nextRank) {
    const prevValue = parseRankValue(prevRank);
    const newValue = prevValue + 0x100000000; // Add spacing
    return `${RANK_PREFIX}${newValue.toString(36).padStart(10, '0')}`;
  }
  
  // If both exist, find midpoint
  if (prevRank && nextRank) {
    const prevValue = parseRankValue(prevRank);
    const nextValue = parseRankValue(nextRank);
    const midValue = Math.floor((prevValue + nextValue) / 2);
    return `${RANK_PREFIX}${midValue.toString(36).padStart(10, '0')}`;
  }
  
  // Default (shouldn't happen in normal flow)
  return `${RANK_PREFIX}0000000000`;
}

/**
 * Parse the numeric value from a LexoRank string
 */
function parseRankValue(rank: string): number {
  const match = rank.match(/:([a-z0-9]+)$/i);
  if (!match) return 0;
  return parseInt(match[1], 36);
}

/**
 * Generate ranks for a list of issues in order
 * This is the main function used by the sort page
 */
export function generateRanksForSortedIssues(issueKeys: string[]): Array<{ key: string; newRank: string }> {
  const ranks = generateInitialRanks(issueKeys.length);
  
  return issueKeys.map((key, index) => ({
    key,
    newRank: ranks[index],
  }));
}

// Rank generation utilities for Jira Agile API
// Jira's /rest/agile/1.0/issue/rank API uses issue keys for relative positioning

export interface RankInput {
  key: string;
  // rankAfterKey: chave da issue que deve vir ANTES desta na ordenação
  // null significa: colocar no topo (primeira da lista)
  rankAfterKey: string | null;
}

/**
 * Generate rank inputs for a list of issues in sorted order
 * 
 * For a sorted list [A, B, C, D, E], returns:
 * - A: rankAfterKey = null (goes to top)
 * - B: rankAfterKey = A (goes after A)
 * - C: rankAfterKey = B (goes after B)
 * - D: rankAfterKey = C (goes after C)
 * - E: rankAfterKey = D (goes after D)
 * 
 * This format is used by the Jira Agile rank API (/rest/agile/1.0/issue/rank)
 */
export function generateRanksForSortedIssues(issueKeys: string[]): RankInput[] {
  if (issueKeys.length === 0) return [];
  
  // Fail-fast validation for empty/whitespace keys
  if (issueKeys.some(k => !k || !k.trim())) {
    throw new Error("Invalid issueKeys: contains empty or whitespace keys");
  }
  
  // Fail-fast validation for duplicate keys
  if (new Set(issueKeys).size !== issueKeys.length) {
    throw new Error("Invalid issueKeys: contains duplicate keys");
  }
  
  return issueKeys.map((key, index) => ({
    key,
    // A primeira issue vai para o topo (rankAfterKey = null)
    // As demais vão após a issue anterior na lista
    rankAfterKey: index === 0 ? null : issueKeys[index - 1],
  }));
}

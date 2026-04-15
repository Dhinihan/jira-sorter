/**
 * Get Tailwind CSS classes for status badge based on issue status
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('done') || statusLower.includes('closed')) {
    return 'bg-green-100 text-green-800';
  } else if (statusLower.includes('progress')) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
}

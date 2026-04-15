'use client';

import { JiraIssue } from '@/app/actions/jira';

interface IssueCardProps {
  issue: JiraIssue;
  onSelect: () => void;
  side: 'left' | 'right';
  jiraDomain: string;
}

function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('done') || statusLower.includes('closed')) {
    return 'bg-green-100 text-green-800';
  } else if (statusLower.includes('progress')) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
}

export function IssueCard({ issue, onSelect, side, jiraDomain }: IssueCardProps) {
  const buttonText = side === 'left' 
    ? '← Esta é mais importante' 
    : 'Esta é mais importante →';

  return (
    <div className="flex flex-col h-full">
      {/* Card */}
      <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        {/* Issue Key with Link */}
        <div className="mb-4">
          <a
            href={`https://${jiraDomain}.atlassian.net/browse/${issue.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {issue.key}
          </a>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-3">
          {issue.summary}
        </h3>

        {/* Status Badge */}
        <div className="mb-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(issue.status)}`}>
            {issue.status}
          </span>
        </div>

        {/* Epic */}
        {issue.epicKey && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Épico:</span>{' '}
            <a
              href={`https://${jiraDomain}.atlassian.net/browse/${issue.epicKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {issue.epicName || issue.epicKey}
            </a>
          </div>
        )}
      </div>

      {/* Selection Button */}
      <button
        onClick={onSelect}
        className={`mt-4 w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
          side === 'left'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}

import React from 'react';

interface DataQualityBadgeProps {
  dataQuality?: {
    isGrounded: boolean;
    confidence: 'high' | 'medium' | 'low';
    sourceCount?: number;
    groundingQuality?: string;
  };
  groundingLinks: Array<{ title: string; url: string }>;
}

export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({ 
  dataQuality, 
  groundingLinks 
}) => {
  if (!dataQuality) return null;

  const { isGrounded, confidence, sourceCount, groundingQuality } = dataQuality;

  // Determine badge styling based on confidence
  const getBadgeStyle = () => {
    switch (confidence) {
      case 'high':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          icon: '✓'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          icon: '⚠'
        };
      case 'low':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          border: 'border-orange-300',
          icon: '!'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          icon: 'i'
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className={`${style.bg} ${style.text} border ${style.border} rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{style.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Data Quality: {groundingQuality || 'Unknown'}</h3>
          
          {isGrounded ? (
            <div className="text-sm space-y-1">
              <p>
                ✓ This analysis is based on <strong>{sourceCount || 0} real-time web sources</strong> 
                {sourceCount && sourceCount >= 5 ? ' (excellent coverage)' : 
                 sourceCount && sourceCount >= 2 ? ' (good coverage)' : 
                 ' (limited coverage)'}
              </p>
              
              {groundingLinks.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium hover:underline">
                    View {groundingLinks.length} sources
                  </summary>
                  <ul className="mt-2 ml-4 space-y-1">
                    {groundingLinks.map((link, idx) => (
                      <li key={idx}>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {idx + 1}. {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ) : (
            <div className="text-sm">
              <p>
                ⚠ This analysis is AI-generated and may not be grounded in current job market data.
                Please verify information with official sources like Seek.co.nz or TradeMe Jobs.
              </p>
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t border-current/20">
            <p className="text-xs opacity-75">
              <strong>Reliability Guide:</strong><br/>
              • Salary ranges & demand scores: {isGrounded && sourceCount && sourceCount >= 3 ? 'High reliability' : 'Use as estimates only'}<br/>
              • Interview questions: AI-generated practice material<br/>
              • Career suggestions: General guidance, not personalized advice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
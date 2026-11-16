import React from 'react';

interface PinarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightText?: boolean;
}

export const PinarLogo: React.FC<PinarLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  lightText = false,
}) => {
  const sizeMap = {
    sm: { icon: 34, title: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 42, title: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 54, title: 'text-lg', sub: 'text-xs' },
    xl: { icon: 72, title: 'text-2xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Emblem Vector */}
      <div 
        className="relative shrink-0 rounded-full shadow-sm overflow-hidden border border-emerald-800/20 bg-white"
        style={{ width: dim.icon, height: dim.icon }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle in pale mint */}
          <circle cx="100" cy="100" r="98" fill="#F0FDF4" />
          
          {/* Outer ring in fresh river cyan */}
          <circle cx="100" cy="100" r="96" fill="none" stroke="#0284C7" strokeWidth="5" />

          {/* Rolling mountain hill in lime grass green */}
          <path
            d="M 12 115 Q 60 70, 115 50 Q 165 40, 188 115 Q 160 170, 100 178 Q 40 170, 12 115 Z"
            fill="#84CC16"
            stroke="#14532D"
            strokeWidth="3"
          />

          {/* PR Letters in playful cyan/river blue */}
          <g fill="#0284C7" stroke="#0284C7" strokeWidth="1">
            {/* P */}
            <path
              d="M 40 45 C 40 40, 52 35, 68 35 C 80 35, 88 42, 88 52 C 88 62, 78 68, 65 68 L 52 68 L 52 85 C 52 87, 48 88, 44 88 C 40 88, 40 85, 40 82 Z M 52 45 L 52 58 L 65 58 C 72 58, 76 54, 76 50 C 76 46, 72 45, 65 45 Z"
            />
            {/* R */}
            <path
              d="M 85 45 C 85 39, 98 34, 112 34 C 124 34, 132 41, 132 50 C 132 59, 124 64, 115 66 L 132 86 C 133 88, 130 90, 125 90 C 121 90, 118 88, 115 84 L 100 66 L 97 66 L 97 86 C 97 88, 93 89, 89 89 C 85 89, 85 86, 85 83 Z M 97 44 L 97 57 L 110 57 C 117 57, 120 54, 120 49 C 120 45, 116 44, 109 44 Z"
            />
          </g>

          {/* Three White Pine Trees with Forest Green Outline */}
          {/* Tree 1: Left */}
          <path
            d="M 75 75 L 85 92 L 78 92 L 92 112 L 84 112 L 98 135 L 68 135 L 74 112 L 64 112 L 76 92 L 68 92 Z"
            fill="#FFFFFF"
            stroke="#14532D"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Tree 2: Center */}
          <path
            d="M 108 85 L 118 100 L 112 100 L 124 118 L 117 118 L 130 140 L 102 140 L 108 118 L 99 118 L 110 100 L 103 100 Z"
            fill="#FFFFFF"
            stroke="#14532D"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Tree 3: Right (Tallest) */}
          <path
            d="M 140 60 L 152 78 L 144 78 L 160 100 L 150 100 L 168 126 L 132 126 L 140 100 L 130 100 L 142 78 L 134 78 Z"
            fill="#FFFFFF"
            stroke="#14532D"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* River Waves (Double Cyan Streams) */}
          <path
            d="M 22 128 C 50 120, 85 136, 125 125 C 155 116, 175 124, 185 128"
            fill="none"
            stroke="#0284C7"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 30 142 C 55 135, 90 149, 130 138 C 160 129, 175 137, 182 140"
            fill="none"
            stroke="#0284C7"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 50 156 C 75 150, 105 162, 135 152 C 155 146, 168 152, 175 155"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-extrabold tracking-tight ${dim.title} ${
              lightText ? 'text-white' : 'text-slate-900'
            }`}
          >
            PINAR DEL RÍO
          </span>
          <span
            className={`font-semibold uppercase tracking-wider ${dim.sub} ${
              lightText ? 'text-emerald-200' : 'text-emerald-700'
            }`}
          >
            Residencial & Condominio
          </span>
        </div>
      )}
    </div>
  );
};

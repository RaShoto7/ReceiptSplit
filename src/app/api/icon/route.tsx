import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const size = parseInt(searchParams.get('size') || '192', 10);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          borderRadius: size * 0.22,
        }}
      >
        <svg
          width={size * 0.65}
          height={size * 0.65}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circular border - gold arc (left) */}
          <path
            d="M 100 15 A 85 85 0 0 0 100 185"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Circular border - white arc (right) */}
          <path
            d="M 100 185 A 85 85 0 0 0 100 15"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Left person (gold) */}
          <circle cx="70" cy="52" r="10" fill="#fbbf24" />
          <path d="M 56 76 Q 56 62 70 62 Q 84 62 84 76" fill="#fbbf24" />

          {/* Center person (white, slightly higher) */}
          <circle cx="100" cy="46" r="11" fill="white" />
          <path d="M 84 72 Q 84 56 100 56 Q 116 56 116 72" fill="white" />

          {/* Right person (white) */}
          <circle cx="130" cy="52" r="10" fill="white" />
          <path d="M 116 76 Q 116 62 130 62 Q 144 62 144 76" fill="white" />

          {/* Left receipt (white) */}
          <g transform="translate(50, 80)">
            <path
              d="M 0 0 L 50 0 L 50 72 L 45 67 L 40 72 L 35 67 L 30 72 L 25 67 L 20 72 L 15 67 L 10 72 L 5 67 L 0 72 Z"
              fill="white"
              stroke="#fbbf24"
              strokeWidth="3"
            />
            <line x1="10" y1="14" x2="40" y2="14" stroke="#fbbf24" strokeWidth="3" />
            <line x1="10" y1="26" x2="36" y2="26" stroke="#e5e7eb" strokeWidth="2" />
            <line x1="10" y1="36" x2="32" y2="36" stroke="#e5e7eb" strokeWidth="2" />
            <path
              d="M 16 48 L 22 54 L 36 40"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Right receipt (overlapping) */}
          <g transform="translate(90, 84)">
            <path
              d="M 0 0 L 54 0 L 54 76 L 49 71 L 44 76 L 39 71 L 34 76 L 29 71 L 24 76 L 19 71 L 14 76 L 9 71 L 4 76 L 0 74 Z"
              fill="white"
              stroke="#1e40af"
              strokeWidth="3"
            />
            <line x1="10" y1="14" x2="44" y2="14" stroke="#1e40af" strokeWidth="3" />
            <line x1="10" y1="26" x2="40" y2="26" stroke="#e5e7eb" strokeWidth="2" />
            <line x1="10" y1="36" x2="36" y2="36" stroke="#e5e7eb" strokeWidth="2" />
            <line x1="10" y1="46" x2="30" y2="46" stroke="#e5e7eb" strokeWidth="2" />
            <path
              d="M 18 58 L 24 64 L 40 48"
              fill="none"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}

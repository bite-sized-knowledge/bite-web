import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'BITE - 한입 크기 기술 지식';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: '#6c5ce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              fontWeight: 800,
              color: 'white',
              marginRight: 20,
            }}
          >
            B
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-2px',
            }}
          >
            BITE
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#a0a0b0',
            marginBottom: 16,
          }}
        >
          한입 크기 기술 지식
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#707080',
          }}
        >
          매일 한입 크기로 읽는 기술 블로그 큐레이션
        </div>
      </div>
    ),
    { ...size },
  );
}

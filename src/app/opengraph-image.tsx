import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'BITE - 한입 크기 기술 지식';

export default async function OgImage() {
  const logoData = await readFile(join(process.cwd(), 'public', 'logo.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

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
        <img
          src={logoSrc}
          width={160}
          height={160}
          style={{ borderRadius: 32, marginBottom: 32 }}
        />
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-2px',
            marginBottom: 16,
          }}
        >
          BITE
        </div>
        <div
          style={{
            fontSize: 30,
            color: '#a0a0b0',
            marginBottom: 12,
          }}
        >
          한입 크기 기술 지식
        </div>
        <div
          style={{
            fontSize: 20,
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

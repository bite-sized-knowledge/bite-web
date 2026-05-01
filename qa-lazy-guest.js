#!/usr/bin/env node
// L7 회귀 — lazy guest 발급 + X-Device-Id/X-Guest-Token 흐름 검증.
// dev 환경 (bite-api-dev:8081, bite-web-dev:3001) 기준.

const API = process.env.QA_API ?? 'http://127.0.0.1:8081/v1';
const ARTICLE_ID = process.env.QA_ARTICLE_ID ?? 'sRUZCgM2cqeegI8D6C60AqexsuN';
// dev API origin: dev.bite-sized.xyz (운영 환경의 실제 origin).
// localhost는 APP_ENV=local일 때만 origin list에 들어가서, dev 컨테이너에선 차단됨.
const ORIGIN = process.env.QA_ORIGIN ?? 'https://dev.bite-sized.xyz';

// JWT는 base64url 인코딩 — Node 16+ Buffer가 'base64url'을 지원함.
const decodeJwtPayload = (jwt) =>
  JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());

const results = [];
const fail = (label, msg) => results.push({ ok: false, label, msg });
const pass = (label, msg) => results.push({ ok: true, label, msg: msg ?? '' });

const uuid = () => crypto.randomUUID();

async function run() {
  // 1. CORS preflight: X-Device-Id allow + X-Guest-Token expose
  {
    const r = await fetch(`${API}/articles/${ARTICLE_ID}/likes`, {
      method: 'OPTIONS',
      headers: {
        Origin: ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'x-device-id,authorization,content-type',
      },
    });
    const allow = (r.headers.get('access-control-allow-headers') || '').toLowerCase();
    if (!allow.includes('x-device-id')) fail('CORS allow X-Device-Id', `actual: ${allow}`);
    else pass('CORS allow X-Device-Id');
    // expose-headers는 preflight가 아니라 실제 요청 응답에서 검사 (#2.1).
  }

  // 2. 비로그인 like with X-Device-Id → X-Guest-Token 발급 + 200 + expose 헤더
  const did1 = uuid();
  let issuedToken = null;
  {
    const r = await fetch(`${API}/articles/${ARTICLE_ID}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Id': did1, Origin: ORIGIN },
    });
    const tok = r.headers.get('x-guest-token');
    const expose = (r.headers.get('access-control-expose-headers') || '').toLowerCase();
    if (r.status !== 200) fail('anon like → 200', `status: ${r.status}`);
    else if (!tok) fail('X-Guest-Token 헤더 발급', '없음');
    else {
      pass('anon like → 200 + X-Guest-Token');
      issuedToken = tok;
    }
    if (!expose.includes('x-guest-token')) fail('CORS expose X-Guest-Token (실제 응답)', `actual: ${expose}`);
    else pass('CORS expose X-Guest-Token (실제 응답)');
  }

  // 3. 같은 device_id 재시도 → 같은 member_id (멱등성)
  let firstMemberId = null;
  let secondMemberId = null;
  if (issuedToken) {
    // JWT payload 까서 member_id 비교
    const payload = decodeJwtPayload(issuedToken);
    firstMemberId = payload.id;
    const r2 = await fetch(`${API}/articles/${ARTICLE_ID}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Id': did1, Origin: ORIGIN },
    });
    const tok2 = r2.headers.get('x-guest-token');
    if (!tok2) fail('동일 device_id 재발급', 'X-Guest-Token 없음');
    else {
      const p2 = decodeJwtPayload(tok2);
      secondMemberId = p2.id;
      if (firstMemberId === secondMemberId) pass('동일 device_id 멱등 (member_id 동일)', `${firstMemberId}`);
      else fail('동일 device_id 멱등', `1st=${firstMemberId} 2nd=${secondMemberId}`);
    }
  }

  // 4. 발급 토큰을 Bearer로 → X-Guest-Token 미반환 (LazyGuest 통과)
  if (issuedToken) {
    const r = await fetch(`${API}/articles/${ARTICLE_ID}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${issuedToken}`,
        'X-Device-Id': did1,
      },
    });
    const tok = r.headers.get('x-guest-token');
    if (r.status !== 200) fail('Bearer로 like', `status: ${r.status}`);
    else if (tok) fail('Bearer 사용 시 X-Guest-Token 미반환', `발급됨: ${tok.slice(0, 20)}...`);
    else pass('Bearer 사용 시 X-Guest-Token 미반환');
  }

  // 5. device_id 없이 비로그인 like → 401
  {
    const r = await fetch(`${API}/articles/${ARTICLE_ID}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (r.status !== 401) fail('헤더 없는 anon like → 401', `status: ${r.status}`);
    else pass('헤더 없는 anon like → 401');
  }

  // 6. invalid UUID → 401
  {
    const r = await fetch(`${API}/articles/${ARTICLE_ID}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Id': 'not-a-uuid' },
    });
    if (r.status !== 401) fail('invalid X-Device-Id → 401', `status: ${r.status}`);
    else pass('invalid X-Device-Id → 401');
  }

  // 7. (skip — dev DB에 일반 멤버 계정 없음. lazy guest 토큰 Bearer 흐름이 이미 #4에서 검증됨)

  // 8. 비로그인 feed (recsys → device_id forward).
  //   recsys 추천이 stub(random)이라 응답 자체로는 forward 여부를 구분할 수 없음.
  //   200 + 배열 형태면 OK. 실제 forward는 #2 (anon like) 흐름에서 검증됨.
  {
    const did2 = uuid();
    const r = await fetch(`${API}/feed`, {
      method: 'GET',
      headers: { 'X-Device-Id': did2 },
    });
    if (r.status !== 200) fail('anon feed → 200', `status: ${r.status}`);
    else {
      const j = await r.json();
      if (!j.success || !Array.isArray(j.result)) fail('anon feed 응답 구조', JSON.stringify(j).slice(0, 100));
      else pass('anon feed → 200', `${j.result.length} items`);
    }
  }

  // 9. invalid UUID로 feed → 200 (현재 비로그인 fallback이 random recent여서 OK)
  //    재현: device_id 검증은 lazy 발급 endpoint 한정
  // (참고용 — feed 자체는 LazyGuest 안 끼워 넣었음)

  // 결과 요약
  const ok = results.filter(r => r.ok).length;
  const ng = results.filter(r => !r.ok).length;
  console.log(`\n=== L7 회귀 결과: ${ok} pass / ${ng} fail ===\n`);
  for (const r of results) {
    console.log(`${r.ok ? '✓' : '✗'} ${r.label}${r.msg ? ' — ' + r.msg : ''}`);
  }
  process.exit(ng === 0 ? 0 : 1);
}

run().catch(e => { console.error(e); process.exit(2); });

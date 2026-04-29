"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("[bite-web] root error:", error);
    }
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          background: "#FAFAFA",
          color: "#171717",
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <p
            style={{
              fontSize: 56,
              lineHeight: 1,
              margin: 0,
              fontWeight: 700,
              color: "#FF6E1C",
            }}
          >
            BITE
          </p>
          <h1
            style={{
              marginTop: 24,
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            화면을 불러오지 못했어요
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "#9F9F9F",
            }}
          >
            새로고침하면 대부분 해결돼요.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: 12,
                fontSize: 11,
                color: "#9F9F9F",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              ref: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 32,
              height: 48,
              padding: "0 32px",
              borderRadius: 999,
              border: "none",
              background: "#FF6E1C",
              color: "#fff",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            새로고침
          </button>
        </div>
      </body>
    </html>
  );
}

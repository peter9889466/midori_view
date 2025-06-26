# MidoriView

MidoriView는 데이터 시각화 및 분석을 위한 종합 대시보드 웹 애플리케이션입니다.

## 기술 스택

-   **Frontend**: React 18 + TypeScript + Vite
-   **Routing**: React Router DOM
-   **Styling**: Tailwind CSS
-   **UI Components**: Custom components with Radix UI primitives
-   **Icons**: Lucide React
-   **Language**: TypeScript

## 프로젝트 구조

\`\`\`
midoriview-front/
├── public/
├── src/
│ ├── assets/
│ ├── components/
│ │ ├── ui/
│ │ │ ├── button.tsx
│ │ │ ├── card.tsx
│ │ │ └── badge.tsx
│ │ ├── header.tsx
│ │ └── logo.tsx
│ ├── lib/
│ │ └── utils.ts
│ ├── pages/
│ │ ├── error/
│ │ │ ├── ErrorFallback.tsx
│ │ │ └── Page404.tsx
│ │ ├── graphs/
│ │ │ └── GraphsPage.tsx
│ │ ├── home/
│ │ │ └── HomePage.tsx
│ │ └── rankings/
│ │ └── RankingsPage.tsx
│ ├── App.css
│ ├── App.tsx
│ ├── index.css
│ └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.js
└── README.md
\`\`\`

## 설치 및 실행

1. 의존성 설치:
   \`\`\`bash
   npm install
   \`\`\`

2. 개발 서버 실행:
   \`\`\`bash
   npm run dev
   \`\`\`

3. 타입 체크 및 빌드:
   \`\`\`bash
   npm run build
   \`\`\`

## 주요 기능

-   **메인 페이지**: 대시보드 개요 및 주요 기능 소개
-   **그래프 페이지**: 데이터 시각화 도구 및 차트
-   **순위 페이지**: 성과 지표 및 순위 시스템
-   **타입 안전성**: TypeScript로 완전한 타입 안전성 보장
-   **반응형 디자인**: 모바일 및 데스크톱 지원
-   **에러 처리**: 404 페이지 및 에러 바운더리
-   **한국어 지원**: 완전한 한국어 인터페이스

## 라우팅

-   `/` - 홈페이지
-   `/graphs` - 그래프 페이지
-   `/rankings` - 순위 페이지
-   `*` - 404 에러 페이지

## 브랜드 컬러

메인 브랜드 컬러: `#9AD970` (연한 녹색)

## TypeScript 설정

이 프로젝트는 엄격한 TypeScript 설정을 사용합니다:

-   Strict mode 활성화
-   사용하지 않는 변수/매개변수 검사
-   완전한 타입 안전성
-   Path mapping (`@/*` 별칭)

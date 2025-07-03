# GraphPage 구조

GraphPage는 무역 데이터를 시각화하는 페이지로, 유지보수성을 위해 여러 파일로 분할되어 있습니다.

## 파일 구조

```
graphs/
├── GraphPage.tsx          # 메인 페이지 컴포넌트
├── types.ts              # 타입 정의
├── constants.ts          # 상수 정의
├── utils.ts              # 유틸리티 함수들
├── api.ts                # API 관련 함수들
├── components/           # UI 컴포넌트들
│   ├── index.ts         # 컴포넌트 export
│   ├── ChartControls.tsx    # 차트 컨트롤 패널
│   ├── DataSummary.tsx      # 데이터 요약 카드
│   ├── CountryMapSection.tsx # 지도 섹션
│   ├── ChartSection.tsx     # 차트 섹션
│   ├── LoadingState.tsx     # 로딩 상태
│   └── ErrorState.tsx       # 에러 상태
└── README.md            # 이 파일
```

## 각 파일의 역할

### GraphPage.tsx
- 메인 페이지 컴포넌트
- 상태 관리 (차트 타입, 국가, 년도, API 데이터 등)
- API 데이터 로드 로직
- 전체 레이아웃 구성

### types.ts
- `ApiTradeData`: API에서 받아오는 무역 데이터 타입
- `ChartType`: 차트 타입 정의
- `HsCodeInfo`: HS 코드 정보 타입

### constants.ts
- 차트 타입 정의 (`chartTypes`)
- 기본 국가 목록 (`DEFAULT_COUNTRIES`)
- 국가 코드 매핑 (`countryCodeMap`)
- HS 코드 매핑 (`hsCodeMap`)
- 제품 설명 데이터 (`productDescriptions`)
- 차트 옵션 설정 (`chartOptions`, `mixedChartOptions`)

### utils.ts
- `formatNumber`: 숫자 포맷팅 함수
- `generateChartData`: 차트 데이터 생성 함수
- `generateBarData`: 막대 차트 데이터 생성
- `generateLineData`: 선 차트 데이터 생성
- `generateMixedData`: 혼합 차트 데이터 생성

### api.ts
- `fetchTradeDataByHsCode`: HS 코드별 무역 데이터 API 호출 함수

### components/
- **ChartControls.tsx**: 차트 타입 선택, 국가/년도 선택 컨트롤
- **DataSummary.tsx**: 수출입액 요약 정보와 PDF 다운로드 버튼
- **CountryMapSection.tsx**: 국가별 데이터 맵 섹션
- **ChartSection.tsx**: 차트 표시 섹션 (DataSummary와 차트 포함)
- **LoadingState.tsx**: 로딩 상태 표시
- **ErrorState.tsx**: 에러 상태 표시

## 사용법

```tsx
import GraphPage from './pages/graphs/GraphPage';

// URL 파라미터로 HS 코드를 받아서 사용
// 예: /graphs/850760
```

## 유지보수 가이드

1. **새로운 차트 타입 추가**: `constants.ts`의 `chartTypes` 배열에 추가
2. **새로운 국가 추가**: `constants.ts`의 `DEFAULT_COUNTRIES`와 `countryCodeMap`에 추가
3. **새로운 HS 코드 추가**: `constants.ts`의 `hsCodeMap`과 `productDescriptions`에 추가
4. **UI 변경**: 해당하는 컴포넌트 파일을 수정
5. **API 로직 변경**: `api.ts` 파일을 수정
6. **차트 데이터 처리 변경**: `utils.ts` 파일을 수정

## 장점

- **모듈화**: 각 기능이 독립적인 파일로 분리되어 있어 유지보수가 용이
- **재사용성**: 컴포넌트들이 독립적으로 분리되어 있어 다른 곳에서도 재사용 가능
- **가독성**: 파일 크기가 작아져서 코드 이해가 쉬움
- **테스트 용이성**: 각 모듈을 독립적으로 테스트할 수 있음
- **협업**: 여러 개발자가 동시에 다른 파일을 작업할 수 있음 
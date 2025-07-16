# 🌱 Midori View (Team:네잎클로버)

<img width="1919" height="918" alt="미도리뷰_메인 " src="https://github.com/user-attachments/assets/1e6572a6-233c-4d7e-87cf-1a1c1c17c89f" />

## 💡 서비스 소개
**Midori View** : 관세청 공공데이터 API를 활용하여 친환경 제품의 수출입 통계를 시각화하고 분석하는 플랫폼
- 서비스 설명
  - 특정 품목(친환경 제품)에 집중한 수출입 통계 데이터 분석을 제공
  - 테마 기반 분류와 복합 대시보드를 이용해 직관적인 그래프와 지도 시각화를 통해 빠른 정보 흡수 가능
  - AI 챗봇을 통한 자연어 기반 질의응답과 세부 리포트 습득 가능
 
## 🗓️ 프로젝트 기간
**2025.06.02~2025.07.08**

## ✨ 주요 기능
<img width="565" height="461" alt="image" src="https://github.com/user-attachments/assets/98c7020e-0775-424f-a6fd-117cbee463cb" />

### 🏆 친환경 무역 순위
- 월별 친환경 인증 제품 수출입 순위 제공
- 국가별, 기간별, 카테고리별 맞춤형 필터링
- 수입별, 수출별, 수출입별 정렬 기능
### 📈 수출입 통계 대시보드
- 직관적인 막대 그래프와 꺾인선 그래프로 한눈에 파악
- 국가별 교역량 지도 기반 시각화
- 전년 동기 대비 증감률 등 시계열 데이터 분석
- 맞춤형 필터 (품목, 국가, 기간 조합)
### 🤖 통계 기반 질의응답 AI 챗봇
- 자연어 쿼리 처리
- 시장 동향 및 기회 분석
- 시각화 자료를 보충하는 텍스트 기반 응답

## 🛠️ 기술 스택
### Frontend
- **React** 
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Java** 
- **Spring Boot** 
- **MySQL**
- **Python** 
- **FastAPI**

### 외부 API
- **관세청 공공데이터 API** 
- **OpenAI API** 

### 개발 도구
- **IDE**: Visual Studio Code, STS, Cursor
- **Collaboration**: GitHub, Notion

## 유스케이스 다이어그램
<img width="799" height="610" alt="image" src="https://github.com/user-attachments/assets/0f16eca8-dc9c-425f-8e70-23061f86ded7" />

## 서비스 흐름도
<img width="1290" height="770" alt="KakaoTalk_20250618_142800723" src="https://github.com/user-attachments/assets/88a6ce85-144f-4879-afda-fd1310190c8b" />

## 🖥️ 화면 구성
### 메인 페이지
<img width="1919" height="918" alt="미도리뷰_메인 " src="https://github.com/user-attachments/assets/7258834d-963e-461c-bfb9-451363d97fdd" />
<img width="1166" height="573" alt="미도리뷰_메인2" src="https://github.com/user-attachments/assets/5002e304-8b1f-4184-9ffe-075d58f0c024" />

### 순위 페이지
<img width="1218" height="801" alt="무역순위_테마필터링" src="https://github.com/user-attachments/assets/b836f210-7c40-4088-ac2e-9a1b83b18df1" />

### 대시보드
<img width="1215" height="495" alt="그래프_상단 지도" src="https://github.com/user-attachments/assets/b2c593a4-f523-479e-afef-b87981d0525c" />
<img width="1217" height="522" alt="그래프_그래프" src="https://github.com/user-attachments/assets/5da2bf8d-c7c0-4d0e-99f7-3bec80063caa" />

### PDF 보고서
<img width="915" height="664" alt="pdf" src="https://github.com/user-attachments/assets/6da29953-d376-4243-9f54-95e367240849" />

### 뉴스 페이지
<img width="1219" height="844" alt="환경 뉴스" src="https://github.com/user-attachments/assets/2afb5120-a995-4933-920d-41697c114bd1" />

### 챗봇 
<img width="319" height="497" alt="챗봇_챗봇 인사" src="https://github.com/user-attachments/assets/75413d68-741f-41c3-9464-641cd425816e" />
<img width="321" height="494" alt="챗봇_챗봇 답변작성중" src="https://github.com/user-attachments/assets/245f99b3-4e02-4344-8c48-428518b4eff2" />
<img width="320" height="427" alt="챗봇_답변완료" src="https://github.com/user-attachments/assets/22190669-da74-4ec3-b502-d4a2f29d8fa0" />

## 🎦 시연 영상
[![Video Label](http://img.youtube.com/vi/VX0kKITzhjc/0.jpg)](https://youtu.be/VX0kKITzhjc)

## 👥 팀원 소개

### 김다원 (PM, Backend)
- AI 챗봇 구조설계 및 튜닝
- 관세청 데이터 호출 및 응답 데이터 전처리
- 프로젝트 관리 및 전체 설계

### 김승혁 (Frontend)
- UI/UX 설계 및 전체 화면 구성
- 사용자 인터페이스 개발
- 프론트엔드 아키텍처 설계

### 홍준모 (Backend)
- 데이터베이스 및 실시간 순위 응답 서버 구축
- PDF 서비스 설계 및 구현
- 백엔드 API 개발

## 💣 트러블 슈팅
- 문제 1 : API에서 받아온 데이터에 이상 발생
  - yyyy.10월이 yyyy.1로 표현되는 오류 발생
  - 해결 : year에 해당하는 값을 따로 필터링해서 변수에 삽입 이후 10진법으로 변환
  - 다른 데이터와 변수 길이가 다를 경우에만 10으로 값을 바꿔넣는다
- 문제 2 : 네이버 클라우드 배포 문제
  - 클라우드상에서 배포를 하려 했으나 백엔드와 프론트엔드, 서버간에 통신을 하지 않음
  - 해결 : 인바운드 규칙에서 오류가 있어 체크 이후 해결
- 문제 3 : 챗봇 프롬프트 처리
  - 챗봇에게 프롬프트로 전송해야하는 데이터의 양이 너무 크고 방대해 한번에 넘길 수가 없음
  - 특정 정보 몇가지만 골라내라고 해봐야 데이터 전체에 비하면 너무 적은 양이라 제대로 된 답변을 주지 않음
  - 해결 : 전처리로 사전에 미리 예상 질문을 골라 csv 파일을 만든 후 RAG 구조로 자연어 쿼리 처리

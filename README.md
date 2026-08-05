# skala-exercise-vue

## 프로젝트 소개

Vue 3 + Vite 기반의 전국 날씨 대시보드 프로젝트입니다.

OpenWeather API를 활용하여 전국 17개 지역의 현재 날씨를 조회하고,
판교 5일 예보, 기온 차트, 전국 지도, 판교역 그늘 예측 데모 기능을 제공합니다.

---

# 핵심 구현 기능

- 전국 17개 지역 현재 날씨 조회
- 지역 검색 기능 (`computed`)
- 전국 평균 기온 / 최고·최저 지역 계산
- 카드 보기 / 지도 보기 전환
- Leaflet 기반 전국 지도
- 지역 상세 페이지
- 판교 5일 예보
- Chart.js 기온 차트
- 섭씨 / 화씨 단위 변경
- 판교역 예상 그늘 데모 (SunCalc)

---

# 사용 기술

## Frontend

- Vue 3
- Vite
- JavaScript
- Composition API

## State

- Pinia

## Routing

- Vue Router

## API

- Axios
- OpenWeather API

## UI

- Element Plus

## Visualization

- Chart.js
- Leaflet
- OpenStreetMap
- SunCalc

## Deploy

- Vercel

---

# 실행 방법

## 프로젝트 설치

```bash
git clone https://github.com/Jieun1ee/skala-vue.git
cd skala-vue
npm install
```

의존성 충돌 시

```bash
npm install --legacy-peer-deps
```

## 환경 변수

프로젝트 최상위에 `.env`

```env
VITE_OPENWEATHER_API_KEY=YOUR_API_KEY
VITE_OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
```

## 실행

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## ESLint

```bash
npm run lint
```

---

# 과제 구현 포인트

## Composition API

- ref
- computed
- watch
- watchEffect
- onMounted

## Component

- Props
- Emits
- Slot

## Pinia

- 전역 상태 관리
- Getter 활용
- API 데이터 관리

## Vue Router

- 동적 라우팅
- 404 페이지

## Axios

- OpenWeather API 연동
- Promise.allSettled()

## 시각화

- Leaflet
- Chart.js
- SunCalc

## UI

- Element Plus
- Loading
- Error 처리
- Empty 화면
- 반응형

---

# 제출 전 체크리스트

- [ ] npm install
- [ ] npm run dev
- [ ] npm run lint
- [ ] npm run build
- [ ] .env Git 제외
- [ ] API 정상 동작
- [ ] 지도 정상 표시
- [ ] 예보 및 차트 정상 출력
- [ ] Vercel 배포 완료

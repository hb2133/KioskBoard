# Task

## Context
- 캘린더의 토·일요일과 대한민국 공휴일을 시각적으로 구분한다.

## Current Understanding
- 주말은 로컬 날짜의 요일을 기준으로 표시한다.
- 공휴일은 Nager.Date의 한국 REST API를 사용하고 연도별 로컬 캐시를 둔다.

## Observed Issues
- 기존 캘린더는 요일과 공휴일 정보를 `CalendarDay`에 포함하지 않는다.
- 공공데이터포털 특일 API는 서비스 인증키가 필요하다.

## Decision Notes
- 사내 배포 설정을 늘리지 않기 위해 별도 키가 필요 없는 Nager.Date를 선택했다.
- API 장애나 오프라인 상태에서는 마지막 캐시를 사용하고, 캐시도 없으면 주말 표시만 유지한다.

## Implementation Notes
- 토·일요일 날짜 숫자를 주제별 danger 색상으로 표시했다.
- 공휴일은 날짜 숫자와 공휴일명을 빨간색으로 표시했다.
- 모바일 일정 목록에도 공휴일을 포함하고 공휴일명을 보여준다.
- 연도별 공휴일 응답을 24시간 동안 localStorage에 캐시하고 5초 타임아웃을 적용했다.

## Result
- Nager.Date 2026년 한국 응답 18건과 CORS 허용을 확인했다.
- TypeScript, ESLint, Vite 생산 빌드, Windows x64 Electron 패키징을 통과했다.

## History Index
- 아직 분리된 이력이 없다.

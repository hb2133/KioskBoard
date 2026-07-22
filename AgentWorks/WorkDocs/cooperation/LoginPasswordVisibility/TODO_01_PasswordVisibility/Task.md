# Task

## Context
- 로그인 제목을 간결하게 바꾸고 비밀번호 표시 전환을 제공한다.

## Current Understanding
- 인증 BasePanel의 controller가 입력값과 표시 상태를 관리하고 panel은 아이콘과 input type을 렌더링한다.

## Observed Issues
- 런타임에서 확인된 현상이나 새로 발견된 문제를 적는다.

## Decision Notes
- 방향이 바뀐 이유와 폐기한 가설을 적는다.

## Implementation Notes
- `사내 운영 보드 로그인`을 `로그인`으로 변경했다.
- 비밀번호 입력 오른쪽에 보기·숨기기 SVG 아이콘 버튼을 추가했다.
- `aria-label`, `aria-pressed`, 키보드 focus 스타일을 적용했다.

## Result
- TypeScript, ESLint, Vite 생산 빌드, Windows x64 Electron 패키징을 통과했다.
- Vercel 프로덕션과 `E:\\KioskBoard` 실행본에 반영하고 재시작을 확인했다.

## History Index
- 아직 분리된 이력이 없다.

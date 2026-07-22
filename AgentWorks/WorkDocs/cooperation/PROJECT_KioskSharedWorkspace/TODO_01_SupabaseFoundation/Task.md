# Task

## Context
- 여러 PC가 동일한 행사·키오스크 데이터를 안전하게 공유할 기반을 만든다.
- 버그 수정이면 `Bug Context`로 바꿔도 된다.

## Current Understanding
- `OperationsBasePanelController`가 동기식 로컬 Action에 직접 의존한다.
- Supabase 연동 후 저장 동작은 비동기 Action/Manager 경계로 전환해야 한다.
- 단일 사내 워크스페이스와 허용된 사용자만 접근하는 RLS 정책을 사용한다.
- Supabase URL과 publishable key는 클라이언트 설정에 사용할 수 있지만 service role key는 앱에 포함하지 않는다.

## Observed Issues
- 외부 Supabase 프로젝트와 연결 정보가 아직 생성되지 않았다.
- 다중 사용자 환경에서는 현재 클라이언트의 키오스크 중복 검사만으로 동시 저장을 막을 수 없다.

## Decision Notes
- Vercel API 계층은 첫 사내 버전에서 제외하고 Electron에서 Supabase에 직접 연결한다.
- 연결 설정 전까지 기존 로컬 모드는 유지해 개발과 데이터 접근이 막히지 않게 한다.

## Implementation Notes
- 작업 루트와 초기 구현 범위를 생성했다.
- 기존 행사·키오스크 저장 Action과 Controller 의존성을 확인했다.
- Publishable key를 Git에서 제외되는 `.env.local`에 연결했다.
- Supabase 클라이언트, 세션 유지 AuthManager, 로그인 BasePanel, 로그아웃 흐름을 구현했다.
- 단일 워크스페이스 테이블, RLS, Realtime 설정 SQL과 운영 문서를 추가했다.
- Supabase SQL Editor에서 마이그레이션을 실행했고 `Success. No rows returned` 결과를 확인했다.
- Publishable key 기반 REST 상태 검사에서 5개 테이블이 모두 HTTP 200을 반환했다.
- 행사·키오스크 공용 Repository와 Realtime 구독을 OperationsBasePanel Controller에 연결했다.
- 서버가 비어 있을 때 기존 로컬 데이터를 1회 업로드하고 이후 로컬 저장소를 캐시로 갱신하도록 구현했다.
- Windows x64 패키징 후 `E:\KioskBoard-supabase-preview-20260722`에서 로그인 화면 실행을 확인했다.
- UUID가 아닌 Notion 행사 ID 때문에 최초 이전이 4건에서 중단된 원인을 확인했다.
- 행사 ID 컬럼을 text로 전환하고 RLS 정책을 재생성하는 두 번째 마이그레이션을 적용했다.
- LevelDB에서 행사 25건을 복구해 Supabase 25건과 새 Windows 빌드 화면의 전체 25건을 확인했다.
- 부분 이전이 로컬 원본을 덮어쓰지 않도록 동기화 수량 검증과 중복 실행 방지를 추가했다.
- 검증된 fixed 빌드를 `E:\KioskBoard-supabase-win-x64-20260722-fixed.zip`으로 생성했다.
- 자동 백업은 실행 파일 또는 개발 프로젝트 경로의 `Saved/kioskboard-latest-backup.json` 한 파일만 덮어쓰도록 구현했다.
- 최신 백업에 행사 25건과 키오스크 6건이 기록되고 JSON 파일이 1개만 존재함을 확인했다.
- 설정의 `백업 및 복구`에서 JSON 파일 선택, 내용 요약, 2단계 확인 후 전체 복구가 가능하도록 구현했다.
- 복구 실패 시 작업 전 서버 스냅샷을 다시 기록하는 롤백 경로를 추가했다.
- 동일한 fixed ZIP 경로를 최신 백업 및 복구 기능이 포함된 빌드로 교체했다.
- Realtime 삭제 후 시작 시점의 로컬 스냅샷이 다시 업로드되어 행사가 복원되는 문제를 수정했다.
- 로컬 데이터 이전은 서버의 행사와 키오스크가 모두 비어 있는 최초 동기화 1회에만 실행한다.
- Vite 웹 진입점과 브라우저용 Workbench bridge를 추가해 Electron UI를 웹에서 재사용하도록 구현했다.
- Vercel 프로젝트 `hb2133s-projects/kioskboard`에 Supabase 환경변수를 등록했다.
- 프로덕션 웹 앱을 `https://kioskboard.vercel.app`에 배포하고 HTTPS 200, 정적 자산, Supabase 설정 포함을 확인했다.
- 웹 767px 이하에서 모바일 세로형 헤더, 요약 카드, 탭, 행사 카드 목록과 한 열 팝업으로 전환하도록 반응형 UI를 추가했다.
- 모바일 캘린더는 7열 축소판 대신 날짜별 일정 목록을 제공하며 행사를 눌러 상세 정보를 열 수 있다.
- Chrome 390x844 뷰포트에서 모바일 로그인 화면 렌더링을 확인했다.
- 전체내역을 진행내역으로 변경하고 예정·진행 행사만 목록에 포함하도록 파생 로직을 수정했다.
- 전체 상태 드롭다운을 `예정 + 진행 / 예정 / 진행` 분할 필터로 교체하고 기본값을 예정 + 진행으로 설정했다.
- 캘린더에서 주가 달라 여러 줄로 나뉜 동일 행사 세그먼트가 hover와 키보드 focus 시 함께 강조되도록 행사 ID 기반 하이라이트 상태를 추가했다.

- 행사 등록·수정에 콘텐츠, 담당자, 담당자 연락처 필드를 추가하고 상세 팝업에서도 확인할 수 있게 했다.
- 이전 로컬 데이터와 JSON 백업에 새 필드가 없어도 빈 값으로 복구되는 정규화 처리를 추가했다.
- Supabase `events`에 세 필드를 추가하는 `202607220003_event_content_and_manager.sql` 마이그레이션을 준비했다.

## Result
- 앱 번들 컴파일, ESLint, TypeScript 검사는 통과했다.
- Linux 개발 실행은 호스트의 `libasound.so.2` 부재로 창 실행 단계에서 중단됐으며 코드 컴파일 오류는 없다.
- Supabase 스키마가 준비되어 공용 저장소와 Realtime 연결을 이어갈 수 있다.
- 신규 필드 작업은 TypeScript, ESLint, 웹 생산 빌드, Electron 패키징 검증을 통과했다.

## History Index
- 아직 분리된 이력이 없다.

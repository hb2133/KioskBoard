# 키오스크 사내 공유 워크스페이스

## Summary
- 로컬 전용 KioskBoard를 사내 사용자들이 함께 사용하는 Supabase 기반 공유 보드로 전환한다.

## Background
- 현재 행사와 키오스크 데이터는 각 PC의 `localStorage`에만 저장된다.
- 서비스 판매가 아닌 단일 회사 내부 사용을 전제로 인증과 권한 구조를 단순화한다.
- Supabase Free 플랜에서 시작하며 유료 전환은 사용자가 명시적으로 결정한다.

## Scope
- 사내 이메일 로그인과 단일 워크스페이스
- 행사·키오스크 공용 PostgreSQL 저장
- Realtime 변경 구독
- 서버 측 키오스크 일정 충돌 방지
- 기존 로컬 데이터의 1회 이전과 JSON 백업
- 동일한 Supabase 데이터를 사용하는 Vercel HTTPS 웹 앱
- 연결 설정이 없을 때 기존 로컬 모드 보존

## References
- `src/panels/base/OperationsBasePanel/`
- `src/core/infra/local_storage/`
- Supabase Auth, Postgres, Realtime, RLS 공식 문서

## Current Status
- Supabase 인증, 공유 저장소, Realtime, 백업 및 복구를 연결했다.
- Electron과 같은 운영 화면을 사용하는 웹 빌드를 `https://kioskboard.vercel.app`에 배포했다.

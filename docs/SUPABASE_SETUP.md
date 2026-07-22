# Supabase 사내 공유 설정

## 1. 데이터베이스 준비

1. Supabase 프로젝트의 `SQL Editor`를 연다.
2. `supabase/migrations/`의 SQL 파일을 파일명 순서대로 열어 전체를 붙여 넣는다.
3. 각 파일마다 `Run`을 눌러 테이블, RLS 정책, Realtime 설정과 추가 필드를 반영한다.

이미 운영 중인 프로젝트는 아직 실행하지 않은 마이그레이션만 순서대로 실행한다. SQL은 `if not exists`를 사용해 기존 행사 데이터를 유지한다.

## 2. 사내 계정만 허용

Supabase `Authentication > Providers > Email`에서 일반 사용자의 공개 회원가입을 비활성화한다.
그 후 `Authentication > Users`에서 사내 사용자를 직접 생성하거나 초대한다.
SQL 실행 후 새로 생성된 사용자는 KioskBoard 워크스페이스에 자동으로 추가된다.

## 3. 로컬 개발 설정

`.env.example`을 참고해 Git에서 제외되는 `.env.local`에 아래 값을 설정한다.

```dotenv
KIOSKBOARD_SUPABASE_URL=https://your-project.supabase.co
KIOSKBOARD_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

Publishable key만 Electron 앱에 사용한다. Secret key, service role key, 데이터베이스 비밀번호는 앱이나 저장소에 넣지 않는다.

## 4. 무료 플랜 운영 주의사항

- Free 플랜은 사용자가 직접 업그레이드하지 않는 한 유료로 전환되지 않는다.
- 장기간 활동이 없으면 프로젝트가 일시정지될 수 있다.
- 무료 플랜에는 자동 백업이 없으므로 앱의 JSON 내보내기와 정기 백업을 사용한다.

KioskBoard는 저장 시 실행 파일 옆 `Saved/kioskboard-latest-backup.json` 한 파일을 최신 전체 데이터로 덮어쓴다. 날짜별 백업 파일은 자동 생성하지 않는다.

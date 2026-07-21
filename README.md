# KioskBoard

키오스크 행사 일정, 장비 배정, 계약 및 납부 상태를 한 화면에서 관리하는 Electron 데스크톱 앱입니다.

![KioskBoard 캘린더 행사 상세 화면](docs/screenshots/kioskboard-calendar-details.png)

## 주요 기능

- 날짜에 따른 예정·진행·완료 상태 자동 계산
- 전체내역, 월간 캘린더, 완료내역 제공
- 설치·회수 시각을 반영한 캘린더 행사 막대
- 운용 키오스크 등록 및 행사별 다중 배정
- 다른 행사와 시간이 겹치는 키오스크 배정 방지
- 계약, 선금, 잔금 완료 상태 즉시 변경
- 캘린더 행사 클릭 시 상세 정보 확인
- 라이트·다크 모드와 Windows 네이티브 타이틀바 지원
- 로컬 저장소 기반 행사 및 설정 보존

## 개발 실행

```bash
npm install
npm start
```

## 검증

```bash
npm run lint
npx tsc --noEmit
```

## Windows 패키징

```bash
npx electron-forge package --platform=win32 --arch=x64
```

생성된 실행본은 `out/kioskboard-win32-x64/`에 위치합니다.

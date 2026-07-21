# OperationsBasePanel

- Type: BasePanel
- Purpose: 모든 키오스크 행사 운영 데이터를 조회하고 관리하는 메인 작업 화면
- Sections:
  - `HeaderSection`: 제품명, 오늘 날짜, 행사 등록 CTA
  - `SummarySection`: 전체·예정·진행·완료 행사 수 요약
  - `ViewNavigationSection`: 전체내역·캘린더·완료내역 보기 전환
  - `EventLedgerSection`: 전체 행사 테이블, 상태 필터, 수정·삭제 진입
  - `CalendarSection`: 월간 일정 배치
  - `CompletedLedgerSection`: 완료 행사 정산·납품 상태
- Layered open points:
  - 행사 등록/수정 → `EventEditorLayeredPanel`
  - 삭제 → `DeleteConfirmLayeredPanel`

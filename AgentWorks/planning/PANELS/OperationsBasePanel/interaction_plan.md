# OperationsBasePanel Interaction Plan

- 보기 버튼 → 동일 BasePanel 안에서 Section 전환
- 상태 필터 → 전체내역 테이블의 표시 행 변경
- 월 이동 → 캘린더 표시 월 변경
- 행사 등록 → 빈 payload로 EventEditorLayeredPanel open
- 행사 수정 → 선택 행사 payload로 EventEditorLayeredPanel open
- 편집 완료 → 목록 upsert, 로컬 저장, layered close
- 삭제 → DeleteConfirmLayeredPanel open
- 삭제 확인 → 목록 제거, 로컬 저장, layered close
- Escape/backdrop → 현재 최상단 dismissible layered panel close

# Tags

이 문서는 이 프로젝트의 WorkDocs 표준 태그 사전이다.

## kiosk_operations
DisplayName: 키오스크 운영
Aliases: kiosk, operations
Description: 키오스크 행사, 설치, 납품 및 운영 현황 관리와 관련된 작업

## event_schedule
DisplayName: 행사 일정
Aliases: calendar, schedule
Description: 행사 일정 등록, 날짜 기반 상태 계산 및 캘린더 표시에 관련된 작업

## payment_tracking
DisplayName: 정산 관리
Aliases: deposit, balance
Description: 계약, 선금, 잔금 및 납품 완료 상태 관리와 관련된 작업

규칙:

- 태그는 작업 루트의 `Meta.md`에서만 사용한다.
- `Meta.md`의 `Tags` 값은 이 문서에 정의된 표준 태그 이름과 정확히 일치해야 한다.
- 이 파일에 작업 목록을 수동으로 적지 않는다.
- 작업 간 연결은 각 작업 루트의 `Meta.md`를 기준으로 조회한다.

새 태그는 아래 형식으로 추가한다.

```md
## tag_name
DisplayName: 표시 이름
Aliases: alias-a, alias-b
Description: 이 태그가 담당하는 작업 영역
```

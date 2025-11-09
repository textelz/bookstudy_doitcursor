# 커피 주문 앱 - 백엔드 PRD

## 1. 개요

이 문서는 커피 주문 앱의 백엔드 개발을 위한 요구사항 명세서입니다. 프런트엔드와의 연동을 위한 API 설계, 데이터 모델, 사용자 흐름을 정의합니다.

## 2. 기술 스택

- **백엔드 프레임워크**: Node.js, Express
- **데이터베이스**: PostgreSQL
- **API 형식**: RESTful API
- **데이터 형식**: JSON

## 3. 데이터 모델

### 3.1 Menus (메뉴)

커피 메뉴 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 메뉴 고유 ID |
| name | VARCHAR(100) | NOT NULL | 커피 이름 (예: "아메리카노(ICE)") |
| description | TEXT | NULL | 메뉴 설명 |
| price | INTEGER | NOT NULL | 기본 가격 (원 단위) |
| image_url | VARCHAR(255) | NULL | 이미지 URL 경로 |
| stock | INTEGER | NOT NULL, DEFAULT 0 | 재고 수량 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정 일시 |

**예시 데이터:**
```json
{
  "id": 1,
  "name": "아메리카노(ICE)",
  "description": "시원하고 깔끔한 아이스 아메리카노",
  "price": 4000,
  "image_url": "/images/americano-ice.jpg",
  "stock": 10,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3.2 Options (옵션)

메뉴에 추가할 수 있는 옵션 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 옵션 고유 ID |
| name | VARCHAR(100) | NOT NULL | 옵션 이름 (예: "샷 추가", "시럽 추가") |
| price | INTEGER | NOT NULL, DEFAULT 0 | 옵션 추가 가격 (원 단위) |
| menu_id | INTEGER | FOREIGN KEY (Menus.id) | 연결된 메뉴 ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정 일시 |

**예시 데이터:**
```json
{
  "id": 1,
  "name": "샷 추가",
  "price": 500,
  "menu_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3.3 Orders (주문)

주문 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 주문 고유 ID |
| order_time | TIMESTAMP | NOT NULL, DEFAULT NOW() | 주문 일시 |
| total_price | INTEGER | NOT NULL | 주문 총 금액 (원 단위) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'received' | 주문 상태 ('received', 'in_progress', 'completed') |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 일시 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 수정 일시 |

**주문 상태 설명:**
- `received`: 주문 접수 (기본 상태)
- `in_progress`: 제조 중
- `completed`: 제조 완료

### 3.4 OrderItems (주문 상세)

주문에 포함된 메뉴와 옵션 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 주문 상세 고유 ID |
| order_id | INTEGER | FOREIGN KEY (Orders.id) | 주문 ID |
| menu_id | INTEGER | FOREIGN KEY (Menus.id) | 메뉴 ID |
| quantity | INTEGER | NOT NULL | 수량 |
| item_price | INTEGER | NOT NULL | 개별 아이템 가격 (메뉴 가격 + 옵션 가격) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 일시 |

### 3.5 OrderItemOptions (주문 상세 옵션)

주문 상세에 포함된 옵션 정보를 저장하는 테이블입니다.

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | INTEGER | PRIMARY KEY, AUTO_INCREMENT | 주문 상세 옵션 고유 ID |
| order_item_id | INTEGER | FOREIGN KEY (OrderItems.id) | 주문 상세 ID |
| option_id | INTEGER | FOREIGN KEY (Options.id) | 옵션 ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 생성 일시 |

### 3.6 데이터베이스 관계도

```
Menus (1) ──< (N) Options
  │
  │
  │ (1)
  │
  │
  └──< (N) OrderItems ──< (N) OrderItemOptions
         │
         │ (N)
         │
         │
      (1) Orders
```

## 4. 사용자 흐름 및 데이터 스키마

### 4.1 메뉴 목록 조회 흐름

1. **프런트엔드 요청**: 사용자가 '주문하기' 화면에 접속
2. **백엔드 처리**: 
   - `GET /api/menus` API 호출
   - Menus 테이블에서 모든 메뉴 조회
   - 각 메뉴에 연결된 Options 조회 (JOIN 또는 별도 쿼리)
   - 재고 수량(stock)은 관리자 화면에서만 사용하므로, 일반 사용자용 API에서는 제외하거나 null로 반환
3. **응답 데이터**: 메뉴 목록과 각 메뉴의 옵션 정보를 JSON 형식으로 반환

**응답 예시:**
```json
{
  "menus": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "description": "시원하고 깔끔한 아이스 아메리카노",
      "price": 4000,
      "image_url": "/images/americano-ice.jpg",
      "options": [
        {
          "id": 1,
          "name": "샷 추가",
          "price": 500
        },
        {
          "id": 2,
          "name": "시럽 추가",
          "price": 0
        }
      ]
    }
  ]
}
```

### 4.2 장바구니 관리 흐름

1. **프런트엔드**: 사용자가 메뉴를 선택하고 옵션을 추가하여 장바구니에 담음
2. **데이터 저장**: 장바구니는 프런트엔드에서만 관리 (세션/로컬 스토리지)
3. **백엔드 연동**: 이 단계에서는 백엔드와의 통신 없음

### 4.3 주문 생성 흐름

1. **프런트엔드 요청**: 사용자가 장바구니에서 '주문하기' 버튼 클릭
2. **백엔드 처리**:
   - `POST /api/orders` API 호출
   - 주문 데이터 검증
   - Orders 테이블에 주문 정보 저장
   - OrderItems 테이블에 주문 상세 정보 저장
   - OrderItemOptions 테이블에 선택된 옵션 정보 저장
   - 주문에 포함된 각 메뉴의 재고 수량 차감 (Menus 테이블 업데이트)
   - 재고가 부족한 경우 에러 반환
3. **응답**: 생성된 주문 ID와 주문 정보 반환

**요청 예시:**
```json
{
  "items": [
    {
      "menu_id": 1,
      "quantity": 2,
      "option_ids": [1, 2],
      "item_price": 4500
    },
    {
      "menu_id": 2,
      "quantity": 1,
      "option_ids": [],
      "item_price": 4000
    }
  ],
  "total_price": 13000
}
```

**응답 예시:**
```json
{
  "order_id": 123,
  "order_time": "2024-01-15T10:30:00Z",
  "total_price": 13000,
  "status": "received",
  "message": "주문이 접수되었습니다."
}
```

### 4.4 관리자 화면 - 재고 조회 흐름

1. **프런트엔드 요청**: 관리자가 관리자 화면에 접속
2. **백엔드 처리**:
   - `GET /api/admin/menus` API 호출 (재고 정보 포함)
   - Menus 테이블에서 모든 메뉴와 재고 수량 조회
3. **응답**: 메뉴 목록과 재고 수량 반환

**응답 예시:**
```json
{
  "menus": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "stock": 10
    }
  ]
}
```

### 4.5 관리자 화면 - 재고 수정 흐름

1. **프런트엔드 요청**: 관리자가 재고 수량 조정 버튼 클릭
2. **백엔드 처리**:
   - `PATCH /api/admin/menus/:menuId/stock` API 호출
   - Menus 테이블에서 해당 메뉴의 재고 수량 업데이트
   - 재고 수량이 0 미만이 되지 않도록 검증
3. **응답**: 업데이트된 재고 수량 반환

**요청 예시:**
```json
{
  "change": 1  // +1 또는 -1
}
```

### 4.6 관리자 화면 - 주문 현황 조회 흐름

1. **프런트엔드 요청**: 관리자가 관리자 화면의 '주문 현황' 섹션 확인
2. **백엔드 처리**:
   - `GET /api/admin/orders` API 호출
   - Orders 테이블에서 모든 주문 조회 (최신순 정렬)
   - 각 주문의 OrderItems와 OrderItemOptions 조회
3. **응답**: 주문 목록과 상세 정보 반환

**응답 예시:**
```json
{
  "orders": [
    {
      "id": 123,
      "order_time": "2024-01-15T10:30:00Z",
      "total_price": 13000,
      "status": "received",
      "items": [
        {
          "menu_id": 1,
          "menu_name": "아메리카노(ICE)",
          "quantity": 2,
          "item_price": 4500,
          "options": [
            {
              "option_id": 1,
              "option_name": "샷 추가",
              "option_price": 500
            }
          ]
        }
      ]
    }
  ]
}
```

### 4.7 관리자 화면 - 주문 상태 변경 흐름

1. **프런트엔드 요청**: 관리자가 '제조 시작' 또는 '제조 완료' 버튼 클릭
2. **백엔드 처리**:
   - `PATCH /api/admin/orders/:orderId/status` API 호출
   - Orders 테이블에서 해당 주문의 상태 업데이트
   - 상태 변경 검증 (received → in_progress → completed 순서)
3. **응답**: 업데이트된 주문 정보 반환

**요청 예시:**
```json
{
  "status": "in_progress"
}
```

### 4.8 주문 상세 조회 흐름

1. **프런트엔드 요청**: 주문 ID를 전달하여 주문 정보 조회
2. **백엔드 처리**:
   - `GET /api/orders/:orderId` API 호출
   - Orders 테이블에서 해당 주문 조회
   - OrderItems와 OrderItemOptions 조회
3. **응답**: 주문 상세 정보 반환

## 5. API 설계

### 5.1 메뉴 관련 API

#### 5.1.1 메뉴 목록 조회 (일반 사용자)
- **엔드포인트**: `GET /api/menus`
- **설명**: 주문하기 화면에 표시할 메뉴 목록을 조회합니다. 재고 정보는 제외됩니다.
- **요청**: 없음
- **응답**:
  - **성공 (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "menus": [
          {
            "id": 1,
            "name": "아메리카노(ICE)",
            "description": "시원하고 깔끔한 아이스 아메리카노",
            "price": 4000,
            "image_url": "/images/americano-ice.jpg",
            "options": [
              {
                "id": 1,
                "name": "샷 추가",
                "price": 500
              }
            ]
          }
        ]
      }
    }
    ```
  - **실패 (500 Internal Server Error)**:
    ```json
    {
      "success": false,
      "error": {
        "message": "메뉴 목록을 불러오는데 실패했습니다."
      }
    }
    ```

#### 5.1.2 메뉴 목록 조회 (관리자)
- **엔드포인트**: `GET /api/admin/menus`
- **설명**: 관리자 화면에 표시할 메뉴 목록과 재고 정보를 조회합니다.
- **요청**: 없음
- **응답**:
  - **성공 (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "menus": [
          {
            "id": 1,
            "name": "아메리카노(ICE)",
            "description": "시원하고 깔끔한 아이스 아메리카노",
            "price": 4000,
            "image_url": "/images/americano-ice.jpg",
            "stock": 10,
            "options": [
              {
                "id": 1,
                "name": "샷 추가",
                "price": 500
              }
            ]
          }
        ]
      }
    }
    ```

#### 5.1.3 재고 수량 수정
- **엔드포인트**: `PATCH /api/admin/menus/:menuId/stock`
- **설명**: 특정 메뉴의 재고 수량을 증가 또는 감소시킵니다.
- **요청 파라미터**:
  - `menuId` (path): 메뉴 ID
- **요청 본문**:
  ```json
  {
    "change": 1  // +1 또는 -1
  }
  ```
- **응답**:
  - **성공 (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "menu_id": 1,
        "stock": 11,
        "message": "재고 수량이 업데이트되었습니다."
      }
    }
    ```
  - **실패 (400 Bad Request)**: 재고가 0 미만이 되는 경우
    ```json
    {
      "success": false,
      "error": {
        "message": "재고 수량은 0 미만이 될 수 없습니다."
      }
    }
    ```
  - **실패 (404 Not Found)**: 메뉴를 찾을 수 없는 경우
    ```json
    {
      "success": false,
      "error": {
        "message": "메뉴를 찾을 수 없습니다."
      }
    }
    ```

### 5.2 주문 관련 API

#### 5.2.1 주문 생성
- **엔드포인트**: `POST /api/orders`
- **설명**: 새로운 주문을 생성하고, 주문에 포함된 메뉴의 재고를 차감합니다.
- **요청 본문**:
  ```json
  {
    "items": [
      {
        "menu_id": 1,
        "quantity": 2,
        "option_ids": [1, 2],
        "item_price": 4500
      },
      {
        "menu_id": 2,
        "quantity": 1,
        "option_ids": [],
        "item_price": 4000
      }
    ],
    "total_price": 13000
  }
  ```
- **응답**:
  - **성공 (201 Created)**:
    ```json
    {
      "success": true,
      "data": {
        "order_id": 123,
        "order_time": "2024-01-15T10:30:00Z",
        "total_price": 13000,
        "status": "received",
        "message": "주문이 접수되었습니다."
      }
    }
    ```
  - **실패 (400 Bad Request)**: 재고 부족
    ```json
    {
      "success": false,
      "error": {
        "message": "재고가 부족합니다.",
        "details": {
          "menu_id": 1,
          "menu_name": "아메리카노(ICE)",
          "requested": 2,
          "available": 1
        }
      }
    }
    ```
  - **실패 (400 Bad Request)**: 잘못된 요청 데이터
    ```json
    {
      "success": false,
      "error": {
        "message": "주문 정보가 올바르지 않습니다."
      }
    }
    ```

#### 5.2.2 주문 상세 조회
- **엔드포인트**: `GET /api/orders/:orderId`
- **설명**: 주문 ID를 통해 주문 상세 정보를 조회합니다.
- **요청 파라미터**:
  - `orderId` (path): 주문 ID
- **응답**:
  - **성공 (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "id": 123,
        "order_time": "2024-01-15T10:30:00Z",
        "total_price": 13000,
        "status": "received",
        "items": [
          {
            "menu_id": 1,
            "menu_name": "아메리카노(ICE)",
            "quantity": 2,
            "item_price": 4500,
            "options": [
              {
                "option_id": 1,
                "option_name": "샷 추가",
                "option_price": 500
              }
            ]
          }
        ]
      }
    }
    ```
  - **실패 (404 Not Found)**: 주문을 찾을 수 없는 경우
    ```json
    {
      "success": false,
      "error": {
        "message": "주문을 찾을 수 없습니다."
      }
    }
    ```

#### 5.2.3 주문 목록 조회 (관리자)
- **엔드포인트**: `GET /api/admin/orders`
- **설명**: 관리자 화면에 표시할 모든 주문 목록을 조회합니다. 최신 주문이 먼저 오도록 정렬합니다.
- **요청 쿼리 파라미터** (선택):
  - `status` (optional): 주문 상태 필터 ('received', 'in_progress', 'completed')
- **응답**:
  - **성공 (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "orders": [
          {
            "id": 123,
            "order_time": "2024-01-15T10:30:00Z",
            "total_price": 13000,
            "status": "received",
            "items": [
              {
                "menu_id": 1,
                "menu_name": "아메리카노(ICE)",
                "quantity": 2,
                "item_price": 4500,
                "options": [
                  {
                    "option_id": 1,
                    "option_name": "샷 추가",
                    "option_price": 500
                  }
                ]
              }
            ]
          }
        ]
      }
    }
    ```

#### 5.2.4 주문 상태 변경 (관리자)
- **엔드포인트**: `PATCH /api/admin/orders/:orderId/status`
- **설명**: 주문의 상태를 변경합니다. (received → in_progress → completed)
- **요청 파라미터**:
  - `orderId` (path): 주문 ID
- **요청 본문**:
  ```json
  {
    "status": "in_progress"  // "received", "in_progress", "completed"
  }
  ```
- **응답**:
  - **성공 (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "order_id": 123,
        "status": "in_progress",
        "message": "주문 상태가 업데이트되었습니다."
      }
    }
    ```
  - **실패 (400 Bad Request)**: 잘못된 상태 변경
    ```json
    {
      "success": false,
      "error": {
        "message": "잘못된 상태 변경입니다. 주문 상태는 received → in_progress → completed 순서로만 변경할 수 있습니다."
      }
    }
    ```
  - **실패 (404 Not Found)**: 주문을 찾을 수 없는 경우
    ```json
    {
      "success": false,
      "error": {
        "message": "주문을 찾을 수 없습니다."
      }
    }
    ```

### 5.3 통계 관련 API

#### 5.3.1 주문 통계 조회 (관리자)
- **엔드포인트**: `GET /api/admin/orders/stats`
- **설명**: 관리자 대시보드에 표시할 주문 통계를 조회합니다.
- **요청**: 없음
- **응답**:
  - **성공 (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "total_orders": 50,
        "received_orders": 10,
        "in_progress_orders": 5,
        "completed_orders": 35
      }
    }
    ```

## 6. 에러 처리

### 6.1 공통 에러 응답 형식

모든 API는 다음 형식의 에러 응답을 반환합니다:

```json
{
  "success": false,
  "error": {
    "message": "에러 메시지",
    "code": "ERROR_CODE"  // 선택 사항
  }
}
```

### 6.2 HTTP 상태 코드

- **200 OK**: 요청 성공
- **201 Created**: 리소스 생성 성공
- **400 Bad Request**: 잘못된 요청 (검증 실패, 재고 부족 등)
- **404 Not Found**: 리소스를 찾을 수 없음
- **500 Internal Server Error**: 서버 내부 오류

### 6.3 주요 에러 케이스

1. **재고 부족**: 주문 시 요청한 수량보다 재고가 적은 경우
2. **잘못된 메뉴 ID**: 존재하지 않는 메뉴 ID를 참조하는 경우
3. **잘못된 옵션 ID**: 존재하지 않거나 해당 메뉴에 연결되지 않은 옵션 ID를 참조하는 경우
4. **잘못된 주문 상태 변경**: 주문 상태를 올바르지 않은 순서로 변경하려는 경우
5. **데이터베이스 연결 오류**: 데이터베이스 연결 실패

## 7. 데이터 검증

### 7.1 주문 생성 시 검증

- 모든 필수 필드가 존재하는지 확인
- `menu_id`가 유효한 메뉴 ID인지 확인
- `option_ids`의 모든 옵션이 해당 메뉴에 연결되어 있는지 확인
- `quantity`가 1 이상인지 확인
- `item_price`가 올바르게 계산되었는지 확인 (메뉴 가격 + 옵션 가격)
- `total_price`가 모든 아이템의 총합과 일치하는지 확인
- 주문에 포함된 각 메뉴의 재고가 충분한지 확인

### 7.2 재고 수정 시 검증

- `change` 값이 -1 또는 1인지 확인
- 수정 후 재고가 0 미만이 되지 않는지 확인
- 메뉴 ID가 유효한지 확인

### 7.3 주문 상태 변경 시 검증

- 주문 ID가 유효한지 확인
- 상태 변경이 올바른 순서인지 확인 (received → in_progress → completed)
- 현재 상태에서 요청한 상태로 변경 가능한지 확인

## 8. 트랜잭션 처리

### 8.1 주문 생성 시 트랜잭션

주문 생성 시 다음 작업들이 하나의 트랜잭션으로 처리되어야 합니다:

1. Orders 테이블에 주문 정보 삽입
2. OrderItems 테이블에 주문 상세 정보 삽입
3. OrderItemOptions 테이블에 옵션 정보 삽입
4. Menus 테이블의 재고 수량 업데이트

**중요**: 위 작업 중 하나라도 실패하면 모든 작업이 롤백되어야 합니다. 특히 재고 차감이 실패하면 주문도 생성되지 않아야 합니다.

## 9. 성능 고려사항

### 9.1 데이터베이스 인덱스

다음 필드에 인덱스를 생성하는 것을 권장합니다:

- `Menus.id` (PRIMARY KEY)
- `Options.menu_id` (FOREIGN KEY)
- `Orders.id` (PRIMARY KEY)
- `Orders.status` (주문 상태별 조회)
- `Orders.order_time` (최신순 정렬)
- `OrderItems.order_id` (FOREIGN KEY)
- `OrderItems.menu_id` (FOREIGN KEY)

### 9.2 쿼리 최적화

- 메뉴 목록 조회 시 JOIN을 사용하여 옵션 정보를 한 번에 가져오기
- 주문 목록 조회 시 필요한 필드만 SELECT하여 불필요한 데이터 전송 최소화
- 페이지네이션을 고려한 LIMIT/OFFSET 사용 (향후 확장 시)

## 10. 보안 고려사항

### 10.1 입력 데이터 검증

- 모든 사용자 입력 데이터를 검증하고 sanitize
- SQL Injection 방지를 위한 파라미터화된 쿼리 사용
- XSS 공격 방지를 위한 출력 데이터 이스케이프

### 10.2 API 접근 제어

- 관리자 API (`/api/admin/*`)는 향후 인증/인가 메커니즘 추가 고려
- 현재는 학습 목적이므로 인증 기능 제외

## 11. 향후 확장 가능성

### 11.1 추가 가능한 기능

- 주문 취소 기능
- 주문 수정 기능
- 주문 히스토리 조회
- 통계 및 리포트 기능
- 실시간 주문 알림 (WebSocket)
- 사용자 인증 및 권한 관리

### 11.2 데이터베이스 확장

- 사용자 테이블 추가
- 결제 정보 테이블 추가
- 리뷰 및 평점 테이블 추가


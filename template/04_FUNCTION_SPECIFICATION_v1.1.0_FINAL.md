# MODULE FUNCTIONAL SPECIFICATION - AdCPC Metadata Service

| Information | Details |
| :--- | :--- |
| **Project** | AdCPC Metadata Service |
| **Module** | Core Metadata Services |
| **Version** | v1.1.0 |
| **Last Updated** | 2026-04-22 |
| **Status** | FINAL |
| **Author** | Adtech Bigdata Team |

---

## REVISION HISTORY
| Version | Date | Updated By | Description |
| :--- | :--- | :--- | :--- |
| 1.0.0 | 2026-04-17 | Gemini | Initial version |
| 1.1.0 | 2026-04-22 | Gemini | Bổ sung API Contract (Request/Response Models) và Xử lý Lỗi theo Template chuẩn |

---

# MODULE 1: ADS METADATA

# MODULE 3: PERFORMANCE & DELIVERY

## [FUNCTION] Get Max Value Data
Label: [MaxValueController.getMaxValueData]

API: GET /mv/data/max-value

---

### [SECTION] Business Description
Lấy thông tin giới hạn ngân sách tối đa (Max Value) của Banner/Campaign.

---

### [SECTION] Actor
- Delivery Engine

---

### [SECTION] Preconditions
- None

---

### [SECTION] Main Flow
1. Receive request at `/mv/data/max-value`.
2. Validate `product_id` and `date` parameters.
3. Call `MaxValueService.getMaxValueData(productID, date)`.
4. Query `tbl_cpc_max_value`.
5. Return JSON response.

---

### [SECTION] Business Rules
- Limit chi tiêu được cấu hình theo ngày cho từng `product_id`.

---

### [SECTION] Side Effects
- Logging.

---

### [SECTION] Input

**Query Parameters:**
- `product_id`: String
- `date`: String (Format yyyy-MM-dd)

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": 1,
  "message": "message from server",
  "code": 200,
  "data": [
    {
      "campaignId": 55432,
      "maxValue": 1000000.0
    }
  ]
}
```

---

### [SECTION] Error Codes
- 500 - Internal Server Error

---

## [FUNCTION] Get User Information
Label: [UserInfoController.getUserInfoData]

API: GET /user/data/user-info

---

### [SECTION] Business Description
Lấy thông tin số dư tài khoản của User, trạng thái active, và các thông tin khuyến mãi.

---

### [SECTION] Actor
- Delivery Engine

---

### [SECTION] Preconditions
- None

---

### [SECTION] Main Flow
1. Receive request at `/user/data/user-info`.
2. Validate `user_id`.
3. Call `UserInfoService.getUserInfoData(userId)`.
4. Return user financial state and status.

---

### [SECTION] Business Rules
- Trả về thông tin account balance và promotion attributes.

---

### [SECTION] Side Effects
- Logging.

---

### [SECTION] Input

**Query Parameters:**
- `user_id`: String

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": 1,
  "message": "message from server",
  "code": 200,
  "data": {
    "userId": 4324,
    "userStatus": 1,
    "balance": 500000.0,
    "promotion": 100000.0,
    "discount": 0.0,
    "free_click": 0,
    "run_type": 1,
    "is_unlimited": 0
  }
}
```

---

### [SECTION] Error Codes
- 404 - Not Found
- 500 - Internal Server Error

---

## [FUNCTION] Get User Campaign Data
Label: [UserInfoController.getUserCampaignData]

API: GET /user/data/user-campaign

---

### [SECTION] Business Description
Lấy danh sách các campaign và banner thuộc về một user đang chạy trong một ngày cụ thể.

---

### [SECTION] Actor
- Delivery Engine

---

### [SECTION] Preconditions
- None

---

### [SECTION] Main Flow
1. Receive request at `/user/data/user-campaign`.
2. Validate `date` parameter.
3. Call `UserInfoService.getUserCampaignData(date)`.
4. Query `tbl_cpc_campaign_user` cho ngày được yêu cầu.
5. Lọc các sản phẩm hỗ trợ (VD: AD_CPC).
6. Return danh sách được nhóm theo `user_id`.

---

### [SECTION] Business Rules
- Dữ liệu được nhóm theo `userId` để Delivery Engine dễ xử lý.

---

### [SECTION] Side Effects
- Logging.

---

### [SECTION] Input

**Query Parameters:**
- `date`: String (Format yyyy-MM-dd)

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": 1,
  "message": "original not group size = 1500, group size = 300",
  "code": 200,
  "data": {
    "4324": [
      {
        "userId": 4324,
        "campaignId": 55432,
        "bannerId": 12345,
        "productID": "AD_CPC"
      }
    ]
  }
}
```

---

### [SECTION] Error Codes
- 500 - Internal Server Error

---

## [FUNCTION] Get Delivery Data
Label: [DeliveryController.getDeliveryData]

API: POST /dlv/data/delivery

---

### [SECTION] Business Description
Lấy thông tin delivery (số lượt hiển thị, click, log phân phối) của các banner/campaign trong một ngày để thực hiện pace ngân sách.

---

### [SECTION] Actor
- Delivery Engine

---

### [SECTION] Preconditions
- None

---

### [SECTION] Main Flow
1. Receive request at `/dlv/data/delivery` with body `List<DeliveryRequest>`.
2. Extract `productID` and `date`.
3. Call `DeliveryService.getDeliveryData(deliveryRequestList)`.
4. Query `tbl_cpc_distributor_log` based on product type (VD: AD_CPC).
5. Map results into `DistributorLogResponse`.
6. Return map of `productID` to list of logs.

---

### [SECTION] Business Rules
- Dữ liệu log phân phối theo ngày để hệ thống tự động kiểm soát tần suất và pace chạy ads.

---

### [SECTION] Side Effects
- Logging.

---

### [SECTION] Input

**Body:**
```json
[
  {
    "startTime": "2023-10-25",
    "productID": "AD_CPC",
    "bannerID": 12345
  }
]
```

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": 1,
  "message": "message from server",
  "code": 200,
  "data": {
    "AD_CPC": [
      {
        "date": "2023-10-25",
        "bannerId": "12345",
        "campaignId": "55432"
      }
    ]
  }
}
```

---

### [SECTION] Error Codes
- 500 - Internal Server Error

---

## [FUNCTION] Get BanCam Data
Label: [AdsController.getBanCamData]

API: GET /data/ban-cam

---

### [SECTION] Business Description
Lấy danh sách các cấu hình hoặc metadata ràng buộc của Banner đối với Campaign, như target group, rule hiển thị.

---

### [SECTION] Actor
- Delivery Engine

---

### [SECTION] Preconditions
- None

---

### [SECTION] Main Flow
1. Receive request at `/data/ban-cam`.
2. Validate `product_id` and `date`.
3. Call `BanCamService.getBanCamData(productID, date)`.
4. Query `tbl_cpc_ban_cam`.
5. Return JSON list của `BanCamResponse`.

---

### [SECTION] Business Rules
- Kết nối thông tin Banner và Campaign để filter hoặc định tuyến khi Delivery phân phát quảng cáo.

---

### [SECTION] Side Effects
- Logging.

---

### [SECTION] Input

**Query Parameters:**
- `product_id`: String
- `date`: String (Format yyyy-MM-dd)

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": 1,
  "message": "message from server",
  "code": 200,
  "data": [
    {
      "campaignId": 55432,
      "bannerId": 12345
    }
  ]
}
```

---

### [SECTION] Error Codes
- 500 - Internal Server Error

---

## [FUNCTION] Get Domain Data
Label: [AdsController.getDomainData]

API: GET /data/domain

---

### [SECTION] Business Description
Lấy danh sách các domain và trạng thái active của domain đó trong hệ thống phân phối.

---

### [SECTION] Actor
- Delivery Engine

---

### [SECTION] Preconditions
- None

---

### [SECTION] Main Flow
1. Receive request at `/data/domain`.
2. Validate `product_id` parameter.
3. Call `ZoneDomainService.getDomainData(productID)`.
4. Query `tbl_cpc_domain`.
5. Return JSON list của `DomainResponse`.

---

### [SECTION] Business Rules
- Cung cấp danh sách các domain hợp lệ để Delivery biết có thể hiển thị ads trên domain nào.

---

### [SECTION] Side Effects
- Logging.

---

### [SECTION] Input

**Query Parameters:**
- `product_id`: String

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": 1,
  "message": "data size = 1",
  "code": 200,
  "data": [
    {
      "domain": "dantri.com.vn",
      "status": 1
    }
  ]
}
```

---

### [SECTION] Error Codes
- 500 - Internal Server Error

---

## [FUNCTION] Get Zone-Domain Mapping
Label: [AdsController.getZoneDomainData]

API: GET /data/zone-domain

---

### [SECTION] Business Description
Lấy danh sách ánh xạ giữa Zone (vị trí quảng cáo) và Domain tương ứng.

---

### [SECTION] Actor
- Delivery Engine

---

### [SECTION] Preconditions
- None

---

### [SECTION] Main Flow
1. Receive request at `/data/zone-domain`.
2. Validate `product_id` parameter.
3. Call `ZoneDomainService.getZoneDomainData(productID)`.
4. Query `tbl_cpc_zone_domain`.
5. Return JSON list của `ZoneDomainResponse`.

---

### [SECTION] Business Rules
- Mỗi Zone ID thuộc về một Domain nhất định. Delivery sử dụng dữ liệu này để xác định ngữ cảnh hiển thị.

---

### [SECTION] Side Effects
- Logging.

---

### [SECTION] Input

**Query Parameters:**
- `product_id`: String

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": 1,
  "message": "data size = 1",
  "code": 200,
  "data": [
    {
      "zoneId": 1234,
      "domain": "dantri.com.vn"
    }
  ]
}
```

---

### [SECTION] Error Codes
- 500 - Internal Server Error

---

## [FUNCTION] Get Domain Price Data
Label: [AdsController.getDomainPriceData]

API: GET /data/domain-price

---

### [SECTION] Business Description
Lấy danh sách các domain và giá base price tương ứng của chúng.

---

### [SECTION] Actor
- Delivery Engine

---

### [SECTION] Preconditions
- None

---

### [SECTION] Main Flow
1. Receive request at `/data/domain-price`.
2. Validate `product_id` parameter.
3. Call `ZoneDomainService.getDomainPriceData(productID)`.
4. Query `tbl_cpc_domain_price`.
5. Return JSON list của `DomainPriceResponse`.

---

### [SECTION] Business Rules
- Cung cấp dữ liệu giá base của domain cho Delivery Engine để tính toán chi phí thầu hoặc tính phí hiển thị.

---

### [SECTION] Side Effects
- Logging.

---

### [SECTION] Input

**Query Parameters:**
- `product_id`: String

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": 1,
  "message": "data size = 1",
  "code": 200,
  "data": [
    {
      "domain": "dantri.com.vn",
      "price": "3000.0"
    }
  ]
}
```

---

### [SECTION] Error Codes
- 500 - Internal Server Error

---

## [FUNCTION] System Ping
Label: [PingController.pingFunction]

API: GET /ping

---

### [SECTION] Business Description
Health check endpoint.

---

### [SECTION] Actor
- Monitoring Tool / Load Balancer

---

### [SECTION] Preconditions
- Service is up.

---

### [SECTION] Main Flow
1. Receive request at `/ping`.
2. Construct response with message "ping ok".
3. Return response.

---

### [SECTION] Business Rules
- Không chạm tới DB, chỉ kiểm tra logic application layer.

---

### [SECTION] Side Effects
- Có thể dùng làm heartbeat cho Kubernetes liveness/readiness probe.

---

### [SECTION] Input
**Query Parameters:** None

---

### [SECTION] Output

#### 200 - Successful
```json
{
  "status": 1,
  "message": "ping ok",
  "code": 200,
  "data": "ping ok"
}
```

---

### [SECTION] Error Codes
- N/A

---

# NOTES

- Each function should be **independent and self-contained**.
- Avoid duplicating logic across functions.
- This document is **human-readable**.
- For Spec-driven projects, convert this into:
    - openapi.json
    - rules.json
    - mapping.json
    - scenarios.json
    - test_cases.json

---

END OF DOCUMENT

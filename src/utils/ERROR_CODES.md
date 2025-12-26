# Error Codes Documentation

This document lists all error codes used in the application and their translations.

## Authentication Errors (AUTH_xxx)

| Error Code | English | Vietnamese |
|------------|---------|------------|
| AUTH_001 | User not found | Không tìm thấy người dùng |
| AUTH_002 | Account is locked | Tài khoản đã bị khóa |
| AUTH_003 | Email already exists | Email đã tồn tại |
| AUTH_004 | Invalid token | Token không hợp lệ |
| AUTH_005 | Invalid email or password | Email hoặc mật khẩu không đúng |
| AUTH_006 | Password too weak | Mật khẩu quá yếu |
| AUTH_007 | Account not verified | Tài khoản chưa được xác thực |
| AUTH_008 | Session expired | Phiên làm việc đã hết hạn |
| AUTH_009 | Unauthorized access | Truy cập không được phép |
| AUTH_010 | Current password is incorrect | Mật khẩu hiện tại không đúng |

## Validation Errors (VALIDATION_xxx)

| Error Code | English | Vietnamese |
|------------|---------|------------|
| VALIDATION_001 | Invalid input data | Dữ liệu đầu vào không hợp lệ |
| VALIDATION_002 | Required field is missing | Thiếu trường bắt buộc |
| VALIDATION_003 | Invalid email format | Định dạng email không hợp lệ |
| VALIDATION_004 | Invalid phone number format | Định dạng số điện thoại không hợp lệ |
| VALIDATION_005 | Password must be at least 8 characters | Mật khẩu phải có ít nhất 8 ký tự |

## Server Errors (SERVER_xxx)

| Error Code | English | Vietnamese |
|------------|---------|------------|
| SERVER_001 | Internal server error | Lỗi máy chủ nội bộ |
| SERVER_002 | Service temporarily unavailable | Dịch vụ tạm thời không khả dụng |
| SERVER_003 | Database connection error | Lỗi kết nối cơ sở dữ liệu |

## Network Errors (NETWORK_xxx)

| Error Code | English | Vietnamese |
|------------|---------|------------|
| NETWORK_001 | Network connection failed | Kết nối mạng thất bại |
| NETWORK_002 | Request timeout | Hết thời gian chờ yêu cầu |

## Generic Errors

| Error Code | English | Vietnamese |
|------------|---------|------------|
| UNKNOWN_ERROR | An unexpected error occurred | Đã xảy ra lỗi không mong muốn |

## Usage

### Adding New Error Codes

1. Add the error code to `src/i18n/config.ts` in both English and Vietnamese sections:

```typescript
// English
errors: {
  YOUR_ERROR_CODE: "Your error message in English",
}

// Vietnamese
errors: {
  YOUR_ERROR_CODE: "Thông báo lỗi của bạn bằng tiếng Việt",
}
```

2. Update this documentation file with the new error code.

### Using Error Handler

```typescript
import { getErrorMessage } from "@/utils/errorHandler";
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t } = useTranslation();
  
  try {
    // Your API call
  } catch (error) {
    const errorMessage = getErrorMessage(
      error, 
      t, 
      "Default fallback message"
    );
    // Display errorMessage to user
  }
};
```

### API Response Format

The backend should return errors in this format:

```json
{
  "success": false,
  "message": "Human readable message",
  "errorCode": "AUTH_005",
  "timestamp": "2025-12-12T06:21:08.4926625Z",
  "metadata": null
}
```

## Helper Functions

### `getErrorMessage(error, t, fallbackMessage)`

Extracts and translates error messages from API responses.

**Parameters:**
- `error`: Error object from API or RTK Query
- `t`: Translation function from i18next
- `fallbackMessage`: Default message if translation not found

**Returns:** Translated error message string

### `isErrorCode(error, code)`

Checks if error matches a specific error code.

**Parameters:**
- `error`: Error object
- `code`: Error code to check (e.g., "AUTH_005")

**Returns:** boolean

### `getErrorCode(error)`

Extracts error code from error object.

**Parameters:**
- `error`: Error object

**Returns:** Error code string or undefined

## Examples

### Example 1: Login Error

```typescript
// API Response
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "AUTH_005"
}

// User sees (in Vietnamese):
"Email hoặc mật khẩu không đúng"

// User sees (in English):
"Invalid email or password"
```

### Example 2: Validation Error

```typescript
// API Response
{
  "success": false,
  "message": "Password must be at least 8 characters",
  "errorCode": "VALIDATION_005"
}

// User sees (in Vietnamese):
"Mật khẩu phải có ít nhất 8 ký tự"

// User sees (in English):
"Password must be at least 8 characters"
```

### Example 3: Checking Specific Error

```typescript
import { isErrorCode } from "@/utils/errorHandler";

try {
  await changePassword({ currentPassword, newPassword });
} catch (error) {
  if (isErrorCode(error, "AUTH_010")) {
    // Handle incorrect current password specifically
    setFieldError("currentPassword", t("errors.AUTH_010"));
  } else {
    // Handle other errors
    setGeneralError(getErrorMessage(error, t));
  }
}
```












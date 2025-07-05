# API Documentation

# Auth Router

All routes in Auth are prefixed with `/auth` for example "/auth/signup".

---

## 📋 Routes Overview

| Method | Endpoint                       | Auth | Description                             |
| ------ | ------------------------------ | ---- | --------------------------------------- |
| POST   | `/signup`                      | ❌   | Create account & send verification code |
| POST   | `/login`                       | ❌   | Log in user and set JWT cookie          |
| POST   | `/forgot-password`             | ❌   | Send password reset email               |
| POST   | `/verify-email`                | ❌   | Verify email using 6-digit code         |
| GET    | `/password-reset-page/:token`  | ❌   | Render reset password form              |
| GET    | `/get-verification-code-again` | ❌   | Resend email verification code          |
| PATCH  | `/reset-password/:token`       | ❌   | Reset password using token              |
| POST   | `/logout`                      | ✅   | Log out (invalidate token)              |
| PATCH  | `/update-my-password`          | ✅   | Change user password                    |
| PATCH  | `/update-my-email`             | ✅   | Not implemented                         |
| DELETE | `/delete-me`                   | ✅   | Deactivate user account                 |

---

## 🛠️ Route Details

### POST `/auth/signup`

- **Body:**

```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890",
  "password": "password123",
  "passwordConfirm": "password123",
  "role": "pharmacy"
}
```

- **Errors:**  
  `field_missing_error`, `invalid_field_error`, `duplicated_field_error`, `validation_error`, `server_error`

---

### POST `/auth/login`

- **Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Errors:**  
  `field_missing_error`, `invalid_field_error`, `email_not_verified_error`

---

### POST `/auth/forgot-password`

- **Body:**

```json
{
  "email": "user@example.com"
}
```

- **Errors:**  
  Always returns success. If failure: `server_error`

---

### POST `/auth/verify-email`

- **Body:**

```json
{
  "emailVerificationCode": "123456"
}
```

- **Errors:**  
  `email_verification_error`, `server_error`

---

### GET `/auth/password-reset-page/:token`

- **Params:** `:token`
- **Errors:**  
  Renders error page if token is invalid

---

### GET `/auth/get-verification-code-again`

- **Body:**

```json
{
  "email": "user@example.com"
}
```

- **Errors:**  
  `field_missing_error`, `user_error`, `rate_limit_error`, `generic_error`

---

### PATCH `/auth/reset-password/:token`

- **Params:** `:token`
- **Body:**

```json
{
  "password": "newPass123",
  "passwordConfirm": "newPass123"
}
```

- **Errors:**  
  `invalid_token_error`, `validation_error`

---

### POST `/auth/logout`

- **Auth required**
- **Errors:**  
  `item_not_exist_error`

---

### PATCH `/auth/update-my-password`

- **Body:**

```json
{
  "currentPassword": "oldPass",
  "password": "newPass",
  "passwordConfirm": "newPass"
}
```

- **Errors:**  
  `field_missing_error`, `field_incorrect_error`, `validation_error`

---

### PATCH `/auth/update-my-email`

- ❌ Not implemented
- Returns `501 Not Implemented`

### DELETE `/auth/delete-me`

- **Auth required**
- **Errors:**  
  `item_not_exist_error`, `server_error`

---

# profile Router

All routes in profile are prefixed with `/profile` for example "/profile/update-me".

---

## 📋 Routes Overview

| Method | Endpoint              | Auth | Description                   |
| ------ | --------------------- | ---- | ----------------------------- |
| PATCH  | `/update-my-password` | ✅   | Change user info such as name |

---

### PATCH `/profile/update-me`

- **Body:**

```json
{
  "name": "example",
  "phoneNumber": "07709952717"
}
```

#### You can also use this path to update logo

- **Errors:**  
  `field_missing_error`, `field_incorrect_error`, `validation_error`

---

---

## ⚠️ Global Error Types

| Type                       | Status | Description                          |
| -------------------------- | ------ | ------------------------------------ |
| `validation_error`         | 400    | Mongoose validation fails            |
| `cast_error`               | 400    | Invalid MongoDB ID                   |
| `duplicated_field_error`   | 400    | Email or phone already taken         |
| `jwt_error`                | 401    | Token is invalid                     |
| `jwt_expired_error`        | 401    | Token has expired                    |
| `authentication_error`     | 401    | Not logged in                        |
| `field_missing_error`      | 400    | Required field is missing            |
| `field_incorrect_error`    | 401    | Incorrect password                   |
| `email_not_verified_error` | 400    | Email not verified                   |
| `permission_error`         | 403    | Forbidden (e.g., trying to be admin) |
| `rate_limit_error`         | 403    | Too many resend attempts             |
| `item_not_exist_error`     | 404    | User/profile not found               |
| `server_error`             | 500    | Unexpected server error              |
| `generic_error`            | 500    | Catch-all fallback                   |

---

## 🔧 Required `.env` Variables ask fot it i will send you .env files in a secure way

| Key              | Description                  |
| ---------------- | ---------------------------- |
| `JWT_SECRET`     | JWT signing key              |
| `JWT_EXP`        | Expiry (e.g., `90d`)         |
| `JWT_COOKIE_EXP` | Expiry in days (for cookies) |
| `NODE_ENV`       | `dev` or `prod`              |

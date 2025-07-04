#  API Documentation

## Auth Router

All routes in this Router are prefixed with `/auth`. for example /auth/signup

---

## Routes Overview

| Method | Endpoint                     | Auth | Description                            |
| ------ | ---------------------------- | ---- | -------------------------------------- |
| POST   | /signup                      | ❌   | Register user & send verification code |
| POST   | /login                       | ❌   | Login user                             |
| POST   | /forgot-password             | ❌   | Send password reset email              |
| POST   | /verify-email                | ❌   | Verify user's email                    |
| GET    | /password-reset-page/:token  | ❌   | Render password reset form             |
| GET    | /get-verification-code-again | ❌   | Resend email verification code         |
| PATCH  | /reset-password/:token       | ❌   | Reset password                         |
| POST   | /logout                      | ✅   | Log out user                           |
| PATCH  | /update-my-password          | ✅   | Change user password                   |
| PATCH  | /update-my-email             | ✅   | [Not implemented]                      |
| PATCH  | /update-my-phone-number      | ✅   | Update phone number                    |
| DELETE | /delete-me                   | ✅   | Soft delete account                    |

---

## Error Handling

The API uses a global error handler with categorized errors:

| Type                       | Status | Trigger                   |
| -------------------------- | ------ | ------------------------- |
| `validation_error`         | 400    | Mongoose validation fails |
| `cast_error`               | 400    | Invalid MongoDB ObjectId  |
| `duplicated_field_error`   | 400    | Duplicate email or phone  |
| `jwt_error`                | 401    | Invalid JWT token         |
| `jwt_expired_error`        | 401    | Expired JWT token         |
| `authentication_error`     | 401    | Missing or invalid auth   |
| `field_missing_error`      | 400    | Required fields missing   |
| `field_incorrect_error`    | 401    | Incorrect password        |
| `email_not_verified_error` | 400    | Email not verified        |
| `permission_error`         | 403    | Forbidden role or route   |
| `rate_limit_error`         | 403    | Too many attempts         |
| `item_not_exist_error`     | 404    | User/profile not found    |
| `server_error`             | 500    | Uncaught server issues    |

---

## Route-Specific Error Responses

### POST `/auth/signup`

- `field_missing_error`: Role not provided
- `invalid_field_error`: Invalid role
- `duplicated_field_error`: Email or phone already used
- `validation_error`: Password mismatch or validation fail
- `server_error`: Email send failure

### POST `/auth/login`

- `field_missing_error`: Missing email/password
- `invalid_field_error`: Incorrect email/password
- `email_not_verified_error`: Email not verified

### POST `/auth/forgot-password`

- Always returns success response, even if email doesn’t exist (timing-safe)
- `server_error`: Email send failed

### POST `/auth/verify-email`

- `email_verification_error`: Code invalid or expired
- `server_error`: Unexpected server issues

### GET `/auth/password-reset-page/:token`

- Renders `reset_password` view with error if token is invalid
- Renders `invalid_reset_token` view if user not found

### GET `/auth/get-verification-code-again`

- `field_missing_error`: No email provided
- `user_error`: Email already verified
- `rate_limit_error`: >3 attempts within an hour
- `generic_error`: Profile not found or unknown error

### PATCH `/auth/reset-password/:token`

- `invalid_token_error`: Token expired/invalid
- `validation_error`: New password invalid

### POST `/auth/logout`

- `item_not_exist_error`: User not found

### PATCH `/auth/update-my-password`

- `field_missing_error`: Required fields missing
- `field_incorrect_error`: Current password is wrong

### PATCH `/auth/update-my-email`

- Always returns `501` - Not Implemented

### PATCH `/auth/update-my-phone-number`

- `wrong_path_error`: Attempted to change email/password
- `permission_error`: Attempted admin role change

### DELETE `/auth/delete-me`

- `item_not_exist_error`: User not found
- `server_error`: Profile update failure

---

## Additional Features

- JWT stored in HTTP-only cookie
- Role-based user profile models
- SHA-hashed email/password reset tokens
- Secure delays on sensitive responses
- Environment-based error output

## Required Environment Variables

- `JWT_SECRET`
- `JWT_EXP`
- `JWT_COOKIE_EXP`
- `NODE_ENV` (use `prod` for secure cookies)

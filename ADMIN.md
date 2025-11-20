# Admin Panel Setup

The admin panel allows designated users to view and manage all API endpoints in the system.

## Quick Start

### 1. Set Admin Email(s)

Add the `ADMIN_EMAILS` environment variable with comma-separated emails:

**Local Development** (`.env`):
```bash
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

**Production** (Railway):
1. Go to your backend service settings
2. Add environment variable:
   - **Name**: `ADMIN_EMAILS`
   - **Value**: `admin@example.com,admin2@example.com`
3. Redeploy the backend service

### 2. Access the Admin Panel

1. Sign in with an admin email
2. Click your profile icon (top right)
3. Click **"Admin Panel"**
4. You'll be redirected to `/admin`

If you're not an admin, you'll get a 403 Forbidden error and be redirected to the home page.

## Features

### Dashboard Statistics
- Total APIs created
- Authenticated vs. Unauthenticated breakdown
- User count
- APIs created today/this week
- Language distribution (JavaScript/Python)
- APIs expiring soon (next 24 hours)

### Endpoint Management
- **View all endpoints** with detailed information
- **Filter by**:
  - Authentication type (authenticated/unauthenticated/all)
  - Language (JavaScript/Python/all)
  - Search by code, name, or email
- **Sort by**:
  - Creation date
  - Expiration date
- **Actions**:
  - View full code for any endpoint
  - Delete unauthenticated endpoints (one-click)
  - Bulk delete multiple endpoints at once
- **Pagination**: Browse through all endpoints (50 per page)

### Security
- **AuthGuard**: Ensures user is authenticated
- **AdminGuard**: Verifies user's email is in `ADMIN_EMAILS`
- All admin actions are logged with admin email
- Unauthenticated users cannot access `/api/admin/*` endpoints
- Non-admin users are automatically redirected from `/admin` page

## Admin API Endpoints

All endpoints require authentication and admin access:

### GET `/api/admin/stats`
Returns dashboard statistics.

**Response**:
```json
{
  "totalEndpoints": 42,
  "authenticatedEndpoints": 30,
  "unauthenticatedEndpoints": 12,
  "totalUsers": 15,
  "endpointsCreatedToday": 5,
  "endpointsCreatedThisWeek": 18,
  "javascriptCount": 25,
  "pythonCount": 17,
  "expiringSoon": 3
}
```

### GET `/api/admin/endpoints`
List all endpoints with filtering and pagination.

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 50, max: 100)
- `authType` (string: `all`, `authenticated`, `unauthenticated`)
- `language` (string: `all`, `javascript`, `python`)
- `search` (string: search in code, name, email)
- `sortBy` (string: `createdAt`, `expiresAt`)
- `sortOrder` (string: `asc`, `desc`)

**Response**:
```json
{
  "endpoints": [
    {
      "id": "abc123...",
      "language": "javascript",
      "kind": "direct",
      "code": "export default async (req) => { ... }",
      "name": "My API",
      "description": "Does something cool",
      "organizationId": "org123" or null,
      "userEmail": "user@example.com" or null,
      "createdAt": "2025-11-20T12:00:00Z",
      "expiresAt": "2025-11-21T12:00:00Z",
      "ttlHours": 24
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

### DELETE `/api/admin/endpoints/:id`
Delete a single endpoint.

**Response**: 204 No Content

### POST `/api/admin/endpoints/bulk-delete`
Delete multiple endpoints at once.

**Request Body**:
```json
{
  "endpointIds": ["abc123", "def456", "ghi789"]
}
```

**Response**:
```json
{
  "success": true,
  "deletedCount": 3
}
```

## Architecture

### Backend Components
- **`AdminGuard`** (`backend/src/auth/guards/admin.guard.ts`): NestJS guard that checks if user email is in `ADMIN_EMAILS`
- **`AdminService`** (`backend/src/admin/admin.service.ts`): Business logic for stats, listing, and deletion
- **`AdminController`** (`backend/src/admin/admin.controller.ts`): REST API endpoints
- **`AdminModule`** (`backend/src/admin/admin.module.ts`): NestJS module that ties everything together

### Frontend Components
- **`/admin` page** (`frontend/pages/admin.vue`): Full admin dashboard with stats, filtering, and actions

## Troubleshooting

### "Admin access required" error
- Check that your email exactly matches an email in `ADMIN_EMAILS`
- Emails are case-insensitive
- Make sure there are no extra spaces in the environment variable
- Restart the backend after changing `ADMIN_EMAILS`

### Admin link not showing
- The admin link always shows in the user menu
- If you're not an admin, clicking it will redirect you to home with a 403 error
- This is intentional - we don't expose who is/isn't an admin on the frontend

### Can't delete authenticated endpoints
- This is by design - only unauthenticated (anonymous) endpoints can be deleted
- Authenticated endpoints belong to organizations and should be managed by their owners

## Adding More Admins

Just add their email to the `ADMIN_EMAILS` environment variable:

```bash
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

No database changes or code deployments needed!

## Security Best Practices

1. **Use work/organization emails** - Don't use personal emails for admin access
2. **Rotate admin list regularly** - Remove employees who leave
3. **Monitor logs** - Admin actions are logged with emails
4. **Limit admin count** - Only give admin access to those who need it
5. **Use strong authentication** - Admins should use secure passwords and 2FA (if enabled)

---

**Built with ❤️ by Treadie, Inc.**


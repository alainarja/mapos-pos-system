# MAPOS POS Integration Guide

## Overview
The MAPOS POS system integrates with the MaposUsers authentication service for dynamic user authentication and PIN management.

## Authentication Methods

### 1. Email/Password Login
- Standard email and password authentication
- Validates credentials against MaposUsers service
- Returns JWT tokens for session management

### 2. PIN Authentication
- Supports 4-digit PIN authentication
- PINs are dynamically retrieved from MaposUsers service
- Supports both dedicated PIN hashes and numeric passwords as PINs
- Automatically checks POS permissions before allowing access

## Configuration

### Environment Variables

#### POS System (.env.local)
```env
MAPOS_USERS_API_URL=http://localhost:3004
MAPOS_USERS_API_KEY=development_mapos_users_key
```

#### MaposUsers Service (.env.local)
```env
EXTERNAL_API_KEY=development_mapos_users_key
```

## How PIN Authentication Works

1. **User Entry**: User enters 4-digit PIN on POS device
2. **API Request**: POS sends PIN to MaposUsers external API
3. **User Lookup**: MaposUsers searches all active users with `pin_enabled: true`
4. **PIN Verification**: 
   - First checks against user's `pin_hash` if available
   - Falls back to checking against `password_hash` for numeric passwords
5. **Permission Check**: Verifies user has POS access permissions
6. **Token Generation**: Returns JWT tokens for authenticated session

## Supported User Roles

### POS Manager
- Full POS access including reports and administration
- Permissions: `pos.*`, `sales.*`, `inventory.view`, `crm.view`

### POS Cashier  
- Basic POS operations for sales transactions
- Permissions: `pos.view`, `pos.basic`, `sales.view`

## Development vs Production

### Development Mode
- Falls back to mock authentication when MaposUsers API is unavailable
- Limited test PINs: `1234` (manager), `5678` (cashier)
- Displays warning messages about mock authentication

### Production Mode
- Requires full MaposUsers service integration
- All PINs dynamically managed through MaposUsers database
- Real JWT token validation and session management

## Testing Integration

Run the integration test script:
```bash
node test-pin-integration.js
```

This tests both password and PIN authentication against the MaposUsers API.

## Security Features

- **API Key Authentication**: External API calls require valid API key
- **JWT Tokens**: Secure token-based session management
- **Permission Validation**: Role-based access control
- **PIN Encryption**: All PINs stored as bcrypt hashes
- **Account Lockout**: Failed attempt tracking and temporary lockouts
- **Active User Check**: Only active, verified users can authenticate

## Database Requirements

MaposUsers service requires the following database schema:
- `auth_users` table with PIN support fields (`pin_hash`, `pin_enabled`)
- `auth_roles` table with POS permission definitions
- Migration 009 (PIN authentication) must be applied

## Migration from Hardcoded PINs

The system has been updated to remove hardcoded PIN mappings and now relies entirely on the MaposUsers service for dynamic PIN management. This provides:

- **Centralized Management**: All user authentication managed in one place
- **Real-time Updates**: PIN changes immediately available across all POS devices
- **Security**: No hardcoded credentials in source code
- **Scalability**: Support for unlimited users and dynamic role assignment
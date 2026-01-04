# Database

## Schemas

- `flyway`: used for storing Flyway's schema history table
- `app`: store app tables 

The `public` schema is not used as all users have `USAGE` permission on it by default.

When `app` gets big, consider creating multiple schemas for decomposition.



# Security

Consider not using `public` schema, which all users have `USAGE` permission.

## Users (Login Roles)
There are three users (login roles).

- `superuser`
- flyway
- app

When app gets big, consider creating multiple users for different modules, each with limited permissions on certain schemas, tables.

### Flyway

```sql
CREATE ROLE flyway LOGIN PASSWORD :'flyway_user_pwd';
GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO flyway;
GRANT USAGE, CREATE ON SCHEMA public TO flyway;
```

### App

| Scope                | Object     | Privileges                             | Notes                                                        |
| -------------------- | ---------- | -------------------------------------- | ------------------------------------------------------------ |
| Role                 | `app`      | `LOGIN`, `NOINHERIT`                   | Can authenticate, does not automatically inherit other roles |
| Database             | `postgres` | `CONNECT`                              | Can connect to the database                                  |
| Schema               | `public`   | `USAGE`                                | Can see and reference objects in schema                      |
| Tables (existing)    | `public.*` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Read/write data in all current tables                        |
| Tables (future)      | `public.*` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Auto-granted when created by `flyway`                        |
| Sequences (existing) | `public.*` | `USAGE`, `SELECT`                      | Can use sequences (e.g. SERIAL / IDENTITY)                   |
| Sequences (future)   | `public.*` | `USAGE`, `SELECT`                      | Auto-granted when created by `flyway`                        |
| Schema DDL           | `public`   | ❌ none                                 | Cannot CREATE / ALTER / DROP objects                         |
| Tables DDL           | `public.*` | ❌ none                                 | Cannot ALTER / DROP tables                                   |
| Functions            | `public.*` | ❌ none                                 | Cannot CREATE or EXECUTE unless explicitly granted           |
| Other schemas        | any        | ❌ none                                 | No visibility or access                                      |

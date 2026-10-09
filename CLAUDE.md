# Backend — NestJS Project

## Tech Stack
- Framework : NestJS (Node.js)
- ORM       : Prisma
- Database  : PostgreSQL (local, pgAdmin4)
- Auth      : JWT with passport-jwt
- Validation: class-validator, class-transformer

## Folder Structure
src/
├── common/
│   ├── decorators/    (roles.decorator.ts, current-user.decorator.ts)
│   ├── guards/        (jwt-auth.guard.ts, roles.guard.ts)
│   ├── filters/       (http-exception.filter.ts)
│   ├── interceptors/  (response.interceptor.ts)
│   └── enums/         (role.enum.ts)
├── config/            (jwt.config.ts)
├── prisma/            (prisma.service.ts, prisma.module.ts)
├── auth/              (login module)
├── users/             (user CRUD module)
├── app.module.ts
└── main.ts

## Database — User Model
model User {
  id            Int       @id @default(autoincrement())
  username      String    @unique
  password      String    (bcrypt hashed, cost factor 12)
  name          String
  role          Role      (OWNER | STAFF | OUTSIDER)
  designation   String?
  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  last_login_at DateTime?
}

## Coding Rules
- Every route must have proper DTO with class-validator decorators
- Passwords must always be hashed with bcrypt 
- Never return password field in any response
- Use select: {} in Prisma queries to exclude sensitive fields
- All protected routes must use JwtAuthGuard + RolesGuard
- Services handle business logic, controllers only handle HTTP

## API Conventions
- Global prefix: /api
- Response format: { data, message, statusCode }
- Errors: handled by global exception filter

## Environment Variables
DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN
(never hardcode these, always use process.env)

## Commands
- Start dev server : npm run start:dev
- Run migration    : npx prisma migrate dev
- Open Prisma UI   : npx prisma studio
- Seed database    : npx prisma db seed
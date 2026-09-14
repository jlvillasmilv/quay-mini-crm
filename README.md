# Quay Mini CRM

Quay Mini CRM es un sistema backend ligero para la gestión de clientes y relaciones comerciales desarrollado con **NestJS** (v11) y **MariaDB** (TypeORM).

---

## 🛠️ Tech Stack & Features

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database**: MariaDB via [TypeORM](https://typeorm.io/)
- **Authentication**: JWT Stateless Strategy + Passport + Local Strategy
- **Validation**: Global `ValidationPipe` with `class-validator` & `class-transformer`
- **Mail System**: In-memory asynchronous queue (`@nestjs/event-emitter`) + `@nestjs-modules/mailer` with Handlebars templates
- **Pagination**: `nestjs-paginate`

---

## 📁 Modules Overview

| Module | Description |
|---|---|
| **Auth** | User authentication, email verification, password reset, and JWT profile management. |
| **Users** | User management with role assignment (Many-to-Many), soft delete, and pagination. |
| **Accounts** | Customer accounts management for business/CRM entities. |
| **Contacts** | Contact persons linked to customer accounts. |
| **Mail** | Async queued email sender using Handlebars templates (`verification`, `reset-password`). |
| **Database** | TypeORM DataSource configuration, seeders (`Roles`, `Permissions`, `Admin`), and migrations. |

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (MariaDB)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=quay_mini_crm

# JWT Secrets
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRATION=1h
PASSWORD_RESET_SECRET=super_secret_reset_key
EMAIL_VERIFICATION_SECRET=super_secret_verify_key

# Mailer SMTP Configuration
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mail_user
MAIL_PASSWORD=your_mail_password
```

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Database Migrations

Run database migrations to generate tables:

```bash
# Run pending migrations
npm run migration:run

# Generate a new migration (automatically saved in src/database/migrations/)
npm run migration:generate -- <MigrationName>

# Revert last migration
npm run migration:revert
```

### 3. Database Seeding

Initial seeds create roles (`admin`, `manager`, `sales`), permissions, and the default admin user.

To enable seeds on startup, uncomment `SeedModule` in `src/app.module.ts`:

```typescript
// src/app.module.ts
imports: [
  // ...
  SeedModule,
]
```

### 4. Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

---

## 📧 Async Email Queue

Emails sent during user registration, email verification resend, and password recovery are processed using an **in-memory async queue** (`@nestjs/event-emitter`).

- **Non-blocking**: HTTP requests return immediately without waiting for SMTP transport.
- **Resilience**: Failed email deliveries are retried up to 3 times automatically.
- **Rate-limiting**: Built-in delay between emails to avoid hitting SMTP provider limits.

---

## 🗺️ Roadmap & Future Modules

- **Leads**: Lead acquisition, statuses (new, contacted, qualified, lost).
- **Deals / Pipeline**: Sales pipeline management and opportunity tracking.
- **Orders & Invoicing**: Order status tracking and PDF invoice generation.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions guard using `users_roles` and `roles_permissions`.

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

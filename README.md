# 📝 Blog REST API - NestJS TypeScript

A simple Blog REST API built with **NestJS** and **TypeScript** using **Layered Architecture** pattern. Features full CRUD operations for **Users** and **Posts** with **JWT Authentication** and **Swagger** API documentation.

## 🏗️ Architecture Pattern: Layered Architecture

### Mengapa Layered Architecture?

Saya memilih **Layered Architecture** (juga dikenal sebagai N-Tier Architecture) untuk project ini karena beberapa alasan:

#### 1. **Separation of Concerns (SoC)**
Setiap layer memiliki tanggung jawab yang jelas dan terpisah:

```
┌─────────────────────────────────────────┐
│          Controller Layer               │  ← Menangani HTTP request/response
│    (auth, users, posts controllers)     │
├─────────────────────────────────────────┤
│           Service Layer                 │  ← Business logic & validasi
│    (auth, users, posts services)        │
├─────────────────────────────────────────┤
│         Data Access Layer               │  ← Interaksi dengan database
│   (TypeORM Repository + Entities)       │
├─────────────────────────────────────────┤
│          Database Layer                 │  ← MySQL database
│           (blog_api)                    │
└─────────────────────────────────────────┘
```

#### 2. **Maintainability (Mudah Dipelihara)**
- Jika ada perubahan business logic, cukup ubah di **Service Layer** tanpa menyentuh Controller atau Entity.
- Jika ingin mengganti database (misal dari MySQL ke PostgreSQL), cukup ubah konfigurasi di **Data Access Layer**.
- Jika ingin mengubah format response API, cukup ubah di **Controller Layer**.

#### 3. **Testability (Mudah Diuji)**
- Setiap layer bisa diuji secara independen (unit testing).
- Service layer bisa di-mock saat testing controller.
- Repository bisa di-mock saat testing service.

#### 4. **Readability & Onboarding  (Mudah Dipahami)**
- Developer baru bisa dengan mudah memahami flow aplikasi karena struktur yang terorganisir.
- Setiap module (auth, users, posts) memiliki struktur yang konsisten.

#### 5. **Cocok untuk Skala Project Ini**
- Untuk REST API sederhana dengan beberapa CRUD operations, layered architecture menawarkan keseimbangan antara kesederhanaan dan organisasi kode.
- Tidak terlalu complex seperti Hexagonal Architecture atau Clean Architecture, tapi juga tidak terlalu sederhana seperti monolithic single-file approach.

### Struktur Project

```
src/
├── main.ts                          # Entry point, Swagger setup
├── app.module.ts                    # Root module
│
├── auth/                            # Authentication module
│   ├── auth.module.ts               # Module configuration
│   ├── auth.controller.ts           # Controller Layer - HTTP endpoints
│   ├── auth.service.ts              # Service Layer - Auth business logic
│   ├── dto/                         # Data Transfer Objects
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts        # JWT authentication guard
│   └── strategies/
│       └── jwt.strategy.ts          # Passport JWT strategy
│
├── users/                           # Users module
│   ├── users.module.ts              # Module configuration
│   ├── users.controller.ts          # Controller Layer - HTTP endpoints
│   ├── users.service.ts             # Service Layer - User business logic
│   ├── dto/                         # Data Transfer Objects
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── entities/
│       └── user.entity.ts           # Data Access Layer - User entity
│
└── posts/                           # Posts module
    ├── posts.module.ts              # Module configuration
    ├── posts.controller.ts          # Controller Layer - HTTP endpoints
    ├── posts.service.ts             # Service Layer - Post business logic
    ├── dto/                         # Data Transfer Objects
    │   ├── create-post.dto.ts
    │   └── update-post.dto.ts
    └── entities/
        └── post.entity.ts           # Data Access Layer - Post entity
```

## 🔗 Entity Relationship

```
┌──────────────┐       ┌──────────────┐
│    Users     │       │    Posts      │
├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │
│ username     │  │    │ title        │
│ email        │  │    │ content      │
│ password     │  └───>│ authorId(FK) │
│ bio          │       │ published    │
│ createdAt    │       │ createdAt    │
│ updatedAt    │       │ updatedAt    │
└──────────────┘       └──────────────┘
     1          :          Many
```

- **User** memiliki banyak **Post** (One-to-Many)
- **Post** dimiliki oleh satu **User/Author** (Many-to-One)
- Ketika User dihapus, semua Post miliknya akan ikut terhapus (CASCADE)

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| NestJS | Framework backend |
| TypeScript | Type-safe JavaScript |
| TypeORM | ORM (Object-Relational Mapping) |
| MySQL | Database SQL |
| Passport + JWT | Authentication |
| bcrypt | Password hashing |
| class-validator | DTO validation |
| Swagger | API documentation |
| Jest + Supertest | E2E testing |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm
- MySQL Server (running on `localhost:3306`)

### Database Setup

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE blog_api;
```

Atau sesuaikan konfigurasi di `src/app.module.ts` / environment variables:

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | _(empty)_ | MySQL password |
| `DB_NAME` | `blog_api` | Database name |

### Installation

```bash
# Clone repository
git clone <repository-url>
cd internship

# Install dependencies
npm install
```

### Running the App

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Aplikasi akan berjalan di `http://localhost:3000`

### 📚 API Documentation (Swagger)

Setelah menjalankan aplikasi, buka browser dan akses:

```
http://localhost:3000/api/docs
```

Swagger UI menyediakan dokumentasi interaktif dimana Anda bisa langsung mencoba semua endpoint.

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user baru | ❌ |
| POST | `/api/auth/login` | Login & dapatkan JWT token | ❌ |
| GET | `/api/auth/profile` | Get profil user saat ini | ✅ |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | Get semua users | ❌ |
| GET | `/api/users/:id` | Get user by ID (+ posts) | ❌ |
| PATCH | `/api/users/:id` | Update user | ✅ |
| DELETE | `/api/users/:id` | Delete user | ✅ |

### Posts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/posts` | Buat post baru | ✅ |
| GET | `/api/posts` | Get semua published posts | ❌ |
| GET | `/api/posts/my-posts` | Get posts milik sendiri | ✅ |
| GET | `/api/posts/:id` | Get post by ID | ❌ |
| PATCH | `/api/posts/:id` | Update post (author only) | ✅ |
| DELETE | `/api/posts/:id` | Delete post (author only) | ✅ |

## 🔐 Authentication Flow

1. **Register** - `POST /api/auth/register` → Mendapatkan `access_token`
2. **Login** - `POST /api/auth/login` → Mendapatkan `access_token`
3. **Gunakan Token** - Tambahkan header: `Authorization: Bearer <access_token>`

### Contoh Request dengan Token

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"password123"}'

# Create Post (with token)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My First Post","content":"This is the content of my blog post.","published":true}'
```

## 🧪 Testing

### E2E Tests

E2E tests mencakup:
- ✅ Registrasi user (sukses & validasi error)
- ✅ Login (sukses & gagal)
- ✅ JWT token validation (valid, invalid, missing, malformed)
- ✅ CRUD Posts dengan autentikasi
- ✅ CRUD Users dengan autentikasi
- ✅ Ownership validation (user tidak bisa edit/delete post milik user lain)
- ✅ Cross-entity relationship tests

```bash
# Run E2E tests
npm run test:e2e

# Run unit tests
npm run test
```

## 📄 License

UNLICENSED

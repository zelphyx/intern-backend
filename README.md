# Blog REST API

Blog API sederhana pakai NestJS + TypeScript. Ada fitur CRUD Users & Posts, autentikasi JWT, dan dokumentasi Swagger.

## Kenapa Pakai Layered Architecture?

supaya kodenya rapi dan gampang di-maintain.

Setiap bagian punya tanggung jawab sendiri-sendiri:

```
Controller Layer    =  handle request/response HTTP
Service Layer       =  business logic & validasi
Data Access Layer   =  komunikasi ke database (TypeORM)
Database            =  MySQL
```

misalkan saya ingin ganti logic bisnis, saya hanya perlu ubah di bagian service aja, controller tidak perlu disentuh. Mau ganti database hanya perlu ubah config di data access layer. Intinya tiap layer bisa diubah tanpa ngaruh ke layer lain.

Selain itu pattern ini juga mempermudah testing, service bisa di-mock waktu test controller, repository bisa di-mock waktu test service.

Untuk skala project ini, layered architecture sudah cukup. 

## Struktur Project

```
src/
├── main.ts                        # Entry point + Swagger config
├── app.module.ts                  # Root module
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── entities/
│       └── user.entity.ts
└── posts/
    ├── posts.module.ts
    ├── posts.controller.ts
    ├── posts.service.ts
    ├── dto/
    │   ├── create-post.dto.ts
    │   └── update-post.dto.ts
    └── entities/
        └── post.entity.ts
```

## Entity Relationship

```
Users                    Posts
──────────────           ──────────────
id (PK)         ──┐      id (PK)
username          │      title
email             │      content
password          └────► authorId (FK)
bio                      published
createdAt                createdAt
updatedAt                updatedAt
```

Relasi: 1 User memiliki banyak Post. Kalau user dihapus, post-nya ikut kehapus (cascade).

## Tech Stack

- **NestJS** — framework backend
- **TypeScript** — supaya type-safe
- **TypeORM** — ORM buat mapping ke database
- **MySQL** — database
- **Passport + JWT** — auth
- **bcrypt** — hash password
- **class-validator** — validasi DTO
- **Swagger** — dokumentasi API 
- **Jest + Supertest** — testing





## License

UNLICENSED

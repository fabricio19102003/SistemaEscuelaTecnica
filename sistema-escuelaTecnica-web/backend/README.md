# 🎓 Sistema de Información Académica - Backend

Backend del Sistema de Información Académica para cursos de inglés, desarrollado con Node.js, Express, TypeScript, Prisma ORM y MySQL.

## 📋 Requisitos Previos

- Node.js >= 18.x
- MySQL >= 8.0
- npm o yarn

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/sistema_escuela_tecnica"
JWT_SECRET=tu_clave_secreta_aqui
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 3. Configurar la base de datos

#### Crear la base de datos

```sql
CREATE DATABASE sistema_escuela_tecnica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Generar el cliente de Prisma

```bash
npm run prisma:generate
```

#### Ejecutar migraciones

```bash
npm run prisma:migrate
```

#### (Opcional) Poblar con datos de ejemplo

```bash
npm run prisma:seed
```

## 🏃‍♂️ Ejecutar el proyecto

### Modo desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

### Modo producción

```bash
npm run build
npm start
```

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Ejecuta el servidor en modo desarrollo con hot-reload |
| `npm run build` | Compila el proyecto TypeScript a JavaScript |
| `npm start` | Ejecuta el servidor en producción |
| `npm run prisma:generate` | Genera el cliente de Prisma |
| `npm run prisma:migrate` | Ejecuta migraciones pendientes |
| `npm run prisma:migrate:deploy` | Ejecuta migraciones en producción |
| `npm run prisma:studio` | Abre Prisma Studio (GUI para la BD) |
| `npm run prisma:seed` | Ejecuta el seed de datos |
| `npm run prisma:reset` | Resetea la base de datos |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Formatea el código con Prettier |
| `npm run test` | Ejecuta las pruebas |

## 🗂️ Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma          # Esquema de Prisma ORM
│   ├── migrations/            # Migraciones de base de datos
│   └── seeds/                 # Scripts de seed
├── src/
│   ├── config/               # Configuraciones (BD, JWT, Cloudinary)
│   ├── controllers/          # Controladores de rutas
│   ├── middlewares/          # Middlewares (auth, validación, error handling)
│   ├── routes/               # Definición de rutas
│   ├── services/             # Lógica de negocio
│   ├── types/                # Tipos y DTOs de TypeScript
│   ├── utils/                # Utilidades y helpers
│   └── index.ts              # Punto de entrada de la aplicación
├── uploads/                  # Archivos subidos temporalmente
├── .env.example              # Ejemplo de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación:

- **Access Token**: Expira en 7 días (configurable)
- **Refresh Token**: Expira en 30 días (configurable)

### Endpoints de autenticación:

```
POST /api/auth/login          # Iniciar sesión
POST /api/auth/register       # Registrar usuario
POST /api/auth/refresh        # Refrescar token
POST /api/auth/logout         # Cerrar sesión
POST /api/auth/forgot-password # Recuperar contraseña
POST /api/auth/reset-password  # Resetear contraseña
```

## 🛡️ Roles y Permisos

El sistema implementa RBAC (Role-Based Access Control):

- **ADMIN**: Acceso total al sistema
- **TEACHER**: Gestión de grupos, asistencias y calificaciones
- **STUDENT**: Acceso a sus datos académicos
- **GUARDIAN**: Acceso a datos de estudiantes vinculados

## 📊 Modelo de Base de Datos

El sistema incluye las siguientes entidades principales:

### Gestión de Usuarios
- User
- Role
- UserRole

### Actores
- Student
- Guardian
- Teacher

### Estructura Académica
- Course
- Level
- Group
- Schedule

### Procesos Académicos
- Enrollment
- Attendance
- Grade
- ReportCard
- Certificate

### Gestión Financiera
- Invoice
- PaymentRecord
- DebtRecord
- CashRegister
- CashFlow

### Convenios
- School
- Agreement

### Notificaciones
- NotificationEmailLog

## 🔧 Configuración de MySQL

### Configuración recomendada en `my.cnf` o `my.ini`:

```ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
max_connections=200
innodb_buffer_pool_size=1G
innodb_log_file_size=256M
```

### Crear usuario de base de datos:

```sql
CREATE USER 'escuela_user'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT ALL PRIVILEGES ON sistema_escuela_tecnica.* TO 'escuela_user'@'localhost';
FLUSH PRIVILEGES;
```

## 📝 Migraciones

### Crear nueva migración

```bash
npm run prisma:migrate -- --name nombre_migracion
```

### Ver estado de migraciones

```bash
npx prisma migrate status
```

## 🧪 Testing

El proyecto está configurado para usar Jest:

```bash
npm run test              # Ejecutar todos los tests
npm run test:watch        # Ejecutar en modo watch
npm run test:coverage     # Generar reporte de cobertura
```

## 🌐 API Endpoints

La documentación completa de la API está disponible en:

```
http://localhost:3000/api/docs
```

## 📦 Dependencias Principales

- **Express**: Framework web
- **Prisma**: ORM para MySQL
- **TypeScript**: Lenguaje tipado
- **JWT**: Autenticación basada en tokens
- **bcrypt**: Hash de contraseñas
- **Cloudinary**: Almacenamiento de imágenes
- **Multer**: Manejo de uploads
- **Zod**: Validación de schemas
- **Nodemailer**: Envío de emails

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT con expiración configurable
- Rate limiting en endpoints sensibles
- Helmet para headers de seguridad
- CORS configurado
- Validación de inputs con Zod
- Sanitización de datos

## 📈 Monitoreo y Logs

Los logs se gestionan con Morgan:

- Desarrollo: formato `dev`
- Producción: formato `combined`

## 🚀 Despliegue

### Variables de entorno en producción:

```env
NODE_ENV=production
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_SECRET=clave_super_segura_generada_aleatoriamente
```

### Comandos de despliegue:

```bash
npm run build
npm run prisma:migrate:deploy
npm start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo de Desarrollo

- Backend Developer
- Database Administrator
- DevOps Engineer

## 📞 Soporte

Para soporte técnico, contactar a: [email de soporte]

---

Desarrollado con ❤️ para la gestión académica eficiente.

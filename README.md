# CampusFind — Lost & Found Portal

> A centralized campus Lost & Found platform that helps students and faculty report, search, match, and claim lost items.

[![Repository](https://img.shields.io/badge/GitHub-CampusFind-181717?logo=github)](https://github.com/Pratyakshgupta887qwert/CampusFind-Lost-Found-Portal)
[![PRD](https://img.shields.io/badge/PRD-CampusFind-4285F4?logo=readthedocs&logoColor=white)](https://gist.github.com/Pratyakshgupta887qwert/7749c9b13acb01637be61ba3693b3b73)

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-512BD4?logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?logo=csharp&logoColor=white)
![.NET 10](https://img.shields.io/badge/.NET_10-512BD4?logo=dotnet&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Entity Framework Core](https://img.shields.io/badge/EF_Core-512BD4?logo=dotnet&logoColor=white)
![SignalR](https://img.shields.io/badge/SignalR-512BD4?logo=dotnet&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black)

## Overview

CampusFind is a full-stack web application designed to simplify the process of reporting and recovering lost belongings on a college or university campus.

The platform replaces fragmented communication through WhatsApp groups, Telegram groups, social media, notice boards, and word-of-mouth communication with a centralized digital system. Users can report lost items, search for found items, and connect with the right owners through a structured claim process.

The application is built with a React and Vite frontend and an ASP.NET Core Web API backend. It uses PostgreSQL for data storage, Entity Framework Core for database access, JWT for authentication, and SignalR for real-time notifications.

---

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Protected frontend routes
- Secure password hashing
- User profile management
- Authorization for protected operations

### Lost Items

- Report lost belongings
- Add item title and description
- Provide category and location details
- Add date and time information
- Upload item images
- Browse lost-item listings
- Manage personal reports

### Found Items

- Report items found on campus
- Add item details and descriptions
- Provide found location and date
- Upload item images
- Browse found-item listings
- Help owners identify their belongings

### Matching

- Compare lost and found item information
- Support for potential item matches
- Matching service architecture
- Foundation for future AI-powered matching

### Claims

- Submit ownership claims
- Support for claim management
- Review and verification workflow
- Foundation for administrator moderation

### Notifications

- Notification service
- Real-time notification infrastructure
- SignalR notification hub
- Notification support for matches, claims, and status updates

### Other Features

- Dashboard service
- Admin controller
- Reports controller
- Swagger/OpenAPI documentation
- PostgreSQL database integration
- Automatic Entity Framework Core migrations
- Cloudinary image-storage service
- Centralized exception middleware
- CORS support for frontend development

---

## Application Pages

The current frontend includes the following pages:

- Home
- Login
- Register
- Lost Items
- Found Items
- Report Lost Item
- Report Found Item
- Profile
- My Posts

Public routes include:

```text
/
 /login
 /register
 /lost-items
 /found-items
```

Protected routes include:

```text
/report-lost
/report-found
/profile
/my-posts
```

Protected routes require an authenticated user. Unauthenticated users are redirected to the login page.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- React Router
- Tailwind CSS
- Axios
- SignalR JavaScript Client
- Lucide React

### Backend

- ASP.NET Core Web API
- C#
- .NET 10
- Entity Framework Core
- Npgsql
- JWT Bearer Authentication
- BCrypt password hashing
- Swagger/OpenAPI
- SignalR
- Cloudinary

### Database and Storage

- PostgreSQL
- Neon PostgreSQL
- Entity Framework Core migrations
- Cloudinary image storage

---

## System Architecture

```text
┌─────────────────────────────┐
│        React Frontend       │
│          Vite + JS          │
└──────────────┬──────────────┘
                │
                │ HTTP REST API
                │ SignalR
                ▼
┌─────────────────────────────┐
│      ASP.NET Core API       │
│            C#               │
├─────────────────────────────┤
│ Controllers                 │
│ Services                    │
│ DTOs                        │
│ Middleware                  │
│ Helpers                     │
│ SignalR Hubs                │
└──────────────┬──────────────┘
                │
                ▼
┌─────────────────────────────┐
│ Entity Framework Core       │
│          Npgsql             │
└──────────────┬──────────────┘
                │
                ▼
┌─────────────────────────────┐
│ PostgreSQL / Neon Database  │
└─────────────────────────────┘

                │
                ▼
┌─────────────────────────────┐
│ Cloudinary Image Storage    │
└─────────────────────────────┘
```

---

## Repository Structure

```text
CampusFind-Lost-Found-Portal/
│
├── backend/
│   ├── Controllers/
│   │   ├── AdminController.cs
│   │   ├── AuthController.cs
│   │   ├── ClaimsController.cs
│   │   ├── DashboardController.cs
│   │   ├── FoundItemsController.cs
│   │   ├── LostItemsController.cs
│   │   ├── MatchesController.cs
│   │   ├── NotificationsController.cs
│   │   ├── ReportsController.cs
│   │   ├── TestController.cs
│   │   └── UsersController.cs
│   │
│   ├── DTOs/
│   ├── Data/
│   ├── Helpers/
│   ├── Hubs/
│   ├── Middleware/
│   ├── Migrations/
│   ├── Models/
│   ├── Services/
│   ├── Properties/
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── backend.csproj
│   └── backend.http
│
├── backend.Tests/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Install the following before running the project:

- Git
- .NET 10 SDK
- Node.js
- npm
- PostgreSQL-compatible database
- Neon PostgreSQL account, if using Neon
- Cloudinary account, if image uploads are enabled

Verify the installations:

```bash
dotnet --version
node --version
npm --version
git --version
```

---

## Clone the Repository

```bash
git clone https://github.com/Pratyakshgupta887qwert/CampusFind-Lost-Found-Portal.git
cd CampusFind-Lost-Found-Portal
```

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Restore the .NET dependencies:

```bash
dotnet restore
```

Build the backend:

```bash
dotnet build
```

Run the backend:

```bash
dotnet run
```

The backend will start using the ASP.NET Core configuration defined in the project.

---

## Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## Frontend Commands

The frontend provides the following npm scripts:

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run lint
```

Runs ESLint checks.

```bash
npm run preview
```

Previews the production build locally.

---

## Backend Commands

```bash
dotnet restore
```

Restores backend dependencies.

```bash
dotnet build
```

Builds the backend project.

```bash
dotnet run
```

Starts the backend API.

```bash
dotnet test
```

Runs available .NET tests from the solution or test projects.

---

## Configuration and Secrets

The backend reads sensitive configuration from .NET User Secrets or environment variables.

The following configuration values are used by the application:

```text
ConnectionStrings:DefaultConnection
DATABASE_URL
Jwt:SecretKey
JWT_SECRET
Jwt:Issuer
Jwt:Audience
Cloudinary:CloudName
Cloudinary:ApiKey
Cloudinary:ApiSecret
```

Do not commit real database passwords, JWT secrets, Cloudinary secrets, or other credentials to GitHub.

### Configure .NET User Secrets

From the `backend` directory:

```bash
dotnet user-secrets init
```

Set the database connection string:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "YOUR_POSTGRES_CONNECTION_STRING"
```

Set the JWT secret:

```bash
dotnet user-secrets set "Jwt:SecretKey" "YOUR_JWT_SECRET"
```

Set the JWT issuer and audience:

```bash
dotnet user-secrets set "Jwt:Issuer" "CampusFindApi"
dotnet user-secrets set "Jwt:Audience" "CampusFindClient"
```

Set Cloudinary configuration:

```bash
dotnet user-secrets set "Cloudinary:CloudName" "YOUR_CLOUDINARY_CLOUD_NAME"
dotnet user-secrets set "Cloudinary:ApiKey" "YOUR_CLOUDINARY_API_KEY"
dotnet user-secrets set "Cloudinary:ApiSecret" "YOUR_CLOUDINARY_API_SECRET"
```

Alternatively, configure environment variables:

```bash
DATABASE_URL="YOUR_POSTGRES_CONNECTION_STRING"
JWT_SECRET="YOUR_JWT_SECRET"
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL="YOUR_POSTGRES_CONNECTION_STRING"
$env:JWT_SECRET="YOUR_JWT_SECRET"
```

---

## Database and Migrations

CampusFind uses PostgreSQL through Entity Framework Core and the Npgsql provider.

When the backend starts, it:

1. Reads the database connection string.
2. Opens a PostgreSQL connection.
3. Applies pending EF Core migrations.
4. Starts the application.

The migration process is configured in `backend/Program.cs`.

To create a new migration:

```bash
cd backend
dotnet ef migrations add YourMigrationName
```

To update the database manually:

```bash
dotnet ef database update
```

The project also performs migration application during application startup.

---

## Swagger API Documentation

Swagger is enabled in the development environment.

After starting the backend, open:

```text
http://localhost:5024/swagger
```

The Swagger documentation provides an interactive interface for testing the API.

The API includes controller areas for:

- Authentication
- Users
- Lost items
- Found items
- Claims
- Matches
- Notifications
- Reports
- Dashboard
- Administration

For protected endpoints, use the JWT Bearer authorization format:

```text
Bearer YOUR_JWT_TOKEN
```

---

## SignalR Notifications

CampusFind uses SignalR for real-time communication.

The notification hub is available at:

```text
/hubs/notifications
```

The frontend uses the SignalR client to connect to the backend and receive real-time notification events.

Possible notification use cases include:

- Potential item matches
- New claims
- Claim approval or rejection
- Item status changes
- System updates

---

## Authentication Flow

The authentication flow works as follows:

```text
User registers
      ↓
User logs in
      ↓
Backend validates credentials
      ↓
Backend creates JWT token
      ↓
Frontend stores authentication state
      ↓
Token is sent with protected API requests
      ↓
Backend validates the token
```

Protected requests use the following HTTP header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The backend validates:

- JWT signature
- Issuer
- Audience
- Token lifetime
- Signing key

---

## Lost and Found Workflow

### Lost Item Workflow

```text
User logs in
      ↓
User submits a lost-item report
      ↓
Backend validates the report
      ↓
Item is saved in PostgreSQL
      ↓
Item becomes available for browsing and matching
      ↓
User receives potential match notifications
```

### Found Item Workflow

```text
User logs in
      ↓
User submits a found-item report
      ↓
Backend validates the report
      ↓
Item is saved in PostgreSQL
      ↓
The item becomes visible in found-item listings
      ↓
Potential owners can submit claims
```

### Claim Workflow

```text
User identifies a possible item
      ↓
User submits a claim
      ↓
Claim is reviewed
      ↓
Claim is approved or rejected
      ↓
Relevant users receive notifications
      ↓
Item status can be updated
```

---

## Security

CampusFind uses multiple security practices:

- JWT Bearer authentication
- BCrypt password hashing
- Protected frontend routes
- Backend authorization
- CORS configuration
- Environment variables for deployment secrets
- .NET User Secrets for local development
- Database credentials excluded from source code
- Centralized exception handling
- Swagger Bearer authentication support

### Security Recommendations

- Never commit real credentials.
- Do not store secrets in frontend source files.
- Rotate credentials that have previously been exposed.
- Use HTTPS in production.
- Restrict production CORS to the deployed frontend domain.
- Do not expose stack traces in production.
- Review Git history if credentials were previously committed.
- Use deployment-platform secret management for production values.

---

## Testing

The repository contains a `backend.Tests` project directory for backend testing.

Run the available tests with:

```bash
dotnet test
```

Recommended manual testing flow:

1. Register a new user.
2. Log in.
3. Obtain a JWT token.
4. Authorize through Swagger.
5. Create a lost-item report.
6. Create a found-item report.
7. Browse lost and found listings.
8. Test matching functionality.
9. Submit a claim.
10. Verify notification behavior.
11. Confirm database persistence.
12. Test protected routes in the frontend.

---

## Project Status

### Completed or implemented

- React frontend foundation
- Vite development setup
- ASP.NET Core Web API
- .NET 10 backend
- PostgreSQL integration
- Entity Framework Core
- Npgsql provider
- EF Core migrations
- JWT authentication
- BCrypt password hashing
- CORS configuration
- Swagger/OpenAPI
- SignalR infrastructure
- Cloudinary service integration
- Lost-item functionality
- Found-item functionality
- Claims controller and service infrastructure
- Matching controller and service infrastructure
- Notifications controller and service infrastructure
- Dashboard service infrastructure
- Admin controller
- Centralized exception middleware
- Frontend protected routes

### Future improvements

- Advanced AI-powered matching
- Semantic text similarity
- Image similarity and computer vision
- OCR for documents and identity cards
- Advanced filters and search
- Full administrator dashboard
- Email notifications
- Browser push notifications
- Mobile application
- Multi-campus support
- Campus maps
- Analytics and recovery metrics
- University email verification
- Enhanced ownership verification

---

## Deployment Guidance

The project can be deployed using a separated frontend and backend architecture.

### Frontend deployment options

- Vercel
- Netlify
- Azure Static Web Apps
- Other Vite-compatible hosting platforms

### Backend deployment options

- Azure
- Render
- Railway
- AWS
- Other ASP.NET Core-compatible hosting platforms

### Database

The backend can use:

- Neon PostgreSQL
- Managed PostgreSQL
- Self-hosted PostgreSQL

### Production requirements

Before deploying:

- Configure production environment variables.
- Use a production database connection string.
- Configure Cloudinary credentials securely.
- Set a strong JWT secret.
- Enable HTTPS.
- Restrict CORS to the production frontend URL.
- Configure the frontend API base URL.
- Disable or restrict Swagger if required.
- Confirm database migrations are applied.
- Ensure no credentials are present in Git history.

---

## Contribution

Contributions are welcome.

To contribute:

```bash
git checkout -b feature/your-feature-name
```

Make your changes, test them locally, and commit:

```bash
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name
```

Then open a pull request with:

- A clear title
- A detailed description
- Testing information
- Screenshots for UI changes
- Any required configuration notes

---

## License

No license file is currently specified in this repository.

If this project is intended for public distribution, add an appropriate open-source license such as MIT before publishing or redistributing the project.

---

## Project Links

- Repository: [CampusFind-Lost-Found-Portal](https://github.com/Pratyakshgupta887qwert/CampusFind-Lost-Found-Portal)
- Swagger: `http://localhost:5024/swagger`
- SignalR hub: `/hubs/notifications`

---

## Final Summary

CampusFind is a full-stack campus Lost & Found platform that provides a structured way for students and faculty to report, search, match, claim, and recover lost belongings.

The project combines a React and Vite frontend with an ASP.NET Core Web API backend. It uses PostgreSQL and Entity Framework Core for persistence, JWT for secure authentication, SignalR for real-time notifications, and Cloudinary for image management. The modular architecture provides a strong foundation for future features such as AI-powered matching, image recognition, advanced analytics, mobile applications, and multi-campus support.

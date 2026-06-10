<!-- @format -->

# CinaGloria — Backend

<p align="center">
  <a href="https://bots.swedka121.com/" target="blank">
    <img src="https://enum-marketplace-s3-bucket.s3.us-east-1.amazonaws.com/SocialPreviewBackend.png" width="1680" alt="CinaLogo" />
  </a>
</p>

[![Framework](https://img.shields.io/badge/Framework-NestJS-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Team](https://img.shields.io/badge/Maintained%20by-KryaKryaTeam-blue)](https://github.com/KryaKryaTeam)
[![Status](https://img.shields.io/badge/Status-MVP-orange)](#)

A high-performance **Nest.js** backend powering the **CinaGloria** project. Developed and maintained by **KryaKryaTeam**.

> [!WARNING]  
> This project is currently in the **MVP stage**. Many features and endpoints are subject to change, and some routes may work incorrectly.

---

## 🛠 Tech Stack

- **Framework:** [Nest.js](https://nestjs.com/) (Node.js)
- **Database:** PostgreSQL (Target version: 18)
- **Runtime:** Docker & Docker Compose
- **Authentication:** JWT + OAuth 2.0 (Google & GitHub)
- **Mailing:** Mailgun
- **Storage:** Multi-driver support (Local / S3)
- **Documentation:** Scalar

---

## 🚀 Quick Start (Local)

The project includes an interactive shell script to manage the Docker environment and migrations.

1. **Configure Environment:**
   Copy your `.env` settings into the root directory. Use the configuration table below as a guide.
2. **Run the Manager:**

```bash
chmod +x start.sh
./start.sh

```

### Manager Options:

| Option | Mode                 | Description                                                               |
| ------ | -------------------- | ------------------------------------------------------------------------- |
| `1`    | **Development**      | Starts the app with Watch mode and Hot-reload enabled.                    |
| `2`    | **Prod Emulate**     | Builds the app without Watch mode (200MB resource limit).                 |
| `3`    | **Clear Cache**      | Wipes Docker volumes, system prune, and clears `./server/uploads`.        |
| `4`    | **Gen Migration**    | Automatically generates a new database migration based on schema changes. |
| `5`    | **Create Migration** | Creates an empty migration file for manual SQL.                           |
| `6`    | **Run Tests**        | Executes the test suite via `npm run test`.                               |

---

## ⚙️ Environment Configuration Breakdown

#### **1. Basic & Global Settings**

These control the core behavior of the NestJS application.

| Variable                      | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| `PORT`                        | The network port the API will listen on (default `4000`).          |
| `NODE_ENV`                    | Sets the environment mode (e.g., `DEVELOPMENT`, `PRODUCTION`).     |
| `IS_PREVIEW`                  | Boolean flag likely used for preview/staging deployments.          |
| `BASE_URL`                    | The full URL where the backend is accessible.                      |
| `VERSION`                     | The current API version (used for route prefixing like `/v1/...`). |
| `AVALIBLE_TESTABLE_ENDPOINTS` | Enables or disables specific routes used for automated testing.    |

---

#### **2. Database Settings (PostgreSQL)**

Connection details for your data persistence layer.

| Variable                  | Description                                 |
| ------------------------- | ------------------------------------------- |
| `DB_USER` / `DB_PASSWORD` | Credentials for the database owner.         |
| `DB_NAME`                 | The specific database name (schema) to use. |
| `DB_PORT`                 | The port for PostgreSQL (default `5432`).   |
| `DB_VERSION`              | Targets a specific PG version (v18).        |

---

#### **3. User Registration Defaults**

These are used by the logic that generates random identities for new users.

| Variable         | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `USERNAME_PART1` | A list of adjectives used for random name generation.          |
| `USERNAME_PART2` | A list of animals used as the second part of random names.     |
| `AVATAR_LIST`    | The URL for the default profile picture (currently a cat GIF). |

---

#### **4. Authentication & Security**

Handles OAuth providers, JSON Web Tokens, and Real-time communication.

| Variable               | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `GOOGLE_...`           | Client ID, Secret, and Redirect URI for Google Social Login. |
| `GITHUB_...`           | Client ID and Secret for GitHub Social Login.                |
| `ACCESS_TOKEN_SECRET`  | Secret key used to sign short-lived JWT access tokens.       |
| `REFRESH_TOKEN_SECRET` | Secret key used to sign long-lived refresh tokens.           |
| `WEBSOCKET_PORT`       | Port dedicated to Socket.io/WebSocket traffic (`4001`).      |
| `WEBSOCKET_SECRET`     | Secret used for securing or handshaking socket connections.  |

---

#### **5. Mailing (Mailgun)**

Configuration for sending transactional emails (verification codes, etc.).

| Variable                | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `MAIL_DOMAIN`           | Your verified sending domain in Mailgun.                 |
| `MAIL_API_KEY`          | Private key to authorize email sending.                  |
| `MAIL_CODE_TEMPLATE`    | URL to the HTML template for verification codes.         |
| `MAIL_CONTENT_TEMPLATE` | URL to the HTML template for general email body content. |

---

#### **6. Storage Configuration**

Handles where files (images, uploads) are saved.

| Variable             | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `STORAGE_CONTROLLER` | Determines the driver. Set to `s3` (Cloud) or `ls` (Local).       |
| **S3 Settings**      | Contains the ID, Secret Key, Region, and Bucket name for AWS S3.  |
| `LS_BASEPATH`        | The local directory path if `STORAGE_CONTROLLER` was set to `ls`. |

---

#### **7. Initial Setup**

| Variable               | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `SETUP_ADMIN_EMAIL`    | The email address for the create:admin command by default |
| `SETUP_ADMIN_PASSWORD` | The password for the create:admin command by default      |

---

This is a great addition to the documentation. Using a CLI within a running Docker container is a common pattern for administrative tasks.

Here is how you can document this section to match the professional style of the rest of your README.

---

## 🛠 Command Line Interface (CLI)

The backend includes a built-in CLI for administrative tasks like manual user creation or database maintenance.

### How to execute commands

Since the application runs inside a Docker container, you must execute the commands through `docker exec`:

1. **Find the Container ID:**
   Run the following command and copy the ID for `cinagloria-app`:

```bash
docker ps

```

2. **Run the Command:**

```bash
docker exec -it cinagloria-app npm run cli -- create:admin admin@test.com password123

```

---

### Available CLI Commands

| Command        | Parameters             | Description                                                                            |
| -------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| `create:admin` | `<email>` `<password>` | Creates a new administrator account. The account is automatically marked as confirmed. |

---

## 🔗 Project Links

- **Live Preview:** [bots.swedka121.com/app](https://bots.swedka121.com/app)
- **API Documentation (Swagger):** [bots.swedka121.com/docs](https://bots.swedka121.com/app/docs)
- **Client Repository:** [CinaGloria-Client](https://github.com/KryaKryaTeam/CinaGloria-Frontend)

---

## 👥 Maintenance

Developed and maintained with ❤️ by **KryaKryaTeam**.

> [!NOTE]
> **Judge's Disclaimer:** While the full planned scope was not completed within the initial timeframe, we invite you to evaluate the robustness of our architecture and the quality of the codebase provided.

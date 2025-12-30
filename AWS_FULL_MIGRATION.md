# COMPLETE GUIDE: Migrating to AWS (RDS/Aurora + EC2)

This guide explains how to migrate your infrastructure to a production-grade AWS setup.
Instead of running the database inside the web server, we will use **AWS RDS/Aurora** (Managed Database) for reliability and **AWS EC2** for the application logic (Supabase Middleware).

---

## ARCHITECTURE OVERVIEW

1.  **Database:** AWS RDS or Aurora PostgreSQL (Stores all data).
2.  **Middleware:** AWS EC2 Instance (Runs Supabase Auth, Storage, and Realtime API via Docker).
3.  **Frontend:** Your React App (Connects to the EC2 Middleware).

---

## STEP 1: Create a Security Group (The Network)

We need a security group to allow your EC2 instance to talk to your RDS database securely.

1.  Go to **AWS Console** > **EC2** > **Security Groups**.
2.  Click **Create security group**.
    *   **Name:** `kabs-internal-sg`
    *   **Description:** Allow internal traffic.
    *   **VPC:** Default (or your custom VPC).
3.  **Inbound Rules:**
    *   Type: **PostgreSQL** (5432) | Source: **Anywhere-IPv4** (0.0.0.0/0) — *For initial setup only.*
    *   Type: **Custom TCP** (8000) | Source: **Anywhere-IPv4** (0.0.0.0/0) — *For API Access.*
    *   Type: **SSH** (22) | Source: **My IP**.
4.  Click **Create security group**.

---

## STEP 2: Create the Database (AWS RDS or Aurora)

1.  Go to **AWS Console** > **RDS** > **Create database**.
2.  **Engine options:** PostgreSQL (or Aurora PostgreSQL Compatible).
3.  **Version:** PostgreSQL 15.x or 16.x.
4.  **Settings:**
    *   **Master username:** `postgres`
    *   **Master password:** Create a strong password. **Write this down.**
5.  **Connectivity:**
    *   **Public access:** **Yes** (Easier for setup).
    *   **VPC security groups:** Select `kabs-internal-sg`.
6.  Click **Create database**. Copy the **Endpoint** URL when ready.

---

## STEP 3: Setup the Middleware (EC2)

1.  Launch **Ubuntu 24.04** EC2 Instance (`t3.medium`).
2.  SSH into the instance.
3.  **Install Docker:**
    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    ```
4.  **Configure Middleware:**
    ```bash
    git clone --depth 1 https://github.com/supabase/supabase
    cd supabase/docker
    cp .env.example .env
    nano .env
    ```
    *   Set `POSTGRES_HOST` to your RDS Endpoint.
    *   Set `POSTGRES_PASSWORD` to your RDS Password.
    *   Set `API_EXTERNAL_URL` to `http://<EC2-IP>:8000`.
5.  **Start Services:** `docker compose up -d`
    *   *Note: This will automatically install the 'auth' and 'storage' schemas into your RDS database.*

---

## STEP 4: Run the Migration SQL

Now that the Middleware is running and has prepared the system schemas, you need to create the Application tables.

1.  Connect to your RDS/Aurora database using DBeaver, TablePlus, or pgAdmin.
2.  Open the file **`migration-scripts/aws-schema.sql`**.
3.  Run the entire script.
    *   It will create the `projects` table.
    *   It will enable Row Level Security.
    *   It will register the `project-files` storage bucket.

---

## STEP 5: Connect React App

1.  In your local project root, create/edit `.env`:
    ```env
    VITE_SUPABASE_URL=http://<EC2-PUBLIC-IP>:8000
    VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
    ```
2.  Run `npm run dev`.

**You are now running on AWS!**

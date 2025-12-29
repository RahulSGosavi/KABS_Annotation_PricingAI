# COMPLETE GUIDE: Migrating to AWS (RDS + EC2)

This guide explains how to migrate your infrastructure to a production-grade AWS setup.
Instead of running the database inside the web server, we will use **AWS RDS** (Managed Database) for reliability and **AWS EC2** for the application logic (Supabase Middleware).

---

## ARCHITECTURE OVERVIEW

1.  **Database:** AWS RDS PostgreSQL (Stores all data).
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
    *   Type: **PostgreSQL** (5432) | Source: **Anywhere-IPv4** (0.0.0.0/0) — *For initial setup only. Later lock this down to your EC2 IP.*
    *   Type: **Custom TCP** (8000) | Source: **Anywhere-IPv4** (0.0.0.0/0) — *This allows your App to talk to the API.*
    *   Type: **SSH** (22) | Source: **My IP**.
4.  Click **Create security group**.

---

## STEP 2: Create the Database (AWS RDS)

1.  Go to **AWS Console** > **RDS** > **Create database**.
2.  **Choose a database creation method:** Standard create.
3.  **Engine options:** PostgreSQL.
4.  **Engine Version:** PostgreSQL 15.x or 16.x.
5.  **Templates:** Free tier (for testing) or Production.
6.  **Settings:**
    *   **DB instance identifier:** `kabs-db`
    *   **Master username:** `postgres`
    *   **Master password:** Create a strong password (e.g., `SuperSecretPass123!`). **Write this down.**
7.  **Instance configuration:** `db.t3.micro` (Free Tier) or `db.t3.medium`.
8.  **Connectivity:**
    *   **Public access:** **Yes** (Easier for setup, allows your local computer to manage it).
    *   **VPC security groups:** Select `kabs-internal-sg` (created in Step 1).
9.  **Additional configuration (Expand this section at bottom):**
    *   **Initial database name:** `postgres`
10. Click **Create database**.
    *   *Wait 5-10 minutes for status to turn "Available".*
    *   *Copy the **Endpoint** URL (e.g., `kabs-db.cxyz.us-east-1.rds.amazonaws.com`).*

---

## STEP 3: Setup the Middleware Server (EC2)

1.  Go to **EC2** > **Launch Instance**.
2.  **Name:** `Kabs-Middleware`
3.  **OS:** Ubuntu Server 24.04 LTS.
4.  **Instance Type:** `t3.small` or `t3.medium`.
5.  **Key pair:** Create new key pair `kabs-key` -> Download .pem file.
6.  **Network settings:**
    *   Select existing security group: `kabs-internal-sg`.
7.  **Storage:** 20 GiB gp3.
8.  Click **Launch instance**.

---

## STEP 4: Install Supabase Middleware on EC2

1.  **Connect to EC2:**
    Open your terminal where the `.pem` key is:
    ```bash
    chmod 400 kabs-key.pem
    ssh -i "kabs-key.pem" ubuntu@<EC2-PUBLIC-IP>
    ```

2.  **Install Docker:**
    ```bash
    sudo apt-get update
    sudo apt-get install ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    ```
    *Exit and SSH back in to apply group changes.*

3.  **Download Supabase Config:**
    ```bash
    git clone --depth 1 https://github.com/supabase/supabase
    cd supabase/docker
    cp .env.example .env
    ```

4.  **Point Middleware to AWS RDS:**
    Edit the environment file:
    ```bash
    nano .env
    ```
    Change these values:
    *   `POSTGRES_HOST`: Paste your **RDS Endpoint** here.
    *   `POSTGRES_PORT`: `5432`
    *   `POSTGRES_PASSWORD`: Your **RDS Password**.
    *   `POSTGRES_DB`: `postgres`
    *   `JWT_SECRET`: Generate a UUID (from uuidgenerator.net).
    *   `ANON_KEY` & `SERVICE_ROLE_KEY`: Generate these at jwt.io using your JWT_SECRET.
    *   `API_EXTERNAL_URL`: `http://<EC2-PUBLIC-IP>:8000`

    *Save (Ctrl+X, Y, Enter).*

5.  **Start Services (Skipping local DB):**
    We need to tell Docker NOT to start the local `db` container, since we are using RDS.
    
    Edit `docker-compose.yml`:
    ```bash
    nano docker-compose.yml
    ```
    *   Find the `db:` service block.
    *   Delete it or comment it out.
    *   Find `depends_on: - db` in other services (like `rest`, `realtime`, `auth`, `storage`) and remove that line.
    
    *Alternatively, a quick hack is just stopping the db container after start, but editing compose is cleaner.*

6.  **Run the Stack:**
    ```bash
    docker compose up -d
    ```

---

## STEP 5: Initialize the Database

Since RDS is fresh, it doesn't have the Supabase schemas (`auth`, `storage`, etc.). The Supabase services *attempt* to create them on startup, but standard RDS requires extensions.

1.  **Connect to RDS** from your local computer (using TablePlus, DBeaver, or pgAdmin).
    *   Host: RDS Endpoint
    *   User: postgres
    *   Pass: Your Password
2.  **Enable Extensions:** Run this SQL query:
    ```sql
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    ```
    *(Note: `pg_net` and `sodium` might fail on standard RDS without custom parameter groups, but basic Auth and Storage usually work without them).*

3.  **Restart Containers on EC2:**
    ```bash
    docker compose restart
    ```

---

## STEP 6: Connect React App

1.  In your local project root, create/edit `.env`:
    ```env
    VITE_SUPABASE_URL=http://<EC2-PUBLIC-IP>:8000
    VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
    ```
2.  Run `npm run dev`.

**You are now running on AWS RDS + EC2!**

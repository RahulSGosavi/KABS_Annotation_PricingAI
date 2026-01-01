# Migrating KABS Backend to AWS

Since this application relies on the Supabase Client (Auth, Storage, and Realtime API), you cannot simply move the database to Amazon RDS. You must host the **Supabase Stack** on AWS to support the frontend application.

This guide outlines how to self-host Supabase on an AWS EC2 instance.

---

## Prerequisites
1.  AWS Account.
2.  Command Line Interface (Terminal).
3.  Basic knowledge of Docker and SSH.

---

## Step 1: Launch an AWS EC2 Instance

1.  **Go to AWS Console** > **EC2** > **Launch Instance**.
2.  **OS Image:** Ubuntu Server 22.04 LTS (x86 architecture).
3.  **Instance Type:** `t3.medium` (Minimum) or `t3.large` (Recommended for production).
    *   *Note:* Supabase runs many containers (Postgres, GoTrue, PostgREST, Realtime, Storage, etc.), so `t2.micro` is too small.
4.  **Key Pair:** Create a new key pair (Save the `.pem` file) to SSH into the server.
5.  **Network Settings:** Allow Traffic:
    *   SSH (Port 22)
    *   HTTP (Port 80)
    *   HTTPS (Port 443)
    *   Custom TCP (Port 8000) - Default API gateway port for self-hosted Supabase.
6.  **Storage:** Allocate at least 20-30GB gp3 storage.
7.  **Launch Instance**.

---

## Step 2: Install Docker on EC2

1.  SSH into your instance:
    ```bash
    ssh -i "your-key.pem" ubuntu@<your-ec2-public-ip>
    ```

2.  Update and install Docker:
    ```bash
    # Update packages
    sudo apt-get update
    
    # Install certificates
    sudo apt-get install ca-certificates curl gnupg

    # Add Docker GPG key
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    # Set up repository
    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Add user to docker group (avoids using sudo)
    sudo usermod -aG docker $USER
    ```
3.  **Log out and log back in** for the group changes to take effect.

---

## Step 3: Set up Supabase

1.  Clone the Supabase repository:
    ```bash
    git clone --depth 1 https://github.com/supabase/supabase
    ```

2.  Go to the docker folder:
    ```bash
    cd supabase/docker
    ```

3.  Copy the environment file:
    ```bash
    cp .env.example .env
    ```

4.  **Edit the configuration**:
    ```bash
    nano .env
    ```
    *   **POSTGRES_PASSWORD**: Change this to a secure password.
    *   **JWT_SECRET**: Generate a strong secret (use `openssl rand -base64 32`).
    *   **ANON_KEY** & **SERVICE_ROLE_KEY**: You must generate these JWTs using your `JWT_SECRET`. Use a tool like [jwt.io](https://jwt.io) or a script to generate tokens signed with your secret.
    *   **API_EXTERNAL_URL**: Set this to `http://<your-ec2-public-ip>:8000` (or your domain name).

5.  Start the stack:
    ```bash
    docker compose up -d
    ```

    *This will download and start all required services (Postgres, Studio, Kong, Auth, etc.).*

---

## Step 4: Migrate Data (from Managed Supabase to AWS)

You need to copy your data from the hosted Supabase project to your new AWS instance.

1.  **On your local machine**, install Supabase CLI or PostgreSQL tools (`pg_dump`).
2.  **Export data** from managed Supabase:
    ```bash
    # Get the connection string from Supabase Dashboard > Settings > Database
    pg_dump "postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
    --clean --if-exists --quote-all-identifiers \
    --exclude-table-data 'storage.objects' \
    -f dump.sql
    ```
    *(Note: Migrating Storage blobs is more complex and usually requires a script to download/upload files separately).*

3.  **Transfer SQL to AWS**:
    ```bash
    scp -i "your-key.pem" dump.sql ubuntu@<your-ec2-public-ip>:~/
    ```

4.  **Import to AWS Supabase**:
    *   SSH back into EC2.
    *   Copy the dump into the postgres container and run psql.
    ```bash
    # Identify container ID for postgres
    docker ps | grep postgres
    
    # Execute import (assuming default user 'postgres')
    cat dump.sql | docker exec -i <container-id> psql -U postgres
    ```

---

## Step 5: Secure Your Instance (Production)

Running on HTTP and IP address is not secure.

1.  **Domain Name**: Buy a domain and point an A record to your EC2 IP.
2.  **SSL (Nginx + Certbot)**:
    *   Install Nginx on the host EC2 (`sudo apt install nginx`).
    *   Configure Nginx to proxy `locahost:8000` to `your-domain.com`.
    *   Run `sudo certbot --nginx` to enable HTTPS.
3.  **Update `.env`**: Change `API_EXTERNAL_URL` to `https://your-domain.com`.
4.  Restart Docker: `docker compose restart`.

---

## Step 6: Update Frontend Application

1.  Open `services/supabase.ts` in your code.
2.  Update the credentials:

```typescript
// services/supabase.ts

// Point to your AWS EC2 instance
const SUPABASE_URL = 'https://your-new-aws-domain.com'; // or http://<IP>:8000

// Use the ANON_KEY you generated in Step 3
const SUPABASE_ANON_KEY = 'your-new-self-hosted-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

3.  Redeploy your frontend (Render/AWS S3).

Your application is now fully independent and running on your own AWS infrastructure!

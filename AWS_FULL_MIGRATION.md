# Full Migration Guide: Supabase Cloud to AWS EC2

This guide covers moving your entire backend (Database, Auth Users, and Storage Files) to AWS.

## Phase 1: AWS Server Setup

1.  **Launch EC2 Instance:**
    *   **OS:** Ubuntu 22.04 LTS.
    *   **Type:** `t3.medium` (Minimum) or `t3.large` (Recommended).
    *   **Storage:** 30GB+ gp3.
    *   **Security Group:** Open ports `22` (SSH), `80` (HTTP), `443` (HTTPS), `8000` (API Gateway), `5432` (Postgres - optional, for migration).

2.  **Install Docker on EC2:**
    SSH into your instance and run:
    ```bash
    # Update and install Docker
    sudo apt-get update
    sudo apt-get install ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Permission setup
    sudo usermod -aG docker $USER
    # LOG OUT AND LOG BACK IN HERE
    ```

## Phase 2: Install Supabase on EC2

1.  **Clone Supabase:**
    ```bash
    git clone --depth 1 https://github.com/supabase/supabase
    cd supabase/docker
    cp .env.example .env
    ```

2.  **Generate Keys & Config:**
    *   Run `openssl rand -base64 32` to generate a `JWT_SECRET`.
    *   Go to [jwt.io](https://jwt.io).
    *   **Payload:** `{"role": "anon", "iss": "supabase", "iat": 1700000000, "exp": 2000000000}`.
    *   **Secret:** Paste your `JWT_SECRET`.
    *   **Copy the Result:** This is your `ANON_KEY`.
    *   Repeat with payload `{"role": "service_role", ...}` for `SERVICE_ROLE_KEY`.

3.  **Update `.env`:**
    ```bash
    nano .env
    ```
    *   Set `POSTGRES_PASSWORD`.
    *   Set `JWT_SECRET`.
    *   Set `ANON_KEY` and `SERVICE_ROLE_KEY`.
    *   Set `API_EXTERNAL_URL=http://<YOUR_EC2_IP>:8000`

4.  **Start Services:**
    ```bash
    docker compose up -d
    ```

## Phase 3: Database Migration (Schema + Users + Data)

**On your Local Machine:**

1.  **Dump Data from Supabase Cloud:**
    Get your connection string from Supabase Dashboard > Settings > Database.
    
    ```bash
    # Dump everything (Schema, Auth Users, Public Data, Storage Metadata)
    docker run -it --rm postgres pg_dump "postgres://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
      --clean \
      --if-exists \
      --quote-all-identifiers \
      --no-owner \
      --no-privileges \
      > full_backup.sql
    ```

2.  **Upload Dump to EC2:**
    ```bash
    scp -i key.pem full_backup.sql ubuntu@<EC2_IP>:~/
    ```

**On EC2:**

3.  **Restore Data:**
    ```bash
    # Copy file into container
    docker cp full_backup.sql supabase-db-1:/tmp/full_backup.sql
    
    # Execute Restore
    docker exec -it supabase-db-1 psql -U postgres -f /tmp/full_backup.sql
    ```

*At this point, your EC2 database "knows" about the users and the files, but the actual PDF files are missing from the disk.*

## Phase 4: Storage Migration (The Files)

The database dump transferred the *metadata* (file names), but not the *binary files*. You must transfer them manually.

1.  **On your Local Machine**, create a folder `migration`.
2.  Save the `migrate-storage.js` script (provided in the codebase) into that folder.
3.  Install dependencies:
    ```bash
    npm install @supabase/supabase-js
    ```
4.  Run the script:
    ```bash
    node migrate-storage.js
    ```
    *This script downloads PDFs from Supabase Cloud and uploads them to your EC2 instance.*

## Phase 5: Frontend Update

1.  Update `services/supabase.ts` in your React app.
2.  Set `SUPABASE_URL` to `http://<EC2_IP>:8000`.
3.  Set `SUPABASE_ANON_KEY` to the new key you generated in Phase 2.

## Troubleshooting

*   **CORS Issues:** If running locally and connecting to EC2, ensure `.env` in Docker allows cors.
*   **Auth Emails:** You need to configure SMTP in the `.env` file on EC2 for email confirmations to work, or disable "Confirm Email" in the dashboard (localhost:8000 is the Studio).

# Deployment Guide

This guide covers deploying the KABS Annotation & Pricing AI application to **Render** and **AWS**.

---

## Option 1: Deploy to Render (Easiest)

Render is excellent for hosting static sites and Docker containers.

### Method A: Static Site (Recommended)
Since this application uses ES Modules and requires no build step (no `package.json` build scripts), you can deploy it as a static site.

1.  Push your code to **GitHub** or **GitLab**.
2.  Log in to [Render.com](https://render.com).
3.  Click **New +** and select **Static Site**.
4.  Connect your repository.
5.  **Settings:**
    *   **Build Command:** (Leave empty)
    *   **Publish Directory:** `./` (Current directory)
6.  Click **Create Static Site**.
7.  *Important for React Router:* Go to the **Redirects/Rewrites** tab in your Render dashboard.
    *   Add a Rewrite: Source `/*` -> Destination `/index.html` -> Action `Rewrite`.
    *   This ensures refreshing the page on `/editor/123` doesn't give a 404 error.

### Method B: Docker
1.  Push your code to GitHub/GitLab.
2.  Log in to Render.
3.  Click **New +** and select **Web Service**.
4.  Connect your repository.
5.  Select **Docker** as the Runtime.
6.  Click **Create Web Service**. Render will automatically detect the `Dockerfile` and deploy via Nginx.

---

## Option 2: Deploy to AWS

### Method A: AWS App Runner (Docker based - Easiest AWS method)
AWS App Runner abstracts away the infrastructure management.

1.  Push your code to a repository.
2.  Go to the **AWS Console** > **App Runner**.
3.  Click **Create Service**.
4.  **Source:** Select "Source Code Repository".
5.  Connect your GitHub and select your repo/branch.
6.  **Deployment Settings:** Automatic.
7.  **Build Settings:** Select **Dockerfile**.
    *   Port: `80`
8.  Click **Next** -> **Create & Deploy**.

### Method B: S3 + CloudFront (Standard Static Hosting)
This is the most cost-effective and performant way for frontend apps.

1.  **S3 Bucket:**
    *   Create a new S3 bucket (e.g., `kabs-app`).
    *   Upload all project files (`index.html`, `index.tsx`, `components/`, `services/`, etc.) to the root of the bucket.
    *   *Note:* Do not enable "Static Website Hosting" directly on S3 if using CloudFront (for better security).

2.  **CloudFront:**
    *   Create a Distribution.
    *   **Origin Domain:** Select your S3 bucket.
    *   **Origin Access:** Choose "Origin access control settings (recommended)" to restrict bucket access to CloudFront only.
    *   **Viewer Protocol Policy:** Redirect HTTP to HTTPS.
    *   **Error Pages (Crucial for React Router):**
        *   Create a Custom Error Response.
        *   HTTP Error Code: `403` (and `404`).
        *   Response Page Path: `/index.html`.
        *   HTTP Response Code: `200`.
    *   Create Distribution.

3.  **Update Bucket Policy:**
    *   Copy the Bucket Policy provided by CloudFront and paste it into your S3 Bucket Permissions.

---

## Environment Variables

The Supabase credentials are currently located in `services/supabase.ts`. 
For a production build, it is best practice to:
1.  Replace the hardcoded strings with `import.meta.env.VITE_SUPABASE_URL` (if using Vite) or `process.env.REACT_APP_...`.
2.  Set these variables in the Render Dashboard or AWS Environment configurations.

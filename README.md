# KABS Annotation & Pricing AI

A professional interior design SaaS application for PDF annotation, measurement, and pricing estimation.

## 🚀 Project Overview

KABS allows users to:
1.  **Manage Projects:** Create, organize, and delete design projects.
2.  **Upload Plans:** Upload PDF floor plans via Supabase Storage.
3.  **Annotate:** Use a full suite of vector tools (Konva.js) to draw, measure, and mark up plans.
4.  **Export:** Flatten annotations into a high-quality PDF for clients.
5.  **Collaborate:** (Future Roadmap) Real-time pricing estimation.

## 🛠 Tech Stack

*   **Frontend Library:** React 19
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** React `useState` / `useEffect` + Context (implicit via props)
*   **Canvas/Graphics:** `react-konva` (Canvas API wrapper)
*   **PDF Handling:** `pdfjs-dist` (Rendering) & `jspdf` (Export generation)
*   **Backend/Database:** Supabase (PostgreSQL, Auth, Storage)
*   **Icons:** Lucide React

## 📂 Project Structure

```
/
├── components/          # React UI Components
│   ├── Editor/          # Core Editor Logic (Canvas, Toolbar, Properties)
│   ├── Layout/          # Global layout (Navbar)
│   └── ui/              # Reusable atoms (Buttons, etc.)
├── services/            # API integration
│   ├── supabase.ts      # Database client config
│   ├── projectService.ts# CRUD operations for Projects
│   └── pdfService.ts    # PDF rendering utilities
├── types.ts             # Global TypeScript interfaces & Enums
├── App.tsx              # Main Router and Auth State
└── index.html           # Entry point
```

## 👩‍💻 Developer Guide

### Setup
This project uses ES Modules via CDN (`esm.sh`) in `index.html`. This means there is **no complex build step** required for local development if you have a simple static file server.

1.  **Clone the repo.**
2.  **Supabase Setup:**
    *   Ensure the `projects` table is created (SQL in `services/supabase.ts`).
    *   Ensure the `project-files` storage bucket exists and is public.
    *   Apply RLS (Row Level Security) policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
3.  **Run Locally:**
    *   You can use any static server, e.g., `npx serve` or VS Code Live Server.
    *   *Note on Environment:* The app runs directly in the browser.

### Key Architectural Decisions

1.  **Canvas Rendering (Konva):**
    *   We do *not* draw directly on the PDF.
    *   The PDF is rendered to a standard HTML `<canvas>` or `<img>` which sits on the bottom Layer of the Konva Stage.
    *   Annotations are vector objects on the top Layer.
    *   This ensures performance and allows editing annotations without re-rendering the PDF.

2.  **Coordinate System:**
    *   The Canvas wraps the PDF. We scale the Stage (`stageScale`) to fit the screen, but internal coordinates (shape `x`, `y`) remain relative to the unscaled PDF dimensions.
    *   When exporting, we create a temporary "headless" stage at high resolution (Scale 2x or 3x) to ensure crisp text.

3.  **State Management:**
    *   `EditorPage.tsx` acts as the Controller. It holds the `shapes` state and the Undo/Redo history.
    *   `Canvas.tsx` is the View. It handles mouse events and rendering.
    *   `PropertiesPanel.tsx` modifies the state of the selected shape.

### Database Schema (Supabase)

**Table: `projects`**
*   `id`: UUID (Primary Key)
*   `user_id`: UUID (Foreign Key to auth.users)
*   `annotations`: JSONB (Stores the array of Konva shape objects)
*   `pdf_url`: Text (Public URL to the PDF file)
*   `status`: 'draft' | 'saved'

## 🔒 Security

*   **RLS (Row Level Security):** is enabled on Supabase. Users can only access/edit projects where `user_id` matches their Auth ID.
*   **Storage Access:** Files are stored in a public bucket, but file paths are obfuscated with user IDs. For higher security, switch to signed URLs in `projectService.ts`.

## 🚢 Deployment & Migration

*   **Deployment:** See `DEPLOYMENT.md` for instructions on deploying the frontend to Render or AWS.
*   **AWS Migration:** See `AWS_MIGRATION.md` for a guide on moving the backend infrastructure to self-hosted AWS EC2.

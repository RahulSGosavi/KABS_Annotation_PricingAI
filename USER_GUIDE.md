# KABS Editor User Guide

This guide explains how to use the annotation tools within the Editor interface.

## Getting Started
1.  **Create a Project:** Click "New Project" on the dashboard, provide a name, and upload a PDF.
2.  **Navigation:** Use the toolbar on the left to select tools. Use the bottom/top bars to navigate PDF pages or zoom.

## Toolbar Functions

| Icon | Tool Name | Description |
| :--- | :--- | :--- |
| <img src="https://esm.sh/lucide-static/icons/mouse-pointer-2.svg" width="20"/> | **Select** | Click to select objects. Drag to move them. Double-click text to edit. |
| <img src="https://esm.sh/lucide-static/icons/hand.svg" width="20"/> | **Pan** | Click and drag the canvas to move around the PDF without selecting objects. |
| <img src="https://esm.sh/lucide-static/icons/pen.svg" width="20"/> | **Freehand** | Draw freeform lines. Good for signatures or quick sketches. |
| <img src="https://esm.sh/lucide-static/icons/minus.svg" width="20"/> | **Line** | Click and drag to create a straight line. |
| <img src="https://esm.sh/lucide-static/icons/move-right.svg" width="20"/> | **Arrow** | Click and drag to create an arrow pointing to a specific location. |
| <img src="https://esm.sh/lucide-static/icons/square.svg" width="20"/> | **Rectangle** | Click and drag to draw a box. Useful for highlighting areas. |
| <img src="https://esm.sh/lucide-static/icons/circle.svg" width="20"/> | **Ellipse** | Click and drag to draw a circle or oval. |
| <img src="https://esm.sh/lucide-static/icons/type.svg" width="20"/> | **Text** | Click anywhere on the canvas to start typing. Click outside to finish. |
| <img src="https://esm.sh/lucide-static/icons/ruler.svg" width="20"/> | **Measure** | Click and drag to measure distance. The label updates automatically based on the Unit setting. |
| <img src="https://esm.sh/lucide-static/icons/triangle.svg" width="20"/> | **Angle** | Draw an angle. Select the object to see yellow handles to adjust the vertex and arms. |
| <img src="https://esm.sh/lucide-static/icons/eraser.svg" width="20"/> | **Eraser** | Click and drag to remove annotations. Does not affect the background PDF. |

## Properties Panel
*Located on the right side (toggle with the sidebar icon on mobile).*

*   **When nothing is selected:** Change the default settings for the next tool you use (e.g., set default line color to blue).
*   **When an object is selected:**
    *   **Stroke/Fill:** Change colors.
    *   **Width:** Adjust line thickness.
    *   **Opacity:** Make objects transparent.
    *   **Line Style:** Switch between solid and dashed lines.
    *   **Typography:** Change font family, size, bold, or italic (Text tool only).
    *   **Layers:** View a list of all objects on the current page. Toggle visibility (Eye icon) or delete specific layers.

## Saving & Exporting
*   **Auto-Save:** The application auto-saves your changes every 2 seconds.
*   **Manual Save:** Click the **Save** icon in the top right to force a save to the database.
*   **Export:** Click the **Export/Download** icon. You can name your file. The system will generate a new PDF combining the original document and your annotations.

## Shortcuts
*   **Undo:** `Ctrl + Z` (or `Cmd + Z` on Mac)
*   **Redo:** `Ctrl + Y` (or `Cmd + Shift + Z` on Mac)
*   **Delete:** `Delete` or `Backspace` key to remove selected objects.
*   **Escape:** Return to the Select tool.

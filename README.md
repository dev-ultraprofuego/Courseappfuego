<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Content. - Course Hub (Next.js Version)

This is a modern and visually appealing web application showcasing over 100 courses for digital creatives, now rebuilt with Next.js for optimal performance and SEO. The platform features course carousels, a testimonial section, a frequently asked questions area, and a powerful search functionality.

## Run Locally

**Prerequisites:** Node.js (v18 or later recommended) and npm.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    This command will install Next.js and all other required packages.
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env.local` in the root of your project and add your admin and Supabase credentials. **Note the variable names have changed.**
    ```
    # Admin Credentials
    ADMIN_USERNAME=YourAdminUsername
    ADMIN_PASSWORD=YourSecurePassword
    # Secure Admin URL Path (e.g., uradmincontent-q8h4z9b3x7c2)
    ADMIN_SECRET_PATH=your-secret-admin-path

    # Supabase Credentials (get from your Supabase project settings -> API)
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
    # This is a SECRET key with write access. Get it from Project Settings -> API -> Service Role Key
    SUPABASE_SERVICE_ROLE_KEY=your-secret-service-role-key
    ```

4.  **Set up Supabase Storage (for image uploads):**
    You need to create a public storage bucket to hold your course images.
    1.  Go to your Supabase project dashboard.
    2.  In the left sidebar, click the **Storage** icon.
    3.  Click **Create a new bucket**.
    4.  For the bucket name, enter **`course-images`**.
    5.  Toggle **Public bucket** to **ON**.
    6.  Click **Create bucket**.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`. To access the admin panel, navigate to `http://localhost:3000/your-secret-admin-path`.

## Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Lints the project files.

## Features

-   **Server-Side Rendering (SSR) with Next.js**: Blazing fast performance and excellent SEO.
-   **Clean, SEO-friendly URLs**: Each course and category has its own dedicated URL.
-   **Secure Admin URL & Login**: The admin panel is hidden behind a secret URL and features secure, server-side authentication.
-   **Two Visual Themes**: Switch between 'Iris' (teal/mint) and 'Pristine' (red) themes.
-   **Dynamic Content Management**: A full admin panel to manage all site content.
-   **Direct Image Uploads**: Upload course images directly to Supabase storage from the admin panel.
-   **Advanced Search**: A full-screen overlay with live search results.
-   **Responsive Design**: Fully responsive layout for all screen sizes.
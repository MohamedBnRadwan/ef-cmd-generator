# EF Command Generator

A modern, highly aesthetic, and premium React web application to generate Entity Framework (EF Core and EF6) commands dynamically. Built with React, Vite, Tailwind CSS, and Lucide Icons.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm or yarn

### Installation

1. Clone or navigate to the repository directory.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

---

## 🛠️ How to Use the Site

### 1. Manage Profiles
The left sidebar is your control center for different project environments.
- **Create a Profile:** Click the `+` button in the **Profiles** section to scaffold a new setup.
- **Switch Profiles:** Click on any profile in the list to load its configurations. 
- **Rename Profile:** Click on the large profile name at the top of the screen to edit it directly.
- **Clone / Delete:** Use the **Clone Profile** button at the top, or hover over a profile in the sidebar to reveal the **Trash (Delete)** button.

### 2. Choose Your EF Version
Toggle between **EF Core (CLI)** and **EF6 (PMC)** using the glowing segmented control in the top header. The command templates will instantly transform based on your selection:
- **EF Core:** Generates `dotnet ef ...` commands.
- **EF6:** Generates Package Manager Console commands like `Add-Migration ...`.

### 3. Configure Parameters
In the **Configuration Parameters** section, fill in the details of your project:
- **Startup Project:** The entry-point project (e.g., `MyApi.csproj`).
- **Target Project:** The project where your DbContext and Migrations live (e.g., `Infrastructure.csproj`).
- **DbContext Name:** The name of your DbContext class (e.g., `ApplicationDbContext`).
- **Migration Name:** The name for your next migration (e.g., `InitialCreate`).
- **Extra Flags:** Any custom parameters you wish to append (e.g., `--verbose` or `-Force`).

*As you type, the generated commands on the right will update in real-time.*

### 4. Copy Commands
The **Generated Commands** panel provides a live, terminal-style preview of the exact commands you need.
- Click the **Copy** button on any command card.
- A visual "Copied!" confirmation will appear.
- Paste the command into your terminal or Package Manager Console.

### 5. Import and Export Configurations
Need to share your setups with your team or back them up?
- **Export:** Click **Export** at the bottom of the sidebar to download your profiles as an `ef-profiles.json` file.
- **Import:** Click **Import** to upload a previously saved `.json` file and restore your configurations.

---

## 🎨 Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Custom Dark Mode + Glassmorphism UI)
- **Icons:** Lucide React
- **State Persistence:** LocalStorage API

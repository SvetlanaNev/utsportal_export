# UTS Startup Portal (V2)

This is a secure portal for UTS (University of Technology Sydney) startup members to view their team information and request changes to their profiles.

This project is built with Next.js (App Router), TypeScript, and Tailwind CSS. It uses Airtable as the primary data store and Vercel Postgres for logging change requests.

## Key Features

- **Airtable-Driven Authentication:** Login is handled via "magic links" sent by an Airtable Automation. The application generates a token, stores it in Airtable, and an automation sends the email.
- **Stateless Sessions:** User sessions are managed with JWTs stored in secure, `httpOnly` cookies.
- **Change Request Logging:** All changes to user or startup data are requested through a form and logged in a Postgres database using Prisma.
- **UI built with shadcn/ui:** Clean and modern interface built with the best-in-class component library.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Access to a Vercel account (for Vercel Postgres)
- Access to an Airtable account

### 1. Clone the repository

```bash
git clone https://github.com/your-username/utssportal.git
cd utssportal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Then, fill in the required values in the `.env` file:

- `DATABASE_URL`: Connection string for your Vercel Postgres database.
- `AIRTABLE_BASE_ID`: The ID of your Airtable base.
- `AIRTABLE_API_KEY`: Your Airtable Personal Access Token.
- `JWT_SECRET`: A long, random, secret string for signing JWTs. You can generate one with `openssl rand -hex 32`.

### 4. Set up the Database

Run the following command to sync your Prisma schema with your Vercel Postgres database. This will create the `change_requests` table.

```bash
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Airtable Setup

This application relies on a specific Airtable Base structure and an Automation to function correctly.

### Base Structure

Create a new Airtable Base with the following two tables:

**Table 1: `UTS Startups`**

| Field Name                       | Field Type     | Notes                               |
| -------------------------------- | -------------- | ----------------------------------- |
| `Startup Name (or working title)`| Single line text |                                     |
| `Primary contact email`          | Email          |                                     |
| `Team`                           | Link to another record | Link to the `Team Members` table |
| `Magic Link Token`               | Single line text | For the login flow                  |
| `Token Expires At`               | Date           | With "Include a time field" enabled |

**Table 2: `Team Members`**

| Field Name                       | Field Type     | Notes                               |
| -------------------------------- | -------------- | ----------------------------------- |
| `Team member ID`                 | Single line text | The name of the team member         |
| `Personal email*`                | Email          | The login email for the member      |
| `Position at startup*`           | Single line text |                                     |
| `Mobile*`                        | Phone number   |                                     |
| `What is your association to UTS?*`| Single line text |                                     |
| `Startup*`                       | Link to another record | Link to the `UTS Startups` table   |
| `Magic Link Token`               | Single line text | For the login flow                  |
| `Token Expires At`               | Date           | With "Include a time field" enabled |

### Airtable Automation

You need to set up an Airtable Automation that sends the magic link email when a token is generated.

1.  Go to the **Automations** tab in your Airtable base.
2.  Create a new automation.
3.  **Trigger:** Select "When a record is updated".
    -   **Table:** `UTS Startups`
    -   **Fields:** Watch the `Magic Link Token` field.
4.  **Action:** Select "Send an email".
    -   **To:** Choose the `Primary contact email` field from the record.
    -   **Subject:** `Your Magic Login Link for UTS Startup Portal`
    -   **Message:** Compose an email body that includes the magic link. Use the `Magic Link Token` from the record to construct the URL.

    **Example Email Body:**
    ```
    Hello,

    Click the link below to log in to the UTS Startup Portal. This link will expire in 15 minutes.

    https://<your-vercel-app-domain>/api/auth/verify?token={Magic Link Token}

    (If you did not request this link, you can safely ignore this email.)
    ```
5.  **Repeat for Team Members:** Create a similar automation for the `Team Members` table, using the `Personal email*` field in the "To" line of the email action.

## Deployment

This application is designed to be deployed on [Vercel](https://vercel.com/).

1.  Push your code to a GitHub repository.
2.  Import the repository into Vercel.
3.  Configure the Environment Variables in the Vercel project settings.
4.  Deploy!

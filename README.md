# Hoorain-Scheduler 🚀
> Autonomous, multi-platform social media distribution and scheduling command center.

Hoorain-Scheduler is a production-grade web application engineered to orchestrate social media publishing across **6 major platforms** and **25+ destinations**, featuring offline-first persistence, automated missed-task detection, recurring schedule generation, and Supabase cloud replication.

---

## ✨ Core Features

1. **6 Platforms Integrated**:
   - **Facebook**: Brand Pages, Community Groups, Support Desks
   - **WhatsApp**: Official Channels, VIP Groups, Broadcast Lists
   - **X (Twitter)**: Brand Handle, Founder Voice, Changelogs
   - **LinkedIn**: Corporate Pages, Personal Profiles, Showcase Pages
   - **Pinterest**: Infographics, Blog Articles, Motivation, Product Catalogs
   - **Meta Business Suite**: Feed Planners, Reels & Stories Scheduler, Boosted Campaigns

2. **27 Pre-configured Destinations**:
   - Out-of-the-box targets with full CRUD (add, edit, pause/activate, delete, or reset to factory defaults).

3. **Intelligent Scheduling & Cadence**:
   - Day / date / time / post-count target tracking (e.g. Post 1 of 3).
   - **Recurring Engine**: Generate upcoming scheduled instances up to 14–30 days ahead based on daily, weekday, weekend, or custom weekly patterns.

4. **Automated Missed-Task Detection**:
   - Background worker running periodically flags uncompleted posts past their scheduled time as `missed` with attention badges and 1-click **Reschedule** or **Complete Now**.

5. **Multi-View Interface**:
   - **Dashboard**: Real-time KPI stats (Today's output, Overall completion rate %, Missed count, Active destinations) + 6-Platform breakdown cards.
   - **Today's Tasks**: Time-bucketed checklist (Morning, Afternoon, Evening) with clickable `✓ Complete` toggle and confetti celebrations.
   - **Weekly Roadmap**: 7-day swimlane overview (Mon–Sun) with daily post volume counters and completion bars.
   - **Interactive Calendar**: Full month grid with colored platform badge chips and click-to-view date itinerary drawer.
   - **Destinations Hub**: Filter, toggle, and test open all 27 distribution targets.

6. **"Open Platform" Smart Publishing**:
   - Copies post copy and hashtags to the system clipboard.
   - Displays non-blocking notification toast.
   - Launches web intents (Twitter composer, WhatsApp Web with text, LinkedIn share) or direct destination composers.

7. **Offline-First & Supabase Cloud Integration**:
   - Works 100% offline via local persistence engine.
   - Ready for cloud replication with Supabase: full PostgreSQL DDL schema with Row Level Security (RLS) located in `supabase/schema.sql`.

8. **Data Portability**:
   - 1-Click JSON full state backup & restore.
   - CSV spreadsheet export & import for bulk scheduling via Excel or Google Sheets.

---

## 🛠️ Quickstart

### Prerequisites
- Node.js >= 18
- npm >= 9

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Test Suite
```bash
npx vitest run
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🗄️ Supabase Cloud Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. In Hoorain-Scheduler, click the **Supabase Sync** button in the navbar and enter your project URL and Anon public key.
5. Click **Test Connection** and **Push to Cloud**.

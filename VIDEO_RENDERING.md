# Video Rendering & Storage

## How Video Rendering Works

When you click the **"Render Video"** button, the following process occurs:

### 1. **Save Project**
- Project configuration is saved to the database
- Timeline data (clips, duration, transitions) is stored

### 2. **Create Render Job**
- A render job is created in the `render_jobs` table
- Job status: `queued` → `processing` → `completed` or `failed`
- Job includes:
  - Project ID
  - Timeline configuration
  - Render settings (resolution, FPS, quality)
  - Timestamps (created, started, completed)

### 3. **Job Queue** (TODO: Not Yet Implemented)
- Job is sent to Redis/BullMQ queue
- Worker service picks up the job
- FFmpeg processes the video rendering
- Rendered video is uploaded to storage

### 4. **Video Storage**
Videos will be stored in **Cloudflare R2** (S3-compatible storage):
- **Path**: `/rendered-videos/{userId}/{projectId}/{jobId}.mp4`
- **Public URL**: Available after rendering completes
- **Retention**: 30 days for free users, unlimited for premium

---

## Current Implementation Status

### ✅ **Completed**
- ✅ Save project before rendering
- ✅ Create render job in database
- ✅ API endpoint: `POST /api/projects/[id]/render`
- ✅ Job tracking with ID
- ✅ Success/error notifications

### 🚧 **TODO (Not Yet Implemented)**
- ⏳ Worker service (FFmpeg rendering)
- ⏳ Redis/BullMQ job queue
- ⏳ Cloudflare R2 storage integration
- ⏳ Video download link generation
- ⏳ Render progress polling
- ⏳ Email notification on completion

---

## Where Videos Are Currently Saved

**Current Status**: Videos are **NOT YET RENDERED** to actual MP4 files.

When you click "Render Video":
1. ✅ Project is saved to database
2. ✅ Render job is created with status "queued"
3. ❌ No actual video file is generated yet

**Why?** The worker service that performs FFmpeg rendering is not yet implemented.

---

## Planned Architecture

```
User clicks "Render Video"
    ↓
Save project to database
    ↓
Create render job (status: queued)
    ↓
Send job to Redis queue
    ↓
Worker picks up job (status: processing)
    ↓
FFmpeg renders video from timeline
    ↓
Upload MP4 to Cloudflare R2
    ↓
Update job (status: completed)
    ↓
User gets download link
```

---

## API Endpoints

### Create Render Job
```
POST /api/projects/[id]/render
```

**Request Body:**
```json
{
  "timeline": [...],
  "duration": 120,
  "resolution": "1920x1080",
  "fps": 30,
  "quality": "high"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid-here",
  "message": "Render job created successfully"
}
```

### Check Render Status
```
GET /api/projects/[id]/render
```

**Response:**
```json
{
  "job": {
    "id": "uuid",
    "status": "queued | processing | completed | failed",
    "progress": 45,
    "error_message": null,
    "started_at": "2025-10-07T19:00:00Z",
    "completed_at": null
  }
}
```

---

## Database Schema

### `render_jobs` Table
```sql
CREATE TABLE render_jobs (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
  progress INTEGER DEFAULT 0,   -- 0-100
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `projects` Table (config field)
```json
{
  "timeline": [...],
  "duration": 120,
  "lastRender": {
    "jobId": "uuid",
    "settings": {
      "resolution": "1920x1080",
      "fps": 30,
      "quality": "high"
    },
    "startedAt": "2025-10-07T19:00:00Z"
  }
}
```

---

## Next Steps to Complete Rendering

To fully implement video rendering:

1. **Set up Worker Service**
   - Create `apps/worker` with FFmpeg
   - Connect to Redis queue
   - Process render jobs

2. **Configure Cloudflare R2**
   - Set up bucket
   - Configure access credentials
   - Add upload logic

3. **Implement Progress Updates**
   - WebSocket or polling
   - Real-time progress bar
   - Email notifications

4. **Add Download Feature**
   - Generate signed URLs
   - Download button in UI
   - Share link functionality

---

## Temporary Workaround

Until worker service is implemented, render jobs will:
- ✅ Save to database
- ✅ Show "Rendering started" message
- ❌ Stay in "queued" status indefinitely
- ❌ Not produce actual MP4 file

To check job status:
```bash
# Query database
SELECT * FROM render_jobs WHERE project_id = 'your-project-id';
```

---

## Questions?

**Q: Where will my rendered videos be saved?**
A: Cloudflare R2 storage at `/rendered-videos/{userId}/{projectId}/{jobId}.mp4`

**Q: How long does rendering take?**
A: Approximately 1-2 minutes per minute of video (once worker is implemented)

**Q: Can I download the rendered video?**
A: Yes, once rendering is complete, you'll get a download link (feature coming soon)

**Q: What happens if rendering fails?**
A: Job status will be "failed" with an error message explaining the issue

---

Last Updated: October 7, 2025

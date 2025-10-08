# Royalty-Free Music Sources for Audio Library

Research completed: 2025-10-08

## 🎯 Executive Summary

This document contains researched sources for royalty-free music that can be integrated into the SlideShow audio library. Sources are categorized by integration method, licensing model, and implementation complexity.

---

## 📊 Quick Comparison Table

| Source | Type | API Available | Cost | Attribution Required | Best For |
|--------|------|--------------|------|---------------------|----------|
| Pixabay Music | Platform | ✅ Yes | Free | ❌ No | Easy integration, no legal issues |
| YouTube Audio Library | Platform | ❌ No | Free | ⚠️ Some tracks | Large selection, trusted source |
| Incompetech (Kevin MacLeod) | Individual | ❌ No | Free/$30+ | ✅ Yes (or pay $30+) | Professional quality, well-known |
| Free Music Archive | Platform | ❌ Shut down | Free | ⚠️ Varies | Large collection, but no API |
| Jamendo | Platform | ⚠️ Unknown | Free | ⚠️ Varies | 600k+ tracks from indie artists |
| Beatoven.ai | AI Generator | ✅ Yes | Paid | ❌ No | AI-generated, unique music |
| Freesound | Platform | ✅ Yes | Free | ⚠️ Varies | Sound effects + music |
| Mixkit | Platform | ❌ No | Free | ❌ No (appreciated) | High quality, easy download |

---

## 🚀 Recommended Implementation Priority

### Tier 1: Easy & Free (Implement First)

#### 1. Pixabay Music API ⭐ TOP CHOICE
- **URL**: https://pixabay.com/music/
- **API Docs**: https://pixabay.com/api/docs/
- **License**: Content License (free for commercial use)
- **Attribution**: Not required
- **Tracks**: Thousands of high-quality MP3s
- **Cost**: FREE
- **Why Best**:
  - Full API access
  - No attribution required
  - No legal complications
  - Easy to integrate
  - Trusted platform (same as Pixabay images)

**Implementation Steps**:
```typescript
// 1. Register for API key at pixabay.com
// 2. API endpoint: https://pixabay.com/api/videos/
// 3. Search for audio: ?key=YOUR_KEY&q=background+music
// 4. Download MP3s directly from API response
```

#### 2. Mixkit
- **URL**: https://mixkit.co/free-stock-music/
- **API**: No official API, but simple scraping possible
- **License**: Free for commercial use
- **Attribution**: Appreciated but not required
- **Why Good**: High-quality curated tracks, clean downloads

#### 3. YouTube Audio Library (Manual Curation)
- **URL**: https://studio.youtube.com (Audio Library section)
- **API**: No public API
- **License**: Royalty-free for YouTube and beyond
- **Attribution**: Required for some tracks (CC licensed)
- **Implementation**:
  - Manually download popular tracks
  - Store in R2/S3
  - Provide in-app library
  - Display attribution when required

---

### Tier 2: AI-Generated (Unique Content)

#### 4. Beatoven.ai API
- **URL**: https://www.beatoven.ai/
- **API**: ✅ Yes
- **License**: 100% royalty-free, AI-generated
- **Cost**: Paid API (pricing on request)
- **Why Interesting**:
  - Generate unique music per video
  - Text-to-music, video-to-music
  - No licensing concerns
  - Matches video context

**Use Cases**:
- Generate background music based on video content
- Create unique soundtracks for each project
- Avoid repetitive library music

#### 5. Mubert AI
- **URL**: https://mubert.com/
- **API**: ✅ Yes
- **License**: AI-generated, royalty-free
- **Cost**: Paid API
- **Similar to Beatoven**: Versatile AI music generation

---

### Tier 3: Manual Curation (No API)

#### 6. Incompetech (Kevin MacLeod)
- **URL**: https://incompetech.com/music/royalty-free/
- **Tracks**: 2,000+ professional compositions
- **License**: Creative Commons Attribution
- **Cost Options**:
  - Free with attribution
  - $30 for 1 song (no attribution)
  - $50 for 2 songs
  - $20/song for 3+ songs
- **Why Popular**: Widely used in YouTube videos, professional quality

**Implementation**:
- Purchase no-attribution licenses for popular tracks
- Store in audio library with proper metadata
- Very cost-effective for app-wide library

#### 7. Free Music Archive (FMA)
- **URL**: https://freemusicarchive.org/
- **API**: ❌ Shut down due to server load
- **License**: Various Creative Commons licenses
- **Tracks**: Massive collection of indie/CC music
- **Implementation**: Manual download and curation only

#### 8. Jamendo
- **URL**: https://www.jamendo.com/
- **Tracks**: 600,000+ from 40,000 artists
- **License**: Creative Commons, varies by track
- **API**: Unknown if available
- **Implementation**: Investigate API, otherwise manual curation

---

### Tier 4: Sound Effects & Additional Audio

#### 9. Freesound API
- **URL**: https://freesound.org/
- **API**: ✅ Yes (full documentation)
- **License**: Creative Commons (varies by sound)
- **Content**: Sound effects + some music
- **Best For**: Sound effects, transitions, UI sounds

#### 10. Pixabay Sound Effects
- **URL**: https://pixabay.com/sound-effects/
- **Tracks**: 110,000+ free sound effects
- **License**: Same as music (free, no attribution)
- **API**: Same Pixabay API

---

## 💡 Implementation Recommendations

### Phase 1: Quick Win (Week 1)
1. **Integrate Pixabay Music API**
   - Register API key
   - Build search/browse interface
   - Allow users to search and add tracks
   - Store selected tracks in R2/S3
   - Estimated effort: 4-6 hours

### Phase 2: Curated Library (Week 2)
2. **Manual Curation from Multiple Sources**
   - Download 50-100 popular tracks from:
     - YouTube Audio Library (free section)
     - Mixkit (best tracks)
     - Incompetech (purchase 10-20 licenses at $20 each = $200-400)
   - Organize by genre/mood
   - Upload to R2/S3
   - Create in-app browsable library
   - Estimated cost: $200-400
   - Estimated effort: 8-12 hours

### Phase 3: AI Generation (Month 2)
3. **Integrate AI Music API**
   - Sign up for Beatoven.ai or Mubert
   - Add "Generate Music" feature
   - Allow users to create custom tracks
   - Cost: Variable per generation
   - Estimated effort: 16-24 hours

### Phase 4: Advanced Features (Month 3+)
4. **Advanced Music Features**
   - Music trimming/editing
   - BPM detection and sync
   - Audio waveform visualization
   - Fade in/out controls
   - Volume adjustment per track

---

## 📋 Legal Considerations

### Safe Options (No Legal Risk)
- ✅ Pixabay Music (Content License)
- ✅ Mixkit (No attribution)
- ✅ Incompetech with paid licenses
- ✅ AI-generated music (Beatoven, Mubert)

### Requires Attribution (Medium Risk)
- ⚠️ Free Music Archive (varies by track)
- ⚠️ Jamendo (varies by track)
- ⚠️ YouTube Audio Library (some CC tracks)
- ⚠️ Freesound (varies by sound)

**Risk Mitigation**:
- Display attribution in video credits
- Store license info with each track
- Provide "Music Credits" export feature

---

## 🔧 Technical Implementation Notes

### Database Schema Addition
```sql
-- Add to packages/db/src/schema/
CREATE TABLE audio_tracks (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  duration INTEGER, -- seconds
  file_url TEXT NOT NULL,
  file_size INTEGER,
  source VARCHAR(50), -- 'pixabay', 'youtube', 'incompetech', etc.
  genre VARCHAR(100),
  mood VARCHAR(100),
  bpm INTEGER,
  license_type VARCHAR(50), -- 'cc0', 'cc-by', 'royalty-free', etc.
  attribution_required BOOLEAN DEFAULT false,
  attribution_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search index
CREATE INDEX idx_audio_genre ON audio_tracks(genre);
CREATE INDEX idx_audio_mood ON audio_tracks(mood);
```

### API Integration Example (Pixabay)
```typescript
// apps/web/src/lib/audio/pixabay.ts

interface PixabayAudioResponse {
  total: number
  totalHits: number
  hits: Array<{
    id: number
    pageURL: string
    type: 'audio'
    tags: string
    duration: number
    picture_id: string
    user: string
    userImageURL: string
  }>
}

export async function searchPixabayMusic(query: string) {
  const apiKey = process.env.PIXABAY_API_KEY
  const url = `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=20`

  const response = await fetch(url)
  const data: PixabayAudioResponse = await response.json()

  return data.hits.map(track => ({
    id: track.id,
    title: track.tags,
    artist: track.user,
    duration: track.duration,
    thumbnailUrl: track.userImageURL,
    sourceUrl: track.pageURL,
  }))
}
```

### UI Components Needed
1. **Audio Browser Panel**
   - Search bar
   - Genre filters (Background, Cinematic, Electronic, etc.)
   - Mood filters (Happy, Dramatic, Relaxing, etc.)
   - Grid/list view toggle
   - Preview player (play button)

2. **Audio Track Card**
   - Track title + artist
   - Duration display
   - Preview play button
   - Add to timeline button
   - Attribution badge (if required)

3. **Timeline Audio Track**
   - Waveform visualization
   - Volume control
   - Trim/crop controls
   - Fade in/out controls

---

## 📊 Cost Analysis

### Free Options (Recommended Start)
- Pixabay API: $0/month
- YouTube Audio Library: $0 (manual)
- Mixkit: $0 (manual)
- **Total**: $0

### One-Time Purchases
- Incompetech licenses: $200-400 for 10-20 tracks
- **Total**: $200-400 one-time

### Ongoing Subscription (Optional)
- Beatoven.ai API: Contact for pricing
- Mubert API: Contact for pricing
- Soundstripe: $15/month individual
- Epidemic Sound: $15/month individual
- **Total**: $15-50/month if needed

**Recommendation**: Start with free options (Pixabay + manual curation). Add paid options only if users demand more variety.

---

## 🎯 Success Metrics

Track these metrics after implementation:

1. **User Engagement**
   - % of projects using audio library
   - Average tracks per project
   - Most popular tracks/genres

2. **Performance**
   - Audio search response time
   - Download/streaming speed
   - Storage costs (R2/S3)

3. **Legal Compliance**
   - Attribution display rate
   - User-reported licensing issues
   - DMCA takedown requests (should be zero)

---

## 📝 Next Steps

1. ✅ Research completed
2. ⏳ Get approval for implementation approach
3. ⏳ Register for Pixabay API key
4. ⏳ Design audio browser UI
5. ⏳ Implement Pixabay integration
6. ⏳ Curate initial manual library
7. ⏳ Add audio track database schema
8. ⏳ Build audio timeline visualization

---

## 📚 Additional Resources

- Pixabay API Docs: https://pixabay.com/api/docs/
- Creative Commons Licenses: https://creativecommons.org/licenses/
- Freesound API: https://freesound.org/docs/api/
- YouTube Creator Music: https://support.google.com/youtube/answer/3376882
- Music Licensing Guide: https://www.soundstripe.com/music-licensing-101

---

**Last Updated**: 2025-10-08
**Research By**: Claude Code
**Status**: Ready for implementation

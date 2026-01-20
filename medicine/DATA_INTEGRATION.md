# 🔗 Application Data Flow - Complete Integration Guide

## How Everything Connects

Your Robtor Health Assistant is now **fully integrated** - all features work together seamlessly!

## 📊 Data Flow Diagram

```
Medical Report Upload
        ↓
    AI Analysis
        ↓
    ├─→ Saves to Database (reports table)
    ├─→ Extracts Health Metrics
    ├─→ Updates Dashboard (health_metrics table)
    ├─→ Generates Personalized Recommendations
    └─→ Available to Chat AI for Context
```

## 🔄 Feature Integration

### 1. **Report → Dashboard**
When you upload a medical report:
1. AI analyzes the report and extracts data
2. Click "**Update Dashboard**" button
3. System extracts:
   - Heart rate
   - Blood oxygen levels
   - Other vital signs
4. Saves to `health_metrics` table
5. Dashboard automatically refreshes
6. Charts and metrics update with your data

### 2. **Report → Recommendations**
The personalized recommendations pull from:
- Latest medical report analysis
- Recent health metrics (steps, heart rate, sleep)
- User profile data

**Result**: Custom diet plans, exercise routines, and lifestyle advice based on YOUR actual health data!

### 3. **Report → Chat AI**
When you chat, the AI has access to:
- Your latest medical report results
- Today's health metrics
- Health score and summary
- Recent test results

**Example**:
```
You: "What should I do about my cholesterol?"

AI knows:
- Your cholesterol level: 245 mg/dL (High)
- Your health score: 68/100
- Recent activity: 5,000 steps/day

AI responds with personalized advice specific to YOUR data!
```

### 4. **Dashboard → Recommendations**
- Dashboard shows current health metrics
- Recommendations service analyzes this data
- Generates personalized plans
- Updates when new data is added

### 5. **All Data → Profile**
Everything is tied to your user profile:
- Reports stored per user
- Metrics filtered by user
- Chat history per user
- Recommendations personalized per user

## 🎯 Complete User Journey

### Step 1: Upload Report
```
Reports Tab → Upload medical report → AI analyzes
```

### Step 2: Update Dashboard
```
Click "Update Dashboard" → Metrics extracted → Dashboard refreshed
```

### Step 3: View Personalized Plans
```
Dashboard → "View Diet Plan" → See YOUR custom meal recommendations
Dashboard → "View Fitness Plan" → See YOUR custom workout routine
```

### Step 4: Chat with Context
```
Chat Tab → Ask health questions
AI has your report data → Gives personalized responses
```

### Step 5: Track Progress
```
Dashboard updates daily
Weekly charts show trends
AI adjusts recommendations based on progress
```

## 💾 Database Tables & Relationships

### `profiles`
- User information
- Demographics
- Onboarding data
- **Links to**: health_metrics, reports, chat_history

### `health_metrics`
- Daily health data
- Steps, heart rate, sleep, oxygen
- **Updated by**: Manual entry, wearables, medical reports
- **Used by**: Dashboard, Recommendations

### `reports`
- Uploaded medical reports
- AI analysis results
- Diet & fitness plans
- **Used by**: Dashboard, Chat, Recommendations

### `chat_history`
- Conversation messages
- **Enhanced with**: Report data, health metrics
- **Provides**: Contextual AI responses

## 🔐 Data Security

- **Row Level Security (RLS)**: Users only see their own data
- **Encrypted Storage**: All health data encrypted
- **Authentication Required**: Must be logged in
- **Privacy Policies**: Control who can access your data

## 🚀 Pro Tips

### Get the Most Accurate Recommendations:
1. Upload medical reports regularly
2. Update dashboard after each report
3. Log daily metrics (steps, sleep)
4. Check dashboard weekly for trends

### Better Chat Responses:
1. Upload recent report first
2. Ask specific questions
3. Reference your actual test results
4. AI will use your data automatically

### Track Your Progress:
1. Check weekly charts
2. Compare health scores
3. Follow personalized plans
4. Update metrics regularly

## 🔧 Technical Details

### Health Metrics Update Flow:
```javascript
1. Report Analysis Complete
   ↓
2. Extract Metrics:
   - Heart Rate (from pulse/HR tests)
   - Blood Oxygen (from SpO2/oxygen tests)
   - Default values for missing data
   ↓
3. Call HealthService.upsertMetric()
   ↓
4. Database updated (unique constraint on user_id, date)
   ↓
5. Dashboard fetchData() called
   ↓
6. UI refreshes with new data
```

### Chat Context Injection:
```javascript
1. User sends message
   ↓
2. Fetch latest report & today's metrics
   ↓
3. Build context string with:
   - Health score
   - Test results
   - Current metrics
   ↓
4. Append to user message (hidden from user)
   ↓
5. Send to AI with conversation history
   ↓
6. AI generates personalized response
```

### Recommendation Generation:
```javascript
1. User views Diet/Fitness plan
   ↓
2. Fetch: Latest report + Weekly metrics + Today's data
   ↓
3. Extract insights:
   - Health conditions (diabetes, heart health, etc.)
   - Activity level (low, moderate, high)
   - Sleep quality
   ↓
4. Generate recommendations:
   - Diet based on conditions
   - Exercise based on activity level
   - Lifestyle based on sleep/stress
   ↓
5. Display in modal
```

## 📈 Data Consistency

All features use the same data sources:
- ✅ Latest report from `reports` table
- ✅ Health metrics from `health_metrics` table
- ✅ User profile from `profiles` table
- ✅ Real-time synchronization

## 🎉 Result

You have a **truly integrated health assistant** where:
- Every feature knows about your health data
- AI provides personalized responses
- Recommendations adapt to your actual metrics
- Everything updates in real-time
- Your complete health story is connected!

**This is your personal health command center!** 🏥💚

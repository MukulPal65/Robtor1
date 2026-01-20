# Database Setup Instructions

## Important: Run This Migration First!

Before using the application, you need to apply the database migration to fix the health_metrics table constraints.

## How to Apply the Migration

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Navigate to your project: `alxldbvcqncqealhadoa`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy and paste the following SQL code:

```sql
-- Add unique constraint to health_metrics for upsert operations
-- This allows ON CONFLICT to work properly
ALTER TABLE health_metrics 
ADD CONSTRAINT IF NOT EXISTS health_metrics_user_date_unique UNIQUE (user_id, date);

-- Add update policy for health_metrics
CREATE POLICY IF NOT EXISTS "Users can update their own health metrics."
  ON health_metrics FOR UPDATE
  USING (auth.uid() = user_id);
```

4. **Click "Run"** to execute the migration

## Verification

After running the migration, you can verify it worked by running:

```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'health_metrics';
```

You should see a UNIQUE constraint named `health_metrics_user_date_unique`.

## What This Fixes

- ✅ **ON CONFLICT error**: Allows the app to upsert (insert or update) health metrics without errors
- ✅ **Database constraint errors**: Prevents duplicate health metric entries for the same user and date
- ✅ **Update policy**: Allows users to update their own health metrics

## Already Configured

The following are already set up and working:

### ✅ API Keys (.env file)
- **Supabase**: Database and authentication
- **OpenRouter/Gemini**: AI chat and report analysis
- **Multiple AI Models**: Fallback options for reliability

### ✅ Features Working
- **OCR Scanning**: Upload medical reports → AI extracts data → Saves to database
- **Emergency Calling**: Click emergency numbers → Opens phone dialer
- **Personalized Recommendations**: AI analyzes your health data and reports to provide:
  - Custom diet plans based on your conditions
  - Exercise routines tailored to your activity level
  - Lifestyle and stress management tips
  - Medical monitoring suggestions
- **Logout**: Properly signs out and redirects to login

## Next Steps

1. Run the database migration (instructions above)
2. Start the application: `npm run dev`
3. Sign up or log in
4. Upload a medical report to get personalized recommendations
5. Check the Dashboard for your health metrics and AI-powered insights

## Troubleshooting

**If you still see database errors:**
- Make sure you ran the migration SQL in your Supabase dashboard
- Check that you're logged in (authentication required for most features)
- Try refreshing the page

**If API calls fail:**
- Check that your .env file exists in the medicine folder
- Verify API keys are valid
- Check browser console for specific error messages

## Support

For issues or questions:
- Check browser console (F12) for error messages
- Verify database migration was successful
- Ensure you're using the correct Supabase project

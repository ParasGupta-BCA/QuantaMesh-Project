-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job that runs daily at 9 AM UTC to send follow-up emails
SELECT cron.schedule(
  'send-daily-followup-emails',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://hnnlhddnettfaapyjggx.supabase.co/functions/v1/send-followup-emails',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
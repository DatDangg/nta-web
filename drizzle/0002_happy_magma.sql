-- HIGH_RISK_MIGRATION: approved 2026-11-09 by Bruce
ALTER TABLE "content_entries" DROP CONSTRAINT "content_entries_locale_check";--> statement-breakpoint
ALTER TABLE "content_entries" ADD CONSTRAINT "content_entries_locale_check" CHECK ("content_entries"."locale" IN ('vi', 'en', 'ja'));
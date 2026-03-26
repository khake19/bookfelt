


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, is_premium)
  values (new.id, false);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."pull_changes"("p_user_id" "uuid", "p_last_pulled_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result jsonb;
  since timestamptz := COALESCE(p_last_pulled_at, '1970-01-01T00:00:00Z'::timestamptz);
BEGIN
  SELECT jsonb_build_object(
    'books', jsonb_build_object(
      'created', COALESCE((
        SELECT jsonb_agg(to_jsonb(b))
        FROM public.books b
        WHERE b.user_id = p_user_id
          AND b.created_at > since
          AND b.deleted = false
      ), '[]'::jsonb),
      'updated', COALESCE((
        SELECT jsonb_agg(to_jsonb(b))
        FROM public.books b
        WHERE b.user_id = p_user_id
          AND b.updated_at > since
          AND b.created_at <= since
          AND b.deleted = false
      ), '[]'::jsonb),
      'deleted', COALESCE((
        SELECT jsonb_agg(b.id)
        FROM public.books b
        WHERE b.user_id = p_user_id
          AND b.updated_at > since
          AND b.deleted = true
      ), '[]'::jsonb)
    ),
    'entries', jsonb_build_object(
      'created', COALESCE((
        SELECT jsonb_agg(to_jsonb(e))
        FROM public.entries e
        WHERE e.user_id = p_user_id
          AND e.created_at > since
          AND e.deleted = false
      ), '[]'::jsonb),
      'updated', COALESCE((
        SELECT jsonb_agg(to_jsonb(e))
        FROM public.entries e
        WHERE e.user_id = p_user_id
          AND e.updated_at > since
          AND e.created_at <= since
          AND e.deleted = false
      ), '[]'::jsonb),
      'deleted', COALESCE((
        SELECT jsonb_agg(e.id)
        FROM public.entries e
        WHERE e.user_id = p_user_id
          AND e.updated_at > since
          AND e.deleted = true
      ), '[]'::jsonb)
    ),
    'settings', jsonb_build_object(
      'created', COALESCE((
        SELECT jsonb_agg(to_jsonb(s))
        FROM public.settings s
        WHERE s.user_id = p_user_id
          AND s.created_at > since
          AND s.deleted = false
      ), '[]'::jsonb),
      'updated', COALESCE((
        SELECT jsonb_agg(to_jsonb(s))
        FROM public.settings s
        WHERE s.user_id = p_user_id
          AND s.updated_at > since
          AND s.created_at <= since
          AND s.deleted = false
      ), '[]'::jsonb),
      'deleted', COALESCE((
        SELECT jsonb_agg(s.id)
        FROM public.settings s
        WHERE s.user_id = p_user_id
          AND s.updated_at > since
          AND s.deleted = true
      ), '[]'::jsonb)
    ),
    'emotions', jsonb_build_object(
      'created', CASE
        WHEN p_last_pulled_at IS NULL THEN
          COALESCE((SELECT jsonb_agg(to_jsonb(em)) FROM public.emotions em), '[]'::jsonb)
        ELSE '[]'::jsonb
      END,
      'updated', '[]'::jsonb,
      'deleted', '[]'::jsonb
    )
  ) INTO result;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."pull_changes"("p_user_id" "uuid", "p_last_pulled_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."server_now"() RETURNS bigint
    LANGUAGE "sql" STABLE
    AS $$
  select (extract(epoch from now()) * 1000)::bigint
$$;


ALTER FUNCTION "public"."server_now"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "original_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "authors_json" "jsonb" DEFAULT '[]'::"jsonb",
    "description" "text",
    "page_count" integer,
    "cover_url" "text",
    "isbn" "text",
    "publisher" "text",
    "published_date" "text",
    "source" "text" NOT NULL,
    "status" "text" NOT NULL,
    "added_at" bigint NOT NULL,
    "first_impression" "text",
    "final_thought" "text",
    "exit_note" "text",
    "summary" "text",
    "first_impression_audio_uri" "text",
    "final_thought_audio_uri" "text",
    "exit_note_audio_uri" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    CONSTRAINT "books_source_check" CHECK (("source" = ANY (ARRAY['google'::"text", 'manual'::"text"]))),
    CONSTRAINT "books_status_check" CHECK (("status" = ANY (ARRAY['reading'::"text", 'want-to-read'::"text", 'finished'::"text", 'paused'::"text", 'dnf'::"text"])))
);


ALTER TABLE "public"."books" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."emotions" (
    "id" "text" NOT NULL,
    "label" "text" NOT NULL,
    "emoji" "text" NOT NULL,
    "color" "text" NOT NULL,
    "group" "text" NOT NULL,
    "sort_order" integer NOT NULL,
    "valence" double precision,
    "intensity" double precision,
    "category" "text",
    "control" double precision,
    CONSTRAINT "emotions_group_check" CHECK (("group" = ANY (ARRAY['core'::"text", 'secondary'::"text"])))
);


ALTER TABLE "public"."emotions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entries" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "text" NOT NULL,
    "original_id" "text" NOT NULL,
    "book_title" "text" NOT NULL,
    "chapter" "text",
    "page" "text",
    "percent" "text",
    "snippet" "text",
    "reflection" "text",
    "date" bigint NOT NULL,
    "entry_created_at" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "reflection_uri" "text",
    "setting" "text",
    "emotion_id" "text"
);


ALTER TABLE "public"."entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "is_premium" boolean DEFAULT false NOT NULL,
    "premium_expires_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "key" "text" NOT NULL,
    "value" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."emotions"
    ADD CONSTRAINT "emotions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_books_updated_at" ON "public"."books" USING "btree" ("updated_at");



CREATE INDEX "idx_books_user_id" ON "public"."books" USING "btree" ("user_id");



CREATE INDEX "idx_entries_book_id" ON "public"."entries" USING "btree" ("book_id");



CREATE INDEX "idx_entries_date" ON "public"."entries" USING "btree" ("date");



CREATE INDEX "idx_entries_emotion_id" ON "public"."entries" USING "btree" ("emotion_id");



CREATE INDEX "idx_entries_entry_created_at" ON "public"."entries" USING "btree" ("entry_created_at");



CREATE INDEX "idx_entries_updated_at" ON "public"."entries" USING "btree" ("updated_at");



CREATE INDEX "idx_entries_user_id" ON "public"."entries" USING "btree" ("user_id");



CREATE INDEX "idx_settings_updated_at" ON "public"."settings" USING "btree" ("updated_at");



CREATE INDEX "idx_settings_user_id" ON "public"."settings" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_settings_user_key_active" ON "public"."settings" USING "btree" ("user_id", "key") WHERE ("deleted" = false);



CREATE INDEX "profiles_id_idx" ON "public"."profiles" USING "btree" ("id");



CREATE OR REPLACE TRIGGER "set_books_updated_at" BEFORE UPDATE ON "public"."books" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_entries_updated_at" BEFORE UPDATE ON "public"."entries" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_settings_updated_at" BEFORE UPDATE ON "public"."settings" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "fk_entries_emotion" FOREIGN KEY ("emotion_id") REFERENCES "public"."emotions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can select emotions" ON "public"."emotions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Service role can manage profiles" ON "public"."profiles" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can delete own books" ON "public"."books" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own entries" ON "public"."entries" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own settings" ON "public"."settings" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own books" ON "public"."books" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own entries" ON "public"."entries" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own settings" ON "public"."settings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can select own books" ON "public"."books" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can select own entries" ON "public"."entries" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can select own settings" ON "public"."settings" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own books" ON "public"."books" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own entries" ON "public"."entries" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own settings" ON "public"."settings" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."emotions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."pull_changes"("p_user_id" "uuid", "p_last_pulled_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."pull_changes"("p_user_id" "uuid", "p_last_pulled_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."pull_changes"("p_user_id" "uuid", "p_last_pulled_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."server_now"() TO "anon";
GRANT ALL ON FUNCTION "public"."server_now"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."server_now"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";



GRANT ALL ON TABLE "public"."emotions" TO "anon";
GRANT ALL ON TABLE "public"."emotions" TO "authenticated";
GRANT ALL ON TABLE "public"."emotions" TO "service_role";



GRANT ALL ON TABLE "public"."entries" TO "anon";
GRANT ALL ON TABLE "public"."entries" TO "authenticated";
GRANT ALL ON TABLE "public"."entries" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Users can delete own audio files"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'audio-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can read own audio files"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'audio-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can update own audio files"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'audio-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)))
with check (((bucket_id = 'audio-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload audio files to own folder"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'audio-files'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));




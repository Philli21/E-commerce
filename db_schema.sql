


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






CREATE TYPE "public"."listing_condition" AS ENUM (
    'new',
    'used',
    'refurbished'
);


ALTER TYPE "public"."listing_condition" OWNER TO "postgres";


CREATE TYPE "public"."listing_status" AS ENUM (
    'active',
    'sold',
    'reserved',
    'inactive'
);


ALTER TYPE "public"."listing_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_conversation_member"("conv_id" "uuid", "check_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM conversation_participants 
    WHERE conversation_id = conv_id AND user_id = check_user_id
  );
$$;


ALTER FUNCTION "public"."is_conversation_member"("conv_id" "uuid", "check_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "icon" "text" NOT NULL,
    "parent_id" integer,
    "display_order" integer DEFAULT 0,
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."categories_id_seq" OWNED BY "public"."categories"."id";



CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "listing_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_message_id" "uuid",
    "created_by" "uuid"
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."favorites_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."favorites_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."favorites_id_seq" OWNED BY "public"."favorites"."id";



CREATE TABLE IF NOT EXISTS "public"."listing_images" (
    "id" integer NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."listing_images" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."listing_images_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."listing_images_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."listing_images_id_seq" OWNED BY "public"."listing_images"."id";



CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category_id" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price" numeric(12,2) NOT NULL,
    "price_negotiable" boolean DEFAULT true,
    "condition" "public"."listing_condition" NOT NULL,
    "location" "text" NOT NULL,
    "status" "public"."listing_status" DEFAULT 'active'::"public"."listing_status",
    "view_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "listings_price_check" CHECK (("price" >= (0)::numeric))
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "conversation_id" "uuid",
    "sender_id" "uuid",
    "content" "text",
    "listing_reference_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "read_at" timestamp with time zone
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "avatar_url" "text",
    "location" "text",
    "phone_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_location_check" CHECK (("location" = ANY (ARRAY['Addis Ababa'::"text", 'Dire Dawa'::"text", 'Mekelle'::"text", 'Gondar'::"text", 'Bahir Dar'::"text", 'Hawassa'::"text", 'Adama'::"text", 'Jimma'::"text", 'Jijiga'::"text", 'Dessie'::"text", 'Others'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."favorites" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."favorites_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."listing_images" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."listing_images_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_listing_id_key" UNIQUE ("user_id", "listing_id");



ALTER TABLE ONLY "public"."listing_images"
    ADD CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_conversation_participants_user" ON "public"."conversation_participants" USING "btree" ("user_id");



CREATE INDEX "idx_conversations_updated" ON "public"."conversations" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_favorites_user_id" ON "public"."favorites" USING "btree" ("user_id");



CREATE INDEX "idx_listings_category_id" ON "public"."listings" USING "btree" ("category_id");



CREATE INDEX "idx_listings_created_at" ON "public"."listings" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_listings_status" ON "public"."listings" USING "btree" ("status");



CREATE INDEX "idx_listings_user_id" ON "public"."listings" USING "btree" ("user_id");



CREATE INDEX "idx_messages_conversation" ON "public"."messages" USING "btree" ("conversation_id");



CREATE OR REPLACE TRIGGER "update_listings_updated_at" BEFORE UPDATE ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "fk_last_message" FOREIGN KEY ("last_message_id") REFERENCES "public"."messages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."listing_images"
    ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_listing_reference_id_fkey" FOREIGN KEY ("listing_reference_id") REFERENCES "public"."listings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view active listings" ON "public"."listings" FOR SELECT USING (("status" = 'active'::"public"."listing_status"));



CREATE POLICY "Authenticated users can create listings" ON "public"."listings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Categories are viewable by everyone" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Images are viewable by everyone" ON "public"."listing_images" FOR SELECT USING (true);



CREATE POLICY "Own favorites only" ON "public"."favorites" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Public profiles (limited)" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Sellers can delete images" ON "public"."listing_images" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND ("listings"."user_id" = "auth"."uid"())))));



CREATE POLICY "Sellers can delete own listings" ON "public"."listings" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Sellers can insert images" ON "public"."listing_images" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND ("listings"."user_id" = "auth"."uid"())))));



CREATE POLICY "Sellers can update images" ON "public"."listing_images" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND ("listings"."user_id" = "auth"."uid"())))));



CREATE POLICY "Sellers can update own listings" ON "public"."listings" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Sellers can view their own listings" ON "public"."listings" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can add participants to their conversations" ON "public"."conversation_participants" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."conversations"
  WHERE (("conversations"."id" = "conversation_participants"."conversation_id") AND ("conversations"."created_by" = "auth"."uid"())))));



CREATE POLICY "Users can delete own favorites" ON "public"."favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert conversations" ON "public"."conversations" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND (("created_by" IS NULL) OR ("created_by" = "auth"."uid"()))));



CREATE POLICY "Users can insert favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert messages into their conversations" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."conversation_participants"
  WHERE (("conversation_participants"."conversation_id" = "messages"."conversation_id") AND ("conversation_participants"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can manage own listings" ON "public"."listings" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read active listings" ON "public"."listings" FOR SELECT USING (("status" = 'active'::"public"."listing_status"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view messages in their conversations" ON "public"."messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."conversation_participants"
  WHERE (("conversation_participants"."conversation_id" = "messages"."conversation_id") AND ("conversation_participants"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own favorites" ON "public"."favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view participants of their conversations" ON "public"."conversation_participants" FOR SELECT USING ("public"."is_conversation_member"("conversation_id", "auth"."uid"()));



CREATE POLICY "Users can view their conversations" ON "public"."conversations" FOR SELECT USING ((("auth"."uid"() = "created_by") OR (EXISTS ( SELECT 1
   FROM "public"."conversation_participants" "cp"
  WHERE (("cp"."conversation_id" = "conversations"."id") AND ("cp"."user_id" = "auth"."uid"()))))));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversation_participants";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_conversation_member"("conv_id" "uuid", "check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_conversation_member"("conv_id" "uuid", "check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_conversation_member"("conv_id" "uuid", "check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_participants" TO "anon";
GRANT ALL ON TABLE "public"."conversation_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."favorites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."favorites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."favorites_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."listing_images" TO "anon";
GRANT ALL ON TABLE "public"."listing_images" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_images" TO "service_role";



GRANT ALL ON SEQUENCE "public"."listing_images_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."listing_images_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."listing_images_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."listings" TO "anon";
GRANT ALL ON TABLE "public"."listings" TO "authenticated";
GRANT ALL ON TABLE "public"."listings" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









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
































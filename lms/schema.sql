-- schema.sql for Lead Management System (LMS)
-- Based on requirements in lmstext.txt

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    note TEXT,
    created_time TIMESTAMPTZ DEFAULT now(),
    last_edited_time TIMESTAMPTZ DEFAULT now(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 2. Profiles Table (Links to Supabase Auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')) NOT NULL,
    address TEXT,
    phone TEXT CHECK (length(phone) = 10) NOT NULL,
    role TEXT CHECK (role IN ('SuperAdmin', 'Admin', 'User')) NOT NULL,
    created_time TIMESTAMPTZ DEFAULT now(),
    last_edited_time TIMESTAMPTZ DEFAULT now(),
    is_deleted BOOLEAN DEFAULT FALSE,
    -- Phone and email can NOT be duplicate in same company (Rule 18)
    UNIQUE (company_id, email),
    UNIQUE (company_id, phone)
);

-- 3. Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    lead_name TEXT NOT NULL,
    phone TEXT CHECK (length(phone) = 10) NOT NULL,
    email TEXT NOT NULL,
    status TEXT CHECK (status IN ('New', 'In Conversation', 'DNP', 'DND', 'Not Interested', 'Out of reach', 'Wrong details', 'Rejected', 'PO')) NOT NULL DEFAULT 'New',
    location TEXT,
    note TEXT,
    created_time TIMESTAMPTZ DEFAULT now(),
    last_edited_time TIMESTAMPTZ DEFAULT now(),
    is_deleted BOOLEAN DEFAULT FALSE,
    -- Rule 18
    UNIQUE (company_id, phone),
    UNIQUE (company_id, email)
);

-- 4. Comments Table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('New', 'In Conversation', 'DNP', 'DND', 'Not Interested', 'Out of reach', 'Wrong details', 'Rejected', 'PO')) NOT NULL,
    created_time TIMESTAMPTZ DEFAULT now(),
    last_edited_time TIMESTAMPTZ DEFAULT now(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- TRIGGERS & CONSTRAINTS

-- A. Update last_edited_time automatically
CREATE OR REPLACE FUNCTION update_last_edited_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_edited_time = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_last_edited BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_last_edited_column();
CREATE TRIGGER update_profiles_last_edited BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_last_edited_column();
CREATE TRIGGER update_leads_last_edited BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE update_last_edited_column();
CREATE TRIGGER update_comments_last_edited BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_last_edited_column();

-- B. Rule 15: Immutability Protection
CREATE OR REPLACE FUNCTION protect_immutable_columns()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'leads' THEN
        IF NEW.id <> OLD.id OR NEW.company_id <> OLD.company_id OR NEW.owner_user_id <> OLD.owner_user_id THEN
            RAISE EXCEPTION 'Updates to id, company_id, or owner_user_id are not allowed on Leads.';
        END IF;
    ELSIF TG_TABLE_NAME = 'comments' THEN
        IF NEW.id <> OLD.id OR NEW.lead_id <> OLD.lead_id OR NEW.company_id <> OLD.company_id OR NEW.created_by_user_id <> OLD.created_by_user_id THEN
            RAISE EXCEPTION 'Updates to id, lead_id, company_id, or created_by_user_id are not allowed on Comments.';
        END IF;
    ELSIF TG_TABLE_NAME = 'profiles' THEN
        IF NEW.id <> OLD.id OR NEW.company_id <> OLD.company_id THEN
            RAISE EXCEPTION 'Updates to id or company_id are not allowed on Profiles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_leads_immutable BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE protect_immutable_columns();
CREATE TRIGGER trg_protect_comments_immutable BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE protect_immutable_columns();
CREATE TRIGGER trg_protect_profiles_immutable BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE protect_immutable_columns();

-- C. Rule 16: Soft Delete Cascade
CREATE OR REPLACE FUNCTION handle_soft_delete_cascade()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        IF TG_TABLE_NAME = 'companies' THEN
            UPDATE profiles SET is_deleted = TRUE WHERE company_id = NEW.id;
            UPDATE leads SET is_deleted = TRUE WHERE company_id = NEW.id;
            UPDATE comments SET is_deleted = TRUE WHERE company_id = NEW.id;
        ELSIF TG_TABLE_NAME = 'leads' THEN
            UPDATE comments SET is_deleted = TRUE WHERE lead_id = NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_soft_delete_companies AFTER UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE handle_soft_delete_cascade();
CREATE TRIGGER trg_soft_delete_leads AFTER UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE handle_soft_delete_cascade();


-- SAMPLE SEED DATA
-- Atomic insert ensuring IDs are passed correctly through dependencies

-- 1. Create Company
INSERT INTO companies (name, email, phone, address)
VALUES ('LMS Tech', 'admin@lms.com', '9876543210', 'Tech Park HQ')
ON CONFLICT (email) DO NOTHING;

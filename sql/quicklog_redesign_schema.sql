-- QuickLog Redesign Database Schema
-- Creates tables for checklists, shift journals, and enhanced care tracking

-- Enable RLS on all tables
-- Ensure uuid-ossp extension is enabled for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS public.checklist_completions CASCADE;
DROP TABLE IF EXISTS public.checklist_items CASCADE;
DROP TABLE IF EXISTS public.shift_journal_entries CASCADE;
DROP TABLE IF EXISTS public.care_notes CASCADE;

-- Checklist Items Table
-- Defines the standard daily care tasks
CREATE TABLE public.checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'morning-vitals', 'lunch-assist'
    label VARCHAR(200) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    icon VARCHAR(100), -- Ionicon name
    category VARCHAR(50) NOT NULL CHECK (category IN ('morning', 'afternoon', 'evening', 'prn')),
    required BOOLEAN NOT NULL DEFAULT false,
    estimated_minutes INTEGER,
    dependencies UUID[], -- Array of checklist_item IDs that must be completed first
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Checklist Completions Table
-- Tracks completion of daily care tasks for each resident
CREATE TABLE public.checklist_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    skipped BOOLEAN NOT NULL DEFAULT false,
    skip_reason TEXT,
    shift VARCHAR(20) NOT NULL CHECK (shift IN ('morning', 'afternoon', 'evening', 'night')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one completion per item per resident per day
    CONSTRAINT unique_daily_completion UNIQUE (item_id, resident_id, DATE(completed_at))
);

-- Shift Journal Entries Table
-- Stores handover notes and shift documentation
CREATE TABLE public.shift_journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL for general shift notes
    staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shift VARCHAR(20) NOT NULL CHECK (shift IN ('morning', 'afternoon', 'evening', 'night')),
    content TEXT NOT NULL,
    is_handover BOOLEAN NOT NULL DEFAULT false,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    tags TEXT[], -- Array of tags for categorization
    audio_url TEXT, -- URL to voice note file in Supabase Storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enhanced Care Notes Table (extends existing feed items)
-- Links to existing activities but adds more structured data
CREATE TABLE public.care_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feed_item_id UUID, -- Optional link to existing feed item
    resident_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    care_type VARCHAR(50) NOT NULL, -- meal, bathroom, activity, etc.
    care_variant VARCHAR(100), -- specific variant like "breakfast", "assisted"
    outcome VARCHAR(50), -- completed, partial, refused, etc.
    notes TEXT,
    metrics JSONB, -- Structured data like vitals, pain levels, etc.
    photos TEXT[], -- Array of photo URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert standard checklist items
INSERT INTO public.checklist_items (code, label, description, emoji, icon, category, required, estimated_minutes, dependencies) VALUES
-- Morning items
('morning-vitals', 'Morning Vitals', 'Check temperature, BP, heart rate', '🩺', 'pulse-outline', 'morning', true, 5, '{}'),
('morning-meds', 'Morning Medications', 'Administer prescribed morning medications', '💊', 'medical-outline', 'morning', true, 10, ARRAY[(SELECT id FROM public.checklist_items WHERE code = 'morning-vitals')]),
('breakfast-assist', 'Breakfast Assistance', 'Assist with breakfast and document intake', '🍽️', 'restaurant-outline', 'morning', true, 30, '{}'),
('morning-hygiene', 'Morning Hygiene', 'Assist with washing, teeth, grooming', '🧼', 'brush-outline', 'morning', true, 20, '{}'),
('morning-mobility', 'Mobility Check', 'Assess mobility and assist with movement', '🚶', 'walk-outline', 'morning', true, 10, '{}'),
('hydration-morning', 'Morning Hydration', 'Encourage and monitor fluid intake', '💧', 'water-outline', 'morning', true, 5, '{}'),

-- Afternoon items
('lunch-assist', 'Lunch Assistance', 'Assist with lunch and document intake', '🥙', 'restaurant-outline', 'afternoon', true, 30, '{}'),
('afternoon-meds', 'Afternoon Medications', 'Administer prescribed afternoon medications', '💊', 'medical-outline', 'afternoon', false, 5, '{}'),
('afternoon-activity', 'Afternoon Activity', 'Participate in scheduled activities', '🎨', 'color-palette-outline', 'afternoon', false, 45, '{}'),
('hydration-afternoon', 'Afternoon Hydration', 'Continue monitoring fluid intake', '💧', 'water-outline', 'afternoon', true, 5, '{}'),

-- Evening items
('dinner-assist', 'Dinner Assistance', 'Assist with dinner and document intake', '🍽️', 'restaurant-outline', 'evening', true, 30, '{}'),
('evening-meds', 'Evening Medications', 'Administer prescribed evening medications', '💊', 'medical-outline', 'evening', true, 5, '{}'),
('evening-hygiene', 'Evening Hygiene', 'Assist with evening personal care', '🛁', 'brush-outline', 'evening', true, 15, '{}'),
('bedtime-prep', 'Bedtime Preparation', 'Assist with getting ready for bed', '😴', 'bed-outline', 'evening', true, 15, '{}'),

-- PRN (As Needed) items
('prn-pain-assess', 'Pain Assessment', 'Assess pain levels if requested', '❤️‍🩹', 'alert-circle-outline', 'prn', false, 5, '{}'),
('prn-bathroom', 'Bathroom Assistance', 'Assist with toileting as needed', '🚻', 'body-outline', 'prn', false, 10, '{}'),
('prn-emotional', 'Emotional Support', 'Provide comfort and reassurance', '💝', 'heart-outline', 'prn', false, 15, '{}');

-- Create indexes for performance
CREATE INDEX idx_checklist_completions_resident_date ON public.checklist_completions(resident_id, DATE(completed_at));
CREATE INDEX idx_checklist_completions_staff_shift ON public.checklist_completions(staff_id, shift, DATE(completed_at));
CREATE INDEX idx_shift_journal_resident_date ON public.shift_journal_entries(resident_id, DATE(created_at));
CREATE INDEX idx_shift_journal_staff_shift ON public.shift_journal_entries(staff_id, shift, DATE(created_at));
CREATE INDEX idx_care_notes_resident_date ON public.care_notes(resident_id, DATE(created_at));

-- Enable Row Level Security
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checklist_items (read-only for all authenticated users)
CREATE POLICY "Checklist items are viewable by all authenticated users" ON public.checklist_items
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for checklist_completions
CREATE POLICY "Staff can view completions for their facility" ON public.checklist_completions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'manager', 'nurse')
        )
    );

CREATE POLICY "Staff can create completions" ON public.checklist_completions
    FOR INSERT WITH CHECK (
        auth.uid() = staff_id AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'manager', 'nurse')
        )
    );

CREATE POLICY "Staff can update their own completions" ON public.checklist_completions
    FOR UPDATE USING (
        auth.uid() = staff_id AND
        created_at > (now() - interval '24 hours') -- Can only edit within 24 hours
    );

CREATE POLICY "Staff can delete their own recent completions" ON public.checklist_completions
    FOR DELETE USING (
        auth.uid() = staff_id AND
        created_at > (now() - interval '2 hours') -- Can only delete within 2 hours
    );

-- RLS Policies for shift_journal_entries
CREATE POLICY "Staff can view all journal entries for their facility" ON public.shift_journal_entries
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'manager', 'nurse')
        )
    );

CREATE POLICY "Staff can create journal entries" ON public.shift_journal_entries
    FOR INSERT WITH CHECK (
        auth.uid() = staff_id AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'manager', 'nurse')
        )
    );

CREATE POLICY "Staff can update their own journal entries" ON public.shift_journal_entries
    FOR UPDATE USING (
        auth.uid() = staff_id AND
        created_at > (now() - interval '24 hours')
    );

CREATE POLICY "Staff can delete their own recent journal entries" ON public.shift_journal_entries
    FOR DELETE USING (
        auth.uid() = staff_id AND
        created_at > (now() - interval '2 hours')
    );

-- Family members can view journal entries for their residents (handover notes only)
CREATE POLICY "Family can view handover notes for their residents" ON public.shift_journal_entries
    FOR SELECT USING (
        is_handover = true AND
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.role = 'family'
            AND resident_id = ANY(p.linked_residents)
        )
    );

-- RLS Policies for care_notes
CREATE POLICY "Staff can view all care notes" ON public.care_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'manager', 'nurse')
        )
    );

CREATE POLICY "Staff can create care notes" ON public.care_notes
    FOR INSERT WITH CHECK (
        auth.uid() = staff_id AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'manager', 'nurse')
        )
    );

CREATE POLICY "Family can view care notes for their residents" ON public.care_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.role = 'family'
            AND resident_id = ANY(p.linked_residents)
        )
    );

-- Create functions for common queries
CREATE OR REPLACE FUNCTION get_daily_checklist_progress(
    p_resident_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    category VARCHAR(50),
    total_items BIGINT,
    completed_items BIGINT,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH current_shift AS (
        SELECT CASE 
            WHEN EXTRACT(HOUR FROM NOW()) BETWEEN 6 AND 11 THEN 'morning'
            WHEN EXTRACT(HOUR FROM NOW()) BETWEEN 12 AND 17 THEN 'afternoon'
            WHEN EXTRACT(HOUR FROM NOW()) BETWEEN 18 AND 23 THEN 'evening'
            ELSE 'night'
        END AS shift
    ),
    relevant_items AS (
        SELECT ci.* FROM public.checklist_items ci, current_shift cs
        WHERE ci.active = true 
        AND (ci.category = cs.shift OR ci.category = 'prn')
    ),
    completions AS (
        SELECT cc.item_id
        FROM public.checklist_completions cc
        WHERE cc.resident_id = p_resident_id
        AND DATE(cc.completed_at) = p_date
        AND cc.skipped = false
    )
    SELECT 
        ri.category,
        COUNT(ri.id)::BIGINT as total_items,
        COUNT(c.item_id)::BIGINT as completed_items,
        ROUND(
            CASE 
                WHEN COUNT(ri.id) = 0 THEN 0 
                ELSE (COUNT(c.item_id)::NUMERIC / COUNT(ri.id)) * 100 
            END, 
            2
        ) as completion_percentage
    FROM relevant_items ri
    LEFT JOIN completions c ON ri.id = c.item_id
    GROUP BY ri.category
    ORDER BY 
        CASE ri.category 
            WHEN 'morning' THEN 1
            WHEN 'afternoon' THEN 2
            WHEN 'evening' THEN 3
            WHEN 'prn' THEN 4
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get shift handover summary
CREATE OR REPLACE FUNCTION get_shift_handover_summary(
    p_shift VARCHAR(20),
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    resident_id UUID,
    resident_name TEXT,
    high_priority_count BIGINT,
    urgent_count BIGINT,
    latest_entry_time TIMESTAMP WITH TIME ZONE,
    has_handover_notes BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as resident_id,
        p.full_name as resident_name,
        COUNT(sje.id) FILTER (WHERE sje.priority = 'high')::BIGINT as high_priority_count,
        COUNT(sje.id) FILTER (WHERE sje.priority = 'urgent')::BIGINT as urgent_count,
        MAX(sje.created_at) as latest_entry_time,
        BOOL_OR(sje.is_handover) as has_handover_notes
    FROM public.profiles p
    LEFT JOIN public.shift_journal_entries sje ON p.id = sje.resident_id
        AND sje.shift = p_shift
        AND DATE(sje.created_at) = p_date
    WHERE p.role = 'resident'
    GROUP BY p.id, p.full_name
    ORDER BY urgent_count DESC, high_priority_count DESC, latest_entry_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

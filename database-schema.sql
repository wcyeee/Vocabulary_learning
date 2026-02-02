-- Create notebooks table (single user version)
CREATE TABLE notebooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    last_tested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
    english TEXT NOT NULL,
    part_of_speech TEXT NOT NULL,
    chinese TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'normal', 'familiar')),
    next_review_at TIMESTAMP WITH TIME ZONE,
    current_interval INTEGER DEFAULT 0,
    consecutive_familiar_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_notebooks_is_pinned ON notebooks(is_pinned);
CREATE INDEX idx_cards_notebook_id ON cards(notebook_id);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_next_review_at ON cards(next_review_at);

-- Create a function to update last_tested_at
CREATE OR REPLACE FUNCTION update_last_tested_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE notebooks
    SET last_tested_at = NOW()
    WHERE id = NEW.notebook_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update last_tested_at when cards are updated
CREATE TRIGGER trigger_update_last_tested_at
    AFTER UPDATE ON cards
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_last_tested_at();

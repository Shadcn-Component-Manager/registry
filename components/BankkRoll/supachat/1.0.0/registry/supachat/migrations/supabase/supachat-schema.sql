-- SupaChat Database Schema
-- Complete schema for production-ready chat system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat rooms table
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  is_guest_room BOOLEAN DEFAULT false,
  guest_session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_session_id UUID,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_from_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat users (for admin assignment)
CREATE TABLE chat_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_session_id UUID UNIQUE,
  name TEXT,
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  assigned_admin_id UUID REFERENCES auth.users(id),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;

-- Simple, effective policies for chat_rooms
CREATE POLICY "Enable read access for all users" ON chat_rooms
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users and guests" ON chat_rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR guest_session_id IS NOT NULL);

CREATE POLICY "Enable update for room owners and admins" ON chat_rooms
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM chat_users WHERE is_admin = true) OR
    guest_session_id = chat_rooms.guest_session_id
  );

-- Simple, effective policies for messages
CREATE POLICY "Enable read access for all users" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users and guests" ON messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR guest_session_id IS NOT NULL);

CREATE POLICY "Enable update for admins only" ON messages
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM chat_users WHERE is_admin = true)
  );

-- Simple, effective policies for chat_users
CREATE POLICY "Enable read access for all users" ON chat_users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users and guests" ON chat_users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR guest_session_id IS NOT NULL);

CREATE POLICY "Enable update for users and admins" ON chat_users
  FOR UPDATE USING (
    auth.uid() = user_id OR
    guest_session_id = chat_users.guest_session_id OR
    auth.uid() IN (SELECT user_id FROM chat_users WHERE is_admin = true)
  );

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_rooms_updated_at 
  BEFORE UPDATE ON chat_rooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_count(room_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM messages 
    WHERE messages.room_id = get_unread_count.room_id 
    AND messages.is_from_admin = true
    AND messages.created_at > (
      SELECT COALESCE(MAX(last_seen), '1970-01-01'::timestamp) 
      FROM chat_users 
      WHERE chat_users.user_id = auth.uid() OR chat_users.guest_session_id IS NOT NULL
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_chat_users_guest_session ON chat_users(guest_session_id);
CREATE INDEX idx_chat_rooms_guest_session ON chat_rooms(guest_session_id);
CREATE INDEX idx_chat_users_user_id ON chat_users(user_id);
CREATE INDEX idx_chat_users_is_admin ON chat_users(is_admin);
CREATE INDEX idx_messages_is_from_admin ON messages(is_from_admin);

-- Storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view chat files" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-files');

CREATE POLICY "Authenticated users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own chat files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'chat-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own chat files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  ); 
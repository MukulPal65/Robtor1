-- 1. Update Profile Schema
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS security_question text,
ADD COLUMN IF NOT EXISTS security_answer text;

-- 2. Create the Password Reset Function (RPC)
-- This function runs with "SECURITY DEFINER" to allow it to update the auth.users table
CREATE OR REPLACE FUNCTION public.reset_password_with_security_answer(
    target_email text,
    provided_answer text,
    new_password text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id uuid;
    stored_answer text;
BEGIN
    -- 1. Find the user and their stored answer
    SELECT id, security_answer INTO user_id, stored_answer
    FROM public.profiles
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = target_email
    );

    IF user_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'User not found');
    END IF;

    -- 2. Check if the answer matches (case-insensitive)
    IF LOWER(provided_answer) != LOWER(stored_answer) THEN
        RETURN json_build_object('success', false, 'message', 'Incorrect security answer');
    END IF;

    -- 3. Update the password in auth.users
    -- Note: This requires the function to have access to the auth schema
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf'))
    WHERE id = user_id;

    RETURN json_build_object('success', true, 'message', 'Password reset successful');
END;
$$;

-- 3. Create a function to safely fetch a user's security question by email
CREATE OR REPLACE FUNCTION public.get_user_question_by_email(target_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    found_question text;
BEGIN
    SELECT security_question INTO found_question
    FROM public.profiles
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = target_email
    );

    IF found_question IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Question not found');
    END IF;

    RETURN json_build_object('success', true, 'question', found_question);
END;
$$;

-- 4. Update the trigger function to capture security fields on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, security_question, security_answer)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'security_question',
    new.raw_user_meta_data->>'security_answer'
  );
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



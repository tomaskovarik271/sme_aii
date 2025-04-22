const { createClient } = require('@supabase/supabase-js');

// Create a single Supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Basic input validation
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and password are required.' }) };
    }
    if (password.length < 6) { // Example: Enforce minimum password length (Supabase default)
      return { statusCode: 400, body: JSON.stringify({ error: 'Password must be at least 6 characters long.' }) };
    }

    // Use Supabase Auth to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      // You can add options here, like redirect URLs or metadata
      // options: {
      //   emailRedirectTo: 'https://example.com/welcome',
      // }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      // Provide a more user-friendly error message
      const errorMessage = error.message.includes('unique constraint') 
          ? 'User already exists with this email.' 
          : 'Could not sign up user.';
      return { statusCode: error.status || 400, body: JSON.stringify({ error: errorMessage }) };
    }

    // Important: Supabase sends a confirmation email by default.
    // The user needs to click the link in the email to confirm their account.
    // The `data.user` object will contain the user details even if unconfirmed.
    console.log('Supabase signup successful (confirmation email sent):', data.user);

    // Return only essential, non-sensitive user info if needed, or just a success message.
    // Avoid returning the full user object or session info directly from signup.
    return {
      statusCode: 200, // Or 201 Created might be more appropriate
      body: JSON.stringify({ message: 'Signup successful! Please check your email to confirm.' }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (e) {
    console.error('Signup function error:', e);
    // Catch JSON parsing errors or other unexpected issues
    if (e instanceof SyntaxError) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body format.' }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
}; 
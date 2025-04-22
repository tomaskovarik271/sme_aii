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

    // Use Supabase Auth to sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      // Provide a more user-friendly error message
      const errorMessage = error.message.includes('Invalid login credentials') 
          ? 'Invalid email or password.'
          : error.message.includes('Email not confirmed')
          ? 'Please confirm your email address first.'
          : 'Could not log in user.';
      return { statusCode: error.status || 400, body: JSON.stringify({ error: errorMessage }) };
    }

    // Login successful, return the session data (includes JWT access_token and user info)
    console.log('Supabase login successful:', data.user.email);

    return {
      statusCode: 200,
      body: JSON.stringify(data), // Return the full session object { user, session }
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (e) {
    console.error('Login function error:', e);
    // Catch JSON parsing errors or other unexpected issues
    if (e instanceof SyntaxError) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body format.' }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
}; 
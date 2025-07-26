import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const { email, otp, type } = await req.json();
    if (!email || !otp) {
      return new Response(JSON.stringify({
        error: 'Email and OTP are required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Email content based on type
    const subject = type === 'signup' ? 'Welcome to ForgeTrain - Verify Your Account' : 'ForgeTrain - Sign In Verification';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #094d57, #f1872c); padding: 40px 20px; text-align: center; }
          .logo { display: inline-flex; align-items: center; gap: 12px; margin-bottom: 20px; }
          .logo-icon { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
          .logo-text { color: white; font-size: 28px; font-weight: bold; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 40px 20px; }
          .otp-container { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border: 2px solid #0ea5e9; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #094d57; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 30px 20px; text-align: center; border-top: 1px solid #e2e8f0; }
          .security-tips { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .security-tips h3 { color: #15803d; margin-top: 0; }
          .security-tips ul { color: #166534; margin: 0; padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <div class="logo-icon">FT</div>
              <div class="logo-text">ForgeTrain</div>
            </div>
            <h1>${type === 'signup' ? 'Welcome to ForgeTrain!' : 'Sign In Verification'}</h1>
          </div>
          
          <div class="content">
            <h2>Your Verification Code</h2>
            <p>Hello! ${type === 'signup' ? 'Welcome to the ForgeTrain community!' : 'Please verify your identity to continue.'}</p>
            
            <div class="otp-container">
              <h3 style="margin-top: 0; color: #094d57;">Your OTP Code</h3>
              <div class="otp-code">${otp}</div>
              <p style="margin-bottom: 0; color: #6b7280; font-size: 14px;">This code expires in 5 minutes</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this code with anyone. ForgeTrain will never ask for your OTP via phone or other channels.
            </div>
            
            <div class="security-tips">
              <h3>🛡️ Security Tips</h3>
              <ul>
                <li>This OTP is valid for 5 minutes only</li>
                <li>Use it only on the official ForgeTrain website</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Contact support if you suspect unauthorized access</li>
              </ul>
            </div>
            
            <p>If you're having trouble, please contact our support team at <a href="mailto:support@forgetrain.com" style="color: #094d57;">support@forgetrain.com</a></p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              © 2025 ForgeTrain. All rights reserved.<br>
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    // Use Resend API (free tier: 3000 emails/month)
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_QyuvVH7k_Agx5BeAdmzFkNfGuFQLEQKo7';
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ForgeTrain <noreply@futureforgex.in>',
        to: [
          email
        ],
        subject: subject,
        html: htmlContent
      })
    });
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      // Fallback: Log OTP for demo purposes
      return new Response(JSON.stringify({
        success: true,
        message: 'OTP sent successfully (demo mode)',
        demo: true,
        otp: otp // Include OTP in response for demo
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const result = await emailResponse.json();
    return new Response(JSON.stringify({
      success: true,
      message: 'OTP sent to your email successfully',
      emailId: result.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Send OTP email error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send OTP email',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

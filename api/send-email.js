export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, user_name, archetype, protective_archetype } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      return res.status(500).json({ error: 'Resend API key not configured' });
    }

    // Create email content based on your copy
    const getEmailContent = () => {
      return {
        title: "Your Emotional Splinters Guide",
        content: `
          <p>One of the hardest parts of the healing journey (for me, anyway) was figuring out what I actually needed to heal.</p>
          
          <p>I knew I wanted to feel:</p>
          <ul>
            <li>🫠 Less anxious</li>
            <li>☺️ More care-free</li>
            <li>🌞 More… me</li>
          </ul>
          
          <p>But I had no idea what emotional splinter was actually causing the patterns I kept repeating.</p>
          
          <p>So I did what a lot of us do:</p>
          <p>Signed up for every workshop, every modality, every "maybe this will fix it" experience.</p>
          <p>Just hoping something would stick but feeling like I was spinning in circles.</p>
          
          <p>That's why I created the Healing Compass— to help you identify what's really blocking you and provide guidance on the exact things you need to do to heal it.</p>
          
          <p>As promised here's a document where you will find:</p>
          <ul>
            <li>An explanation of what emotional splinters are and how they form</li>
            <li>A simple breakdown of how the brain creates protective patterns</li>
            <li>Tools you can use today (no therapist required)</li>
          </ul>
          
          <p><strong><a href="https://www.canva.com/design/DAGzMFTdmBI/WcIO-22IQCbCONB2-FjDdg/edit?utm_content=DAGzMFTdmBI&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" style="color: #5e17eb; text-decoration: none; font-weight: bold;">Click here to see it</a></strong></p>
          
          <p>This is five years of knowledge condensed into as few pages as possible.</p>
          
          <p>At the end if you want support putting it into action, there's an invite to a free 7-day accountability game at the end — the game is designed to make the healing journey fun (and get you results).</p>
        `
      };
    };

    const emailContent = getEmailContent();
    
    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Healing Compass Resources</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #5e17eb, #ffdd27); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #5e17eb; margin-top: 30px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 10px; }
          .signature { margin-top: 30px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 Your Emotional Splinters Guide</h1>
          <p>Hey ${user_name || 'friend'},</p>
        </div>
        
        <div class="content">
          ${emailContent.content}
          
          <div class="signature">
            <p>Much Love,<br>
            Huzz</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent because you completed the Healing Compass process and requested resources.</p>
          <p>If you have any questions, just reply to this email.</p>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Huzz@nichuzz.com',
        to: [email],
        subject: archetypeResources.title,
        html: emailHtml,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email sent successfully:', result);
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: result.id
      });
    } else {
      const errorText = await response.text();
      console.error('Resend API Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to send email',
        details: errorText
      });
    }

  } catch (error) {
    console.error('❌ Email Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}

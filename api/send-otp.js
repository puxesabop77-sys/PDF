export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { phone, otp } = req.body;

  // Basic validation
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'Invalid phone number' });
  }

  // API key comes from Vercel Environment Variables — never exposed to frontend
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'API key not configured' });
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone,
        flash: 0
      })
    });

    const data = await response.json();

    if (data.return === true) {
      return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } else {
      return res.status(400).json({ success: false, message: data.message || 'Failed to send OTP' });
    }

  } catch (error) {
    console.error('Fast2SMS Error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Try again.' });
  }
}

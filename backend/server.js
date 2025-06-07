const express = require('express');
const fetch = require('node-fetch'); 
const app = express();
app.use(express.json()); 

const PORT = process.env.PORT || 3001;

app.post('/api/get-link-token', async (req, res) => {
  const client_id = process.env.FINVERSE_CLIENT_ID;
  const client_secret = process.env.FINVERSE_CLIENT_SECRET;
  const customer_app_id = process.env.FINVERSE_CUSTOMER_APP_ID;

  try {
    // Step 1: Get customer token
    const tokenRes = await fetch("https://api.prod.finverse.net/auth/customer/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id,
        client_secret,
        grant_type: "client_credentials",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Token request failed: ${tokenRes.statusText}`);
    }

    const { access_token } = await tokenRes.json();

    // Step 2: Get link token
    const linkRes = await fetch("https://api.prod.finverse.net/link/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        customer_app_id,
        redirect_uri: "https://your-app.com/redirect", // Whitelisted URI
        ui_mode: "redirect",
      }),
    });

    if (!linkRes.ok) {
      throw new Error(`Link token request failed: ${linkRes.statusText}`);
    }

    const linkData = await linkRes.json();

    res.status(200).json(linkData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

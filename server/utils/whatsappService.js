
async function sendWhatsapp(to, code) {
    try {
        const response = await fetch('https://api.verifyway.com/api/v1/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VERIFYWAY_API_KEY}`,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                "recipient": to,
                "type": "otp",
                "channel": "whatsapp",
                "fallback": "no",
                "code": code,
                "lang": "en"
            })
        });

        if (!response.status=='success') {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("WhatsApp sent successfully:", data);
        return true;
        
    } catch (err) {
        console.error("WhatsApp send error:", err);
        return false;
    }
}

module.exports = { sendWhatsapp };
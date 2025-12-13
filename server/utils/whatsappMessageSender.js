const axios = require("axios");
const { WHATSAPP_SENDER_ID, WHATSAPP_TOKEN } = require("../keys");

const sendWhatsAppMessage = async (phone, message) => {
  try {
    // message is accepted but NOT used — as you requested

    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "hello_world",
        language: { code: "en_US" }
      }
    };

    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${WHATSAPP_SENDER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (err) {
    console.error("WhatsApp Template Error:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = { sendWhatsAppMessage };

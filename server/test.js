import axios from "axios";

async function sendMessage() {
  const url = "https://graph.facebook.com/v22.0/806889779184384/messages";

  const data = {
    messaging_product: "whatsapp",
    to: "919589571577",
    type: "template",
    template: {
      name: "hello_world",
      language: { code: "en_US" }
    }
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: "Bearer EAATA4Nh865MBP4xmSYef0hMmTBS1didc7PRlYMprUMDyWUjerfBTwz1vz83KRl6tPMxx6zhTF0ZBtXEzPy9FVl6KIUcpk4qpHwiGPWaYRjszknx6voruOwlZBQDlTn2G1McKIeeZBKhYtZBMIXBS43zmlZBK8cQTdqBhS1oTRxmLnzhnZAnZBx2hCjqfIR0CnKCMPLjuFgnwZBzZCNcUitURThBz9i2y0UqSwZC8ul1fhS6hrckLrFSkZCnsCubYQZDZD",
        "Content-Type": "application/json"
      },
    });

    console.log("Message sent:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

sendMessage();

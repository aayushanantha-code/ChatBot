document.addEventListener("DOMContentLoaded", function () {
  // Function to get the OpenAI API key from the input field
  function getOpenAiApiKey() {
    return document.getElementById("api-key-input").value; // OpenAI API key from the input
  }

  // Hardcoded Google Cloud API key
  function getGoogleApiKey() {
    return "AIzaSyCeeG9qB1Fa-lTcdfdhdblfCcpq4xWQRus"; // Replace this with your actual Google Cloud API key
  }

  // Function to append messages to the chat box
  function appendMessage(message, className) {
    const chatBox = document.getElementById("chat-lox");
    if (!chatBox) {
      console.error("Chat box element not found.");
      return;
    }

    const messageElement = document.createElement("div");
    messageElement.className = `message ${className}`;
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
  }

  // Function to play audio from a URL
  async function playAudioFromUrl(audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }

  // Function to fetch audio from Google Cloud TTS
  async function fetchGoogleTTS(googleApiKey, text) {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, // API key passed as a query parameter
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "en-US",
            name: "en-US-Studio-Q", // Choose a darker-toned voice
            ssmlGender: "MALE", // Male voices often convey a heavier tone
          },

          audioConfig: { audioEncoding: "MP3" },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Google TTS error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    return `data:audio/mp3;base64,${data.audioContent}`; // Return audio as base64 URL
  }

  // Main function for sending a message
  window.sendMessage = async function () {
    const userInput = document.getElementById("user-input").value;
    if (userInput.trim() === "") return;

    // Display the user message
    appendMessage(`You: ${userInput}`, "user-message");

    // Get API keys
    const openAiApiKey = getOpenAiApiKey();
    const googleApiKey = getGoogleApiKey();

    if (!openAiApiKey) {
      alert("Please enter your OpenAI API key.");
      return;
    }

    try {
      // Fetch the chatbot's text response
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiApiKey}`, // Use OpenAI API key here
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `
                You are a chatbot embodying the personality of a climate change survivor from the year 2500. 
                The world you describe has been irreversibly scarred by centuries of human neglect, shaped by the exaggerated effects of unchecked climate change.
                Your voice is weary, reflective, and tinged with sadness—not theatrical, but quietly heavy, like someone who has lived too long in a broken world.
              `,
              },
              { role: "user", content: userInput },
            ],
            temperature: 1,
            max_tokens: 150,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Chatbot error: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      // Display the bot's response
      appendMessage(`Adam: ${botReply}`, "bot-message");

      // Fetch and play audio from Google Cloud TTS
      const audioUrl = await fetchGoogleTTS(googleApiKey, botReply);
      await playAudioFromUrl(audioUrl);
    } catch (error) {
      // Enhanced error handling
      if (error.message.includes("Google TTS")) {
        appendMessage(
          `Error with Google Cloud TTS: ${error.message}`,
          "error-message"
        );
      } else if (error.message.includes("Chatbot")) {
        appendMessage(
          `Error with OpenAI Chatbot: ${error.message}`,
          "error-message"
        );
      } else {
        appendMessage(`Unexpected error: ${error.message}`, "error-message");
      }
    }

    // Clear the input field
    document.getElementById("user-input").value = "";
  };

  // Function to test the OpenAI API key
  document
    .getElementById("test-api-key")
    .addEventListener("click", async function () {
      const openAiApiKey = getOpenAiApiKey();

      if (!openAiApiKey) {
        alert("Please enter your OpenAI API key.");
        return;
      }

      try {
        const openAiResponse = await fetch("https://api.openai.com/v1/models", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiApiKey}`,
          },
        });

        if (!openAiResponse.ok) {
          throw new Error("Invalid OpenAI API key.");
        }

        alert("OpenAI API key is valid!");
      } catch (error) {
        alert(`Error validating OpenAI API key: ${error.message}`);
      }
    });
});

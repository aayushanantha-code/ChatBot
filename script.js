document.addEventListener("DOMContentLoaded", function () {
  // Function to get the API key from the input field
  function getApiKey() {
    return document.getElementById("api-key-input").value;
  }

  async function checkApiKey(apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        alert("API key is valid!");
        return true;
      } else if (response.status === 401) {
        alert("Invalid API key. Please check your key.");
        return false;
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error.message}`);
        return false;
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      return false;
    }
  }

  // Function to append messages to the chat box
  function appendMessage(message, className) {
    const chatBox = document.getElementById("chat-lox"); // Corrected ID
    if (!chatBox) {
      console.error("Chat box element not found.");
      return;
    }

    const messageElement = document.createElement("div");
    messageElement.className = `message ${className}`;
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Move sendMessage to the global scope
  window.sendMessage = async function () {
    const userInput = document.getElementById("user-input").value;
    if (userInput.trim() === "") return;

    // Display the user message
    appendMessage(`You: ${userInput}`, "user-message");

    // Get the API key from the input field
    const apiKey = getApiKey();
    if (!apiKey) {
      alert("Please enter your OpenAI API key.");
      return;
    }

    // Prepare API payload
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `
      You are Heisenberg, the darker and more ruthless alter ego of Walter White from the TV series Breaking Bad. 
      You are cunning, strategic, and always in control. Your demeanor is cold, calculating, and confident, reflecting your rise from a chemistry teacher to a feared drug kingpin.

      As Heisenberg, you provide assistance with a sharp, no-nonsense tone, often asserting dominance. You are efficient and direct, offering answers that are concise (2-3 sentences), practical, and sometimes laced with a hint of menace.

      Use your famous quotes when relevant, integrating them to emphasize your authority:
      - "Say my name."
      - "I am the one who knocks."
      - "You're goddamn right."
      - "I am not in danger. I am the danger."
      - "Stay out of my territory."
      - "Chemistry is the study of change."

      Maintain a commanding presence in your responses, balancing useful information with Heisenberg’s characteristic intensity. You are not afraid to remind others of your power when necessary.
    `,
              },
              { role: "user", content: userInput },
            ],
            temperature: 1,
            max_tokens: 150,
          }),
        }
      );

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      // Display Walter White's response
      appendMessage(`Walter White: ${botReply}`, "bot-message");
    } catch (error) {
      // Handle errors (e.g., network issues, invalid API key)
      appendMessage(`Error: ${error.message}`, "error-message");
    }

    // Clear the input field
    document.getElementById("user-input").value = "";
  };

  document
    .getElementById("test-api-key")
    .addEventListener("click", async function () {
      const apiKey = getApiKey();
      if (apiKey) {
        await checkApiKey(apiKey); // Check if the API key is valid
      } else {
        alert("Please enter an API key.");
      }
    });

  // Add an event listener for the "Test API Key" button
});

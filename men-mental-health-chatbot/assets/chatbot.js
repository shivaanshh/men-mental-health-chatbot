// chatbot.js – handles sending messages to the Gemini API via the backend and updating the UI.

document.addEventListener('DOMContentLoaded', () => {
    const personaSelect = document.getElementById('persona');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const greetingMsg = document.getElementById('greeting-message');
  
    // Update the greeting message based on selected persona (optional dynamic behavior)
    function updateGreeting() {
      if (!greetingMsg) return;
      const persona = personaSelect.value;
      let greetingText = "Hello! I’m here to listen. How can I help you today?";
      if (persona === 'therapist') {
        greetingText = "Hello, I’m here to support you in a professional capacity. What would you like to talk about?";
      } else if (persona === 'coach') {
        greetingText = "Hi! I’m here as your coach. What challenge are you facing today?";
      } else {
        // 'buddy' or default
        greetingText = "Hey, I’m all ears. What’s on your mind?";
      }
      greetingMsg.querySelector('span').innerText = greetingText;
    }
    personaSelect.addEventListener('change', () => {
      updateGreeting();
      // Optionally, clear previous messages when persona changes to start fresh:
      const messages = document.querySelectorAll('#chat-messages .message');
      messages.forEach((msg) => {
        if (msg.id !== 'greeting-message') {
          msg.remove();
        }
      });
    });
  
    // Scroll chat to bottom
    function scrollChatToBottom() {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  
    // Display a new message bubble in the chat area
    function appendMessage(text, sender = 'bot') {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message');
      msgDiv.classList.add(sender);
      msgDiv.innerText = text;
      chatMessages.appendChild(msgDiv);
      scrollChatToBottom();
    }
  
    // Send user message to backend and handle response
    async function sendMessage() {
      const message = userInput.value.trim();
      if (!message) return;  // ignore empty input
  
      const persona = personaSelect.value;
      // Append user's message to chat UI
      appendMessage(message, 'user');
      userInput.value = '';
      userInput.disabled = true;
      sendBtn.disabled = true;
  
      // Show typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.classList.add('message', 'bot');
      typingIndicator.innerText = "🤖 ...";
      chatMessages.appendChild(typingIndicator);
      scrollChatToBottom();
  
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message, persona: persona })
        });
        // Remove typing indicator
        typingIndicator.remove();
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          appendMessage("Oops, something went wrong. Please try again later.", 'bot');
        } else if (data.reply) {
          appendMessage(data.reply, 'bot');
        } else {
          appendMessage("I'm sorry, I couldn't get a response at the moment.", 'bot');
        }
      } catch (err) {
        // Remove typing indicator if still present and show error
        if (typingIndicator.parentNode) typingIndicator.remove();
        appendMessage("Error: Unable to reach the server. Please check your connection.", 'bot');
        console.error("Chat API error:", err);
      } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
      }
    }
  
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    // Also send on Enter key press
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  
    // Initialize greeting based on default persona
    updateGreeting();
  });
  
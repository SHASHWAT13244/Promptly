const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const themeToggle = document.getElementById('theme-toggle');

// Call Gemini API via backend on Render
async function generateResponse(prompt) {
  const response = await fetch('https://promptly-w8cd.onrender.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) throw new Error('Failed to generate response');
  const data = await response.json();
  return data.text;
}

// Clean Markdown (optional if needed)
function cleanMarkdown(text) {
  return text.replace(/#{1,6}\s?/g, '')
             .replace(/\*\*/g, '')
             .replace(/\n{3,}/g, '\n\n')
             .trim();
}

// Add chat message to DOM
function addMessage(message, isUser) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', isUser ? 'user-message' : 'bot-message');

  const profileImage = document.createElement('img');
  profileImage.classList.add('profile-image');
  profileImage.src = isUser ? 'user.jpg' : 'bot.jpg';
  profileImage.alt = isUser ? 'User' : 'Bot';

  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');
  messageContent.innerHTML = DOMPurify.sanitize(marked.parse(message));

  if (!isUser) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-button';
    copyBtn.textContent = '📋';
    copyBtn.title = 'Copy to clipboard';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(message).then(() => {
        copyBtn.textContent = '✅';
        setTimeout(() => (copyBtn.textContent = '📋'), 2000);
      });
    };
    messageContent.appendChild(copyBtn);
  }

  const timestamp = document.createElement('div');
  timestamp.classList.add('timestamp');
  timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messageContent.appendChild(document.createElement('br'));
  messageContent.appendChild(timestamp);

  messageElement.appendChild(profileImage);
  messageElement.appendChild(messageContent);
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle user input and get bot response
async function handleUserInput() {
  const userMessage = userInput.value.trim();
  if (userMessage) {
    addMessage(userMessage, true);
    userInput.value = '';
    sendButton.disabled = true;
    userInput.disabled = true;

    try {
      const botMessage = await generateResponse(userMessage);
      addMessage(cleanMarkdown(botMessage), false);
    } catch (error) {
      console.error('Error:', error);
      addMessage('Sorry, I encountered an error. Please try again.', false);
    } finally {
      sendButton.disabled = false;
      userInput.disabled = false;
      userInput.focus();
    }
  }
}

// Event listeners
sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleUserInput();
  }
});

// Clear chat + localStorage
document.getElementById('clear-chat').addEventListener('click', () => {
  chatMessages.innerHTML = '';
  localStorage.removeItem('chatHistory');
});

// Download chat
document.getElementById('download-chat').addEventListener('click', () => {
  const messages = document.querySelectorAll('.message');
  let chatText = '';
  messages.forEach(msg => {
    const who = msg.classList.contains('user-message') ? 'You' : 'Bot';
    const text = msg.querySelector('.message-content')?.innerText || '';
    chatText += `${who}: ${text.trim()}\n\n`;
  });

  const blob = new Blob([chatText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = 'chat.txt';
  link.href = URL.createObjectURL(blob);
  link.click();
});

// THEME TOGGLE SYSTEM 🌙 / ☀️
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(systemPrefersLight ? 'light' : 'dark');
  }
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '☀️';
  } else {
    document.body.classList.remove('light');
    themeToggle.textContent = '🌙';
  }
  localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  const theme = isLight ? 'light' : 'dark';
  themeToggle.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
});

initTheme();


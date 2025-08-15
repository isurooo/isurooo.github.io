// Helper function to display a temporary message box
const showTemporaryMessageBox = (message, title = "AI Response") => {
  const messageBox = document.createElement("div");
  messageBox.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  messageBox.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg shadow-xl text-center max-w-sm mx-auto">
            <h4 class="text-gray-100 text-xl font-semibold mb-4">${title}</h4>
            <p class="text-gray-100 text-lg mb-4">${message}</p>
            <button class="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition duration-300" onclick="this.closest('.fixed').remove()">Close</button>
        </div>
    `;
  document.body.appendChild(messageBox);
};

// Declare global variables for chat elements, so they can be accessed by window.initChat
let chatButton;
let chatModal;
let closeChatButton;
let chatInput;
let sendChatButton;
let chatMessagesContainer;
let chatLoadingIndicator;

// Simple chat functionality that works without Firebase
const initSimpleChat = () => {
  console.log("Initializing simple chat functionality...");

  // Function to display a message in the chat UI
  const displayMessage = (sender, text) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
      "chat-message",
      sender,
      "p-3",
      "rounded-lg",
      "max-w-[80%]",
      "shadow-sm"
    );
    messageDiv.textContent = text;
    chatMessagesContainer.appendChild(messageDiv);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
  };

  // Simple AI responses for local testing
  const getSimpleAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    if (message.includes("email") || message.includes("contact")) {
      return "You can reach me at isuro.89@gmail.com. Feel free to send me an email for any inquiries!";
    } else if (message.includes("experience") || message.includes("work")) {
      return "I have over ten years of experience in software testing, specializing in QA automation for web, mobile, and API platforms. I've worked as a Lead QA at Hydra X, Technical Project Manager at Zuju Gameplay, and Senior QA Engineer at Endowus.";
    } else if (message.includes("skill") || message.includes("expertise")) {
      return "My key skills include QA Automation (Appium, Cypress, Selenium), Agile Methodologies, API & UI Testing, Performance Testing with JMeter, BDD Test Cases, and CI/CD Integration.";
    } else if (message.includes("hello") || message.includes("hi")) {
      return "Hello! I'm Isuru Rodrigo's AI assistant. How can I help you learn more about my portfolio?";
    } else {
      return "Thanks for your message! I'm Isuru Rodrigo's AI assistant. You can ask me about my experience, skills, or contact information. Feel free to reach out at isuro.89@gmail.com for any professional inquiries.";
    }
  };

  // Function to handle sending messages
  const handleSendMessage = () => {
    const message = chatInput.value.trim();
    if (message) {
      // Display user message
      displayMessage("user", message);

      // Clear input
      chatInput.value = "";

      // Show loading indicator
      chatLoadingIndicator.classList.remove("hidden");
      chatLoadingIndicator.innerHTML =
        '<div class="ai-loading-spinner"></div> AI is typing...';

      // Simulate AI response delay
      setTimeout(() => {
        const aiResponse = getSimpleAIResponse(message);
        displayMessage("ai", aiResponse);
        chatLoadingIndicator.classList.add("hidden");
        chatLoadingIndicator.innerHTML = "";
      }, 1000);
    }
  };

  // Set up event listeners
  if (sendChatButton) {
    sendChatButton.addEventListener("click", handleSendMessage);
    console.log("Send button event listener added");
  } else {
    console.error("Send button not found!");
  }

  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    });
    console.log("Chat input event listener added");
  } else {
    console.error("Chat input not found!");
  }
};

// Ensure Firebase is initialized before proceeding
window.initChat = async (
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
) => {
  const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
  const db = window.firebaseDb;
  const auth = window.firebaseAuth;
  const userId = window.currentUserId;

  if (!db || !auth || !userId) {
    console.error("Firebase not fully initialized or user ID not available.");
    console.log("Falling back to simple chat functionality...");
    initSimpleChat();
    return;
  }

  const displayUserIdElement = document.getElementById("display-user-id");
  if (displayUserIdElement) {
    displayUserIdElement.textContent = userId;
  }

  // These elements are now retrieved in DOMContentLoaded and are globally accessible
  // No need to re-get them here.

  let chatHistory = []; // Stores messages for Gemini API

  // Collection reference for public chat messages
  const messagesCollectionRef = collection(
    db,
    `artifacts/${appId}/public/data/chatMessages`
  );

  // Function to add a message to Firestore
  const addMessageToFirestore = async (sender, text) => {
    try {
      await addDoc(messagesCollectionRef, {
        userId: userId, // Store the user ID who sent the message
        sender: sender, // 'user' or 'ai'
        text: text,
        timestamp: serverTimestamp(), // Use server timestamp for consistency
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Function to display a message in the chat UI
  const displayMessage = (sender, text) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
      "chat-message",
      sender,
      "p-3",
      "rounded-lg",
      "max-w-[80%]",
      "shadow-sm"
    );
    messageDiv.textContent = text;
    chatMessagesContainer.appendChild(messageDiv);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
  };

  // Listen for real-time updates from Firestore
  onSnapshot(query(messagesCollectionRef, orderBy("timestamp")), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const message = change.doc.data();
        // Only display messages if they are not already in chatHistory
        // This prevents duplicate messages when the user sends a message and it's then synced from Firestore
        // A more robust solution might involve checking message IDs or using local state more carefully
        if (
          !chatHistory.some(
            (msg) => msg.text === message.text && msg.role === message.sender
          )
        ) {
          displayMessage(message.sender, message.text);
          // Add to chat history for Gemini if it's a user message
          if (message.sender === "user") {
            chatHistory.push({ role: "user", parts: [{ text: message.text }] });
          } else if (message.sender === "ai") {
            chatHistory.push({
              role: "model",
              parts: [{ text: message.text }],
            });
          }
        }
      }
    });
  });

  // Function to send message to Gemini API (for main chat)
  const sendMessageToGemini = async (userMessage) => {
    chatLoadingIndicator.classList.remove("hidden"); // Show loading indicator
    chatLoadingIndicator.innerHTML =
      '<div class="ai-loading-spinner"></div> AI is typing...';

    // Add user message to local history for Gemini
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    // Add specific instruction for the AI about the email
    const aiInstructions = `You are an AI assistant for Isuru Rodrigo. His email for contact is isuro.89@gmail.com. When asked for contact information or his email, provide this email address. Otherwise, answer questions about his portfolio based on the provided content.`;

    const payload = {
      contents: [
        { role: "user", parts: [{ text: aiInstructions }] },
        ...chatHistory,
      ],
    };
    const apiKey = ""; // Canvas will provide this at runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const aiResponseText = result.candidates[0].content.parts[0].text;
        displayMessage("ai", aiResponseText);
        addMessageToFirestore("ai", aiResponseText); // Store AI response in Firestore
        chatHistory.push({ role: "model", parts: [{ text: aiResponseText }] }); // Add AI response to local history
      } else {
        displayMessage("ai", "Sorry, I couldn't get a response from the AI.");
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      displayMessage(
        "ai",
        "Oops! Something went wrong. Please try again later."
      );
      console.error("Error calling Gemini API:", error);
    } finally {
      chatLoadingIndicator.classList.add("hidden"); // Hide loading indicator
      chatLoadingIndicator.innerHTML = "";
    }
  };

  // Event Listeners for sending messages (kept here as they depend on Firebase init)
  if (sendChatButton) {
    sendChatButton.addEventListener("click", () => {
      const message = chatInput.value.trim();
      if (message) {
        displayMessage("user", message);
        addMessageToFirestore("user", message);
        sendMessageToGemini(message);
        chatInput.value = "";
      }
    });
  }

  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendChatButton.click();
      }
    });
  }
};

// General JavaScript for animations and mobile menu
document.addEventListener("DOMContentLoaded", () => {
  // Get all chat elements here, ensuring they are in the DOM
  chatButton = document.getElementById("chat-button");
  chatModal = document.getElementById("chat-modal");
  closeChatButton = document.getElementById("close-chat-button");
  chatInput = document.getElementById("chat-input");
  sendChatButton = document.getElementById("send-chat-button");
  chatMessagesContainer = document.getElementById("chat-messages-container");
  chatLoadingIndicator = document.getElementById("chat-loading-indicator");

  // Console logs for debugging (can be removed once confirmed working)
  console.log("DOMContentLoaded fired. chatButton:", chatButton);
  console.log("DOMContentLoaded fired. chatModal:", chatModal);
  console.log("DOMContentLoaded fired. closeChatButton:", closeChatButton);

  // Initialize simple chat functionality as fallback
  initSimpleChat();

  // Chat Button Event Listeners (moved here for immediate responsiveness)
  if (chatButton) {
    chatButton.addEventListener("click", () => {
      console.log("Chat button clicked!"); // Debugging log
      if (chatModal) {
        chatModal.classList.toggle("hidden");
        if (!chatModal.classList.contains("hidden")) {
          chatInput.focus();
        }
        console.log(
          "chatModal hidden state:",
          chatModal.classList.contains("hidden")
        ); // Debugging log
      } else {
        console.error("Chat modal element not found!");
      }
    });
  } else {
    console.error("Chat button element not found!");
  }

  if (closeChatButton) {
    closeChatButton.addEventListener("click", () => {
      console.log("Close chat button clicked!"); // Debugging log
      if (chatModal) {
        chatModal.classList.add("hidden");
      }
    });
  } else {
    console.error("Close chat button element not found!");
  }

  // Mobile Menu Toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  // Smooth Scrolling for Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
      // Close mobile menu after clicking a link
      if (!mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.add("hidden");
      }
    });
  });

  // Intersection Observer for Section Animations
  const sections = document.querySelectorAll(".section-animation");
  const animatedElements = document.querySelectorAll(
    ".animate-fade-in-scale, .animate-slide-in-left, .animate-bounce-in, .animate-zoom-in, .animate-rotate-in"
  );

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Stop observing once visible
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  // Observe animated elements
  animatedElements.forEach((element) => {
    observer.observe(element);
  });

  // Resume download button action - opens Google Drive resume
  document
    .getElementById("download-resume-btn")
    .addEventListener("click", (e) => {
      e.preventDefault();
      // Open the Google Drive resume in a new tab
      window.open(
        "https://drive.google.com/file/d/1fIGRPDKyL662sWHrL_94-xGjFWD1RPvf/view?usp=sharing",
        "_blank"
      );
    });
});

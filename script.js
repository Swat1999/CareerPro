window.onerror = function(msg, url, line) {
  console.error(`Frontend Error: ${msg} at ${line} in ${url}`);
  return true;
};
const BASE_URL = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', function () {
  // ===========================
  // Welcome Overlay Typing 
  // ===========================
  const welcomeText = document.getElementById("welcome-text");
  const startButton = document.getElementById("start-button");
  const overlay = document.getElementById("welcome-overlay");

  if (welcomeText && startButton && overlay) {
    const message = "Welcome, to the next";
    let index = 0;

    document.body.classList.add('lock-scroll', 'blur-active');
    startButton.style.opacity = '0';
    startButton.style.transition = 'opacity 0.8s ease';

    function typeWriter() {
      if (index < message.length) {
        welcomeText.textContent += message.charAt(index);
        index++;
        setTimeout(typeWriter, 120);
      } else {
        setTimeout(() => {
          startButton.style.opacity = '1';
        }, 1000);
      }
    }

    typeWriter();

    startButton.addEventListener('click', () => {
      overlay.style.transition = 'opacity 1.5s ease-in-out, transform 1.5s ease-in-out';
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(0.95)';
      overlay.style.pointerEvents = 'none';
      overlay.style.visibility = 'hidden';

      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.classList.remove('lock-scroll', 'blur-active');
      }, 1500);
    });
  }

  // ===========================
  // Smooth Scroll
  // ===========================
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const section = document.querySelector(this.getAttribute('href'));
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ===========================
  // Theme Toggle (for landing page only)
  // ===========================
  const toggleBtn = document.getElementById('theme-toggle');
  const body = document.body; 
  if (toggleBtn) { 
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.classList.toggle('light-mode', savedTheme === 'light');
      toggleBtn.textContent = savedTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }

    toggleBtn.addEventListener('click', () => {
      const isLight = body.classList.toggle('light-mode');
      toggleBtn.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  // ===========================
  // Auth Modal Logic
  // ===========================
  const signInBtn = document.getElementById("SignInBtn");
  const signInModal = document.getElementById("signInModal");
  const closeSignInBtn = document.querySelector("#signInModal .close-btn");

  const signUpBtn = document.getElementById("SignUpBtn");
  const signUpModal = document.getElementById("signUpModal");
  const closeSignUpBtn = document.querySelector(".close-signup");

  const showSignInLink = document.getElementById("showSignInLink");
  const signInToSignUpLink = document.getElementById("signInToSignUpLink");

  if (signInBtn && signInModal && closeSignInBtn && signUpBtn && signUpModal && closeSignUpBtn && showSignInLink && signInToSignUpLink) {
    signInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signInModal.style.display = "flex";
    });

    closeSignInBtn.addEventListener("click", () => {
      signInModal.style.display = "none";
    });

    signUpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signUpModal.style.display = "flex";
    });

    closeSignUpBtn.addEventListener("click", () => {
      signUpModal.style.display = "none";
    });

    signInToSignUpLink.addEventListener("click", function (e) {
      e.preventDefault();
      signInModal.style.display = "none";
      signUpModal.style.display = "flex";
    });

    showSignInLink.addEventListener("click", (e) => {
      e.preventDefault();
      signUpModal.style.display = "none";
      signInModal.style.display = "flex";
    });
  }

  // ===========================
  // Sign Up Form
  // ===========================
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const firstName = document.getElementById("firstName").value.trim();
      const lastName = document.getElementById("lastName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return alert("Please fill out all fields.");
      }

      if (password !== confirmPassword) {
        return alert("Passwords do not match!");
      }

      fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
        credentials: 'include'
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message || "Signup success!");
          signupForm.reset();
          if (signUpModal) signUpModal.style.display = "none";
          localStorage.removeItem('profileSetupComplete');
          localStorage.setItem('userId', data.user._id);
          window.location.href = 'profileSetup.html';
        })
        .catch(error => {
          alert("Error during signup.");
          console.error(error);
        });
    });
  }

  // ===========================
  // Sign In Form
  // ===========================
  const signInForm = document.getElementById("signInForm");

  if (signInForm) {
    signInForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("signinEmail").value.trim();
      const password = document.getElementById("signinPassword").value;

      if (!email || !password) {
        return alert("Please enter both email and password.");
      }

      fetch("http://localhost:3000/signin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      })
 .then(response => {
  console.log("🔍 Status:", response.status);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log("✅ Login success:", data);
  alert("✅ Signed in!");
  if (data.error) {
    alert(`❌ ${data.error}`);
  } else {
    alert(`✅ ${data.message} Welcome, ${data.user.firstName}!`);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUser', data.user.firstName || email);
    localStorage.setItem('userId', data.user._id);
    localStorage.setItem('token', data.token);
    if (signInModal) signInModal.style.display = "none";
    signInForm.reset();
    
    const profileSetupComplete = data.user.profileSetupComplete || localStorage.getItem('profileSetupComplete');
    if (profileSetupComplete === 'true') {
      window.location.href = 'Dashboard-User.html';
    } else {
      window.location.href = 'profileSetup.html';
    }
  }
})
.catch(err => {
  alert("⚠️ Error during sign-in. Please check your connection.");
  console.error("Login error:", err);
});
    });
  }

  // ===========================
  // Toggle Password Visibility
  // ===========================
  const togglePassword = (toggleId, inputId) => {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (toggle && input) {
      toggle.addEventListener("click", () => {
        const type = input.type === "password" ? "text" : "password";
        input.type = type;
        toggle.textContent = type === "password" ? "👁️" : "🙈";
      });
    }
  };

  togglePassword("toggleSigninPassword", "signinPassword");
  togglePassword("toggleSignupPassword", "signupPassword");
  togglePassword("toggleConfirmPassword", "confirmPassword");
  togglePassword("toggleNewPassword", "newPassword");
  togglePassword("toggleConfirmNewPassword", "confirmNewPassword");

  // ===========================
  // Newsletter Form
  // ===========================
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletterEmail").value.trim();
      if (!email) return alert("Please enter a valid email.");

      const res = await fetch("http://localhost:3000/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      alert(data.message || "Newsletter subscription failed.");
      if (res.ok) newsletterForm.reset();
    });
  }

  // ===========================
  // Forgot Password Logic
  // ===========================
  const forgotLink = document.getElementById("forgotPasswordLink");
  const forgotModal = document.getElementById("forgotPasswordModal");
  const closeForgotBtn = document.querySelector("#forgotPasswordModal .close-btn");
  const forgotForm = document.getElementById("forgotPasswordForm");

  if (forgotLink && forgotModal && closeForgotBtn && forgotForm) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (signInModal) signInModal.style.display = "none";
      forgotModal.style.display = "flex";
      forgotModal.scrollTop = 0;
    });

    closeForgotBtn.addEventListener("click", () => {
      forgotModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
      if (event.target === forgotModal) {
        forgotModal.style.display = "none";
      }
    });

    forgotForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("forgotEmail").value.trim();
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmNewPassword").value;

      if (!email || !newPassword || !confirmPassword) {
        return alert("⚠️ Please fill out all fields.");
      }

      if (newPassword !== confirmPassword) {
        return alert("❌ Passwords do not match!");
      }

      try {
        const res = await fetch("http://localhost:3000/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
        });


        const data = await res.json();

        if (res.ok) {
          alert("✅ Password changed successfully!");
          forgotForm.reset();
          forgotModal.style.display = "none";
        } else {
          alert(`❌ ${data.error || "Something went wrong."}`);
        }
      } catch (error) {
        console.error("Reset password error:", error);
        alert("⚠️ Error connecting to the server.");
      }
    });
  }


  // ===============================================
  // START OF DASHBOARD-SPECIFIC JAVASCRIPT
  // ===============================================

  const welcomeMessage = document.getElementById('welcomeMessage');
  const profileButton = document.getElementById('profileButton');

  // Check if typical dashboard elements exist before running dashboard specific JS
  if (welcomeMessage && profileButton) { 

      const userName = localStorage.getItem('loggedInUser');
      if (userName) { 
        welcomeMessage.textContent = `Welcome back, ${userName}!`;
      } else {
        welcomeMessage.textContent = 'Welcome back!';
      }

      // Theme Toggle for Dashboard
      const themeToggleButton = document.getElementById('themeToggleButton');

      function updateThemeIcon(theme) {
          if (themeToggleButton) { 
            if (theme === 'dark-mode') {
                themeToggleButton.innerHTML = '<i class="fas fa-sun"></i>'; // Sun for dark background
            } else {
                themeToggleButton.innerHTML = '<i class="fas fa-moon"></i>'; // Moon for light background
            }
          }
      }

      if (themeToggleButton) { 
        const savedTheme = localStorage.getItem('theme') || 'dark-mode';
        body.classList.add(savedTheme);
        updateThemeIcon(savedTheme); 

        themeToggleButton.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                body.classList.replace('dark-mode', 'light-mode');
                localStorage.setItem('theme', 'light-mode');
                updateThemeIcon('light-mode');
            } else {
                body.classList.replace('light-mode', 'dark-mode');
                localStorage.setItem('theme', 'dark-mode');
                updateThemeIcon('dark-mode');
            }
        });
      }


      // Logout functionality
      const logoutButton = document.getElementById('logoutButton');
      if (logoutButton) { 
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUser'); 
            window.location.href = 'index.html';
        });
      }


      // ===========================================
      // Profile Dropdown Toggle Logic
      // ===========================================
      const profileButton = document.getElementById('profileButton');
      const profileDropdown = document.getElementById('profileDropdown');

      if (profileButton && profileDropdown) { 
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!profileDropdown.contains(event.target) && !profileButton.contains(event.target)) {
                profileDropdown.classList.remove('show'); // Hide the dropdown
            }
        });

        profileDropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (event) => {
                profileDropdown.classList.remove('show'); 
            });
        });
    }

    // ------------------ // 
    // Subscription selection and visibility
    // ------------------ //   
const subscriptionSection = document.querySelector('.subscription-section');
const subscriptionsContainer = document.getElementById('subscriptionsContainer');
const getSubscriptionsBtn = document.getElementById('getSubscriptions');
const subscriptionModal = document.getElementById('subscriptionModal');
const closeSubscriptionBtn = document.querySelector('#subscriptionModal .close-btn');
const cancelSubscriptionBtn = document.getElementById('cancelSubscription');

if (!subscriptionSection || !subscriptionModal || !subscriptionsContainer) {
    console.warn('Subscription elements not found');
    return;
}
if (subscriptionModal) {
    const closeSubBtn = document.getElementById("closeSubBtn");
    if (closeSubBtn) {
        closeSubBtn.addEventListener("click", () => {
            subscriptionModal.style.display = "none";
        });
    }
}

subscriptionsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-manage') || e.target.closest('.btn-manage')) {
        showManageSubscription();
    }
});

document.querySelectorAll('.sidebar-nav a').forEach(link => {
    if (link.textContent.includes('Subscriptions')) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Hide all other sections
            document.querySelectorAll('.dashboard-overview > *').forEach(section => {
                section.style.display = 'none';
            });
            // Show subscription section
            subscriptionSection.style.display = 'block';
            loadUserSubscription();
        });
    }
});

// load the current subscription for the user
function loadUserSubscription() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // In a real app, you would fetch this from your backend
    const userSubscription = localStorage.getItem('userSubscription') || null;
    
    if (userSubscription) {
        subscriptionsContainer.innerHTML = `
            <div class="active-subscription">
                <h4>Your Current Plan: ${userSubscription.toUpperCase()} VERSION</h4>
                <div class="subscription-details">
                    <span>Next billing date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                    <button class="btn-manage">Manage</button>
                </div>
            </div>
        `;
    } else {
        subscriptionsContainer.innerHTML = `
            <div class="empty-state">
                <p>No active subscriptions</p>
                <button id="getSubscriptions" class="btn-small">
                    <i class="fas fa-plus"></i> Add Subscription
                </button>
            </div>
        `;
        document.getElementById('getSubscriptions').addEventListener('click', showSubscriptionModal);
    }
}

//show subscription model
function showSubscriptionModal() {
    subscriptionModal.style.display = 'flex';
}

// Close subscription modal
function closeSubscriptionModal() {
    subscriptionModal.style.display = 'none';
}

// Event listeners
if (getSubscriptionsBtn) {
    getSubscriptionsBtn.addEventListener('click', showSubscriptionModal);
}

if (closeSubscriptionBtn) {
    closeSubscriptionBtn.addEventListener('click', closeSubscriptionModal);
}

if (cancelSubscriptionBtn) {
    cancelSubscriptionBtn.addEventListener('click', closeSubscriptionModal);
}
if (!subscriptionsContainer) {
    console.error('Subscriptions container not found');
    return;
}

// Handle subscription selection
document.querySelectorAll('.subscription-card .btn-select').forEach(card => {
    card.addEventListener('click', function() {
        const plan = this.dataset.plan;
        // In a real app, you would send this to your backend
        showPaymentModal(plan);
        
        // Show success message
        alert(`You've successfully subscribed to the ${plan.toUpperCase()} plan!`);
        
        // Close modal and refresh subscription display
        closeSubscriptionModal();
        loadUserSubscription();
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === subscriptionModal) {
        closeSubscriptionModal();
    }
});
  }

// Manage Subscription
  function showManageSubscription() {
    const currentPlan = localStorage.getItem('userSubscription') || 'free';
    const detailsContainer = document.getElementById('currentSubscriptionDetails');
    
    if (!detailsContainer) {
        console.error('Details container not found');
        return;
    }
    detailsContainer.innerHTML = `
        <div class="subscription-detail">
            <strong>Current Plan:</strong> ${currentPlan.toUpperCase()} VERSION
        </div>
        <div class="subscription-detail">
            <strong>Status:</strong> Active
        </div>
        <div class="subscription-detail">
            <strong>Next Billing Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
        </div>
    `;
    
    const manageModal = document.getElementById('manageSubscriptionModal');
    if (manageModal) {
        manageModal.style.display = 'flex';
    }
}

// Close management modal
function closeManageSubscriptionModal() {
    const manageModal = document.getElementById('manageSubscriptionModal');
    if (manageModal) {
        manageModal.style.display = 'none';
    }
}
// Update existing loadUserSubscription function


// Add these event listeners at the end of your subscription code
document.getElementById('changePlanBtn')?.addEventListener('click', () => {
    closeManageSubscriptionModal();
    showSubscriptionModal(null);
});

document.getElementById('cancelPlanBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
        localStorage.removeItem('userSubscription');
        closeManageSubscriptionModal();
        loadUserSubscription(); // Refresh the display
        alert('Your subscription has been cancelled');
    }
});

document.querySelector('#manageSubscriptionModal .close-btn')?.addEventListener('click', closeManageSubscriptionModal);
window.addEventListener('click', (e) => {
    if (e.target === subscriptionModal) {
        closeSubscriptionModal();
    }
    if (e.target === document.getElementById('manageSubscriptionModal')) {
        closeManageSubscriptionModal();
    }
});

// ---------- //
//Payment window and function
// --------- //

const paymentModal = document.getElementById('paymentModal');
const paymentOptions = document.querySelectorAll('.payment-option');
const cardPaymentForm = document.getElementById('cardPaymentForm');
const paypalForm = document.getElementById('paypalForm');
const netbankingForm = document.getElementById('netbankingForm');
const cancelPaymentBtn = document.getElementById('cancelPayment');
const confirmPaymentBtn = document.getElementById('confirmPayment');
let selectedPlan = null;
let selectedPaymentMethod = null;

// Function to show payment modal
function showPaymentModal(plan) {
  selectedPlan = plan;
  selectedPaymentMethod = null;
  
  // Reset forms
  cardPaymentForm.style.display = 'none';
  paypalForm.style.display = 'none';
  netbankingForm.style.display = 'none';
  
  paymentModal.style.display = 'flex';
}

// Payment option selection
paymentOptions.forEach(option => {
  option.addEventListener('click', function() {
    selectedPaymentMethod = this.dataset.method;
    
    // Hide all forms first
    cardPaymentForm.style.display = 'none';
    paypalForm.style.display = 'none';
    netbankingForm.style.display = 'none';
    
    // Show selected form
    if (selectedPaymentMethod === 'visa' || selectedPaymentMethod === 'mastercard') {
      cardPaymentForm.style.display = 'block';
    } else if (selectedPaymentMethod === 'paypal') {
      paypalForm.style.display = 'block';
    } else if (selectedPaymentMethod === 'netbanking') {
      netbankingForm.style.display = 'block';
    }
  });
});

// Cancel payment
cancelPaymentBtn.addEventListener('click', function() {
  paymentModal.style.display = 'none';
});

// Confirm payment
confirmPaymentBtn.addEventListener('click', async function() {
  if (!selectedPaymentMethod) {
    alert('Please select a payment method');
    return;
  }

  // Validate form based on payment method
  let isValid = true;
  let paymentDetails = {};

  if (selectedPaymentMethod === 'visa' || selectedPaymentMethod === 'mastercard') {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
    const cardName = document.getElementById('cardName').value;

    // Validate card details
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      return alert('Please enter a valid 16-digit card number');
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return alert('Please enter expiry date in MM/YY format');
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      return alert('Please enter a valid CVV (3-4 digits)');
    }
    if (!cardName.trim()) {
      return alert('Please enter name on card');
    }

    paymentDetails = {
      cardNumber,
      expiry,
      cvv,
      name: cardName
    };
  } 
  // Adding similar validation for other payment methods if needed

  try {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${BASE_URL}/api/subscriptions/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId : localStorage.getItem('userId'),
        plan: selectedPlan,
        paymentMethod: selectedPaymentMethod,
        paymentDetails : {
        }// Include payment details in the request
      })
    });

    // to check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned ${response.status}: ${text}`);
    }

    const data = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment failed');
    }

    localStorage.setItem('userSubscription', selectedPlan);
    paymentModal.style.display = 'none';
    loadUserSubscription();
    alert('Payment successful! Your subscription is now active.');
    
  } catch (error) {
    console.error('Payment error:', error);
    const cleanError = error.message.replace(/<[^>]*>?/gm, '');
    alert(`Payment failed: ${error.message}`);
  }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === paymentModal) {
    paymentModal.style.display = 'none';
  }
});

  // =====================
  //  NEW AI ASSISTANT 
  // =====================

  // AI Assistant Modal Logic
  const aiAssistantButton = document.getElementById('aiAssistantButton');
  const aiModal = document.getElementById('aiAssistantModal');
  const recommendationsContainer = document.getElementById('recommendationsContainer');
  const saveRecommendationsBtn = document.getElementById('saveRecommendations');
  const cancelRecommendationsBtn = document.getElementById('cancelRecommendations');

  if (aiAssistantButton) {
    aiAssistantButton.addEventListener('click', async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId || !token) {
        alert('Please sign in to use AI Assistant');
        window.location.href = 'index.html';
        return;
      }
      aiModal.style.display = 'flex';
      loadRecommendations(userId);
    });
  }

  function showErrorState(error) {
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    if (!recommendationsContainer) return;
  
    recommendationsContainer.innerHTML = `
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Couldn't load recommendations</h3>
      <p class="error-message">${error.message}</p>
      <div class="error-actions">
        <button id="retryBtn" class="btn-primary">Retry</button>
        <button id="signInBtn" class="btn-secondary">Sign In Again</button>
      </div>
    </div>
  `;
   document.getElementById('retryBtn').addEventListener('click', loadRecommendations);
  document.getElementById('signInBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
}


  async function loadRecommendations() {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!userId || !token) {
        throw new Error('Session expired. Please log in again.');
      }
      showLoadingState();
      
      const response = await fetch(`${BASE_URL}/api/ai/get-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
        credentials: 'include'
      });
      const result = await response.json();
      
       if (response.status === 403 || response.status === 401) {
        localStorage.removeItem('token');
      throw new Error('Session expired. Please sign in again.');
    }

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      if (!result || !result.recommendations) {
        console.error("No recommendations received:", result);
        alert("Could not load recommendations right now. Please try again later.");
        return;
      }

      renderCourses(result.recommendations || []);
      console.log(result);
  } catch (error) {
    showErrorState(error);
  }
}

function showLoadingState() {
    recommendationsContainer.innerHTML =  `
       <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Analyzing your profile and market trends...</p>
      </div>
    `;
  }

  function showErrorState(error) {
    recommendationsContainer.innerHTML = `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h3>Couldn't load recommendations</h3>
            <p class="error-message">${error.message}</p>
            <div class="error-actions">
                <button id="retryBtn" class="btn-primary">Retry</button>
                ${error.message.includes('Session expired') ? 
                    '<button id="signInBtn" class="btn-secondary">Sign In Again</button>' : ''}
            </div>
        </div>
    `;
    
    document.getElementById('retryBtn').addEventListener('click', () => {
        if (error.message.includes('Session expired')) {
            loadRecommendations();
        } else {
            loadRecommendations();
        }
    });
    
    document.getElementById('signInBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
}

  function renderCourses(courses) {
    recommendationsContainer.innerHTML = courses.length > 0 
      ? courses.map(course => `
          <div class="course-card">
            <input type="checkbox" id="course_${course.id}" checked>
            <label for="course_${course.id}">
              <h4>${course.title}</h4>
              <div class="course-meta">
                <span class="provider">${course.provider}</span>
                <span class="match-score">
                  <i class="fas fa-bolt"></i> ${Math.round(course.matchScore * 100)}% match
                </span>
              </div>
              <p class="match-reason">${course.matchReason}</p>
              <div class="course-footer">
                <a href="${course.url}" target="_blank" class="preview-link">
                  <i class="fas fa-external-link-alt"></i> Preview
                </a>
                ${course.isTrending ? `
                  <span class="trend-badge">
                    <i class="fas fa-fire"></i> Trending
                  </span>
                ` : ''}
              </div>
            </label>
          </div>
        `).join('')
      : `<div class="empty-state">
          <i class="fas fa-robot"></i>
          <p>No courses match your current profile</p>
          <button class="retry-btn" onclick="window.loadRecommendations()">
            <i class="fas fa-sync-alt"></i> Retry Analysis
          </button>
        </div>`;
  }

  if (saveRecommendationsBtn) {
    saveRecommendationsBtn.addEventListener('click', async () => {
      try{
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Not signed in.");
        return;
      }
      const courses = Array.from(document.querySelectorAll("#recommendationsContainer .course-card"))
      .map(card => ({
        title: card.querySelector("h4")?.innerText,
        provider: card.querySelector(".provider")?.innerText,
        url: card.querySelector("a")?.href
        }));
        if (!courses.length) {
          alert("No courses to save.");
          return;
        }
        const response = await fetch(`${BASE_URL}/api/ai/save-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
          body: JSON.stringify({ userId, courses }),
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to save courses');
        }
        let savedRecs = JSON.parse(localStorage.getItem("savedRecommendations") || "[]");
        savedRecs.push(courses);
        localStorage.setItem("savedRecommendations", JSON.stringify(savedRecs));

        renderSavedRecommendations();
        
        aiModal.style.display = 'none';
        alert("Courses saved successfully!");
      } catch (error) {
        alert('Save failed: ' + error.message);
      }
    });

    function renderSavedRecommendations() {
  const container = document.getElementById("savedRecommendationsContainer");
  if (!container) return;

  let savedRecs = JSON.parse(localStorage.getItem("savedRecommendations") || "[]");

  container.innerHTML = "";

  if (!savedRecs.length) {
    container.innerHTML = `<p class="empty-state">No saved recommendations yet.</p>`;
    return;
  }

  savedRecs.forEach((recSet, index) => {
    const block = document.createElement("div");
    block.className = "saved-recommendation";

    block.innerHTML = `
      <h4>Recommendation Set ${index + 1}</h4>
      <div class="actions">
        <button class="btn-show">Show</button>
        <button class="btn-delete">Delete</button>
      </div>
    `;

    // Show
    block.querySelector(".btn-show").addEventListener("click", () => {
      openRecommendationModal(recSet);
    });

    // Delete
    block.querySelector(".btn-delete").addEventListener("click", () => {
      savedRecs.splice(index, 1);
      localStorage.setItem("savedRecommendations", JSON.stringify(savedRecs));
      renderSavedRecommendations();
    });

    container.appendChild(block);
  });
}

function openRecommendationModal(courses) {
  const modal = document.getElementById("aiAssistantModal");
  const container = document.getElementById("recommendationsContainer");

  container.innerHTML = courses.map(course => `
    <div class="course-card">
      <h4>${course.title}</h4>
      <p class="provider">${course.provider}</p>
      <a href="${course.url}" target="_blank">View Course</a>
    </div>
  `).join("");

  modal.style.display = "flex";
}
}

  // Dashboard Integration
  function refreshDashboardCourses() {
    const container = document.getElementById('userCoursesContainer');
    if (!container) return;
    
    container.innerHTML = `
      <div class="loading-spinner small"></div>
      <p>Updating your learning path...</p>
    `;
    
    loadUserCourses();
  }
  async function loadUserCourses() {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:3000/api/ai/user-courses?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load courses');

      const courses = await response.json();
      renderUserCourses(courses || []);
       } catch (error) {
      renderUserCoursesError(error);
    }
  }
      function renderUserCourses(courses) {
      const container = document.getElementById('userCoursesContainer');
      if (!container) return;

      container.innerHTML = courses.length > 0 
        ? courses.map(course => `
            <div class="user-course">
            <div class="course-header">
              <h4>${course.title}</h4>
              <span class="provider">${course.provider}</span>
            </div>
            <div class="course-progress">
              <div class="progress-bar">
                <div class="progress" style="width: ${course.progress || 0}%"></div>
              </div>
            </div>
            <div class="course-actions">
              <a href="${course.url}" target="_blank" class="btn-start">
                <i class="fas fa-external-link-alt"></i> Continue
              </a>
              <button class="btn-complete" data-id="${course.id}">
                <i class="fas fa-check"></i> ${course.completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>
        `).join('')
      : `<div class="empty-state">
          <p>No courses selected yet</p>
          <button id="getRecommendations" class="btn-primary">
            <i class="fas fa-robot"></i> Get Recommendations
          </button>
        </div>`;

  // refresh button handler
  document.getElementById('refreshRecommendations')?.addEventListener('click', loadUserCourses);
    
    // Get Recommendations button handler
    document.getElementById('getRecommendations')?.addEventListener('click', () => {
      document.getElementById('aiAssistantModal').style.display = 'flex';
    });
  } 
  function renderUserCoursesError(error) {
    const container = document.getElementById('userCoursesContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${error.message || 'Failed to load courses'}</p>
        <button class="retry-btn" onclick="window.loadUserCourses()">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
  }
  async function markCourseComplete(e) {
    const courseId = e.target.dataset.id;
    try {
      const response = await fetch('/api/ai/complete-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          courseId
        })
      });
      if (!response.ok) throw new Error('Failed to mark complete');
         loadUserCourses(); // Refresh the list
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  }
  if (document.getElementById('userCoursesContainer')) {
    loadUserCourses();
  }

window.loadRecommendations = loadRecommendations;
window.loadUserCourses = loadUserCourses;

const uploadDataBtn = document.getElementById("uploadDataBtn");
const uploadDataModal = document.getElementById("uploadDataModal");
const uploadFilesBtn = document.getElementById("uploadFilesBtn");
const closeUploadBtns = uploadDataModal?.querySelectorAll(".close-btn");


if (uploadDataBtn && uploadDataModal) {
  // Open modal
  uploadDataBtn.addEventListener("click", (e) => {
    e.preventDefault();
    uploadDataModal.style.display = "flex";
  });

  // Close modal buttons
  closeUploadBtns?.forEach(btn => {
    btn.addEventListener("click", () => {
      uploadDataModal.style.display = "none";
    });
  });

  // Save files
  uploadFilesBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

  const resumeFile = document.getElementById("resumeUpload").files[0];
  const cvFile = document.getElementById("cvUpload").files[0];

  if (!resumeFile && !cvFile) {
    alert("Please upload at least one file");
    return;
  }

  // Validate file types
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png"
  ];
  if ((resumeFile && !allowedTypes.includes(resumeFile.type)) ||
      (cvFile && !allowedTypes.includes(cvFile.type))) {
    alert("❌ Only PDF, Word, JPEG, or PNG files are allowed.");
    return;
  }

  const formData = new FormData();
  if (resumeFile) formData.append("resume", resumeFile);
  if (cvFile) formData.append("cv", cvFile);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/analyze-files`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Upload failed");
    }

    const result = await response.json();
    console.log("Analysis result:", result);

    // Save to localStorage
    let storedFiles = JSON.parse(localStorage.getItem("uploadedDocs") || "[]");
    storedFiles.push({
      resume: resumeFile ? resumeFile.name : null,
      cv: cvFile ? cvFile.name : null,
      uploadedAt: new Date().toLocaleString(),
      analysis: result.analysis || []
    });
    localStorage.setItem("uploadedDocs", JSON.stringify(storedFiles));

    // Render in dashboard
    renderUploadedDocs();

    // Show analysis results in modal
    showAnalysisResults(result.analysis || []);
    uploadDataModal.style.display = "none";
  } catch (err) {
    console.error("Upload error:", err);
    alert("Failed to upload or analyze files" + err.message);
  }
});
}
  // ===================================
// Render Uploaded Documents Section
// ===================================
function renderUploadedDocs() {
  const container = document.getElementById("uploadedDocsContainer");
  if (!container) return;

  let docs = JSON.parse(localStorage.getItem("uploadedDocs") || "[]");
  container.innerHTML = docs.length

  ? docs.map((doc, index) => `
      <div class="uploaded-doc">
        <h4>Upload ${index + 1}</h4>
        <p><strong>Resume:</strong> ${doc.resume || "—"}</p>
        <p><strong>CV:</strong> ${doc.cv || "—"}</p>
        <p><small>Uploaded at: ${doc.uploadedAt}</small></p>
        <div class="actions">
          <button class="btn-show">Show Analysis</button>
          <button class="btn-delete">Delete</button>
        </div>
      </div>
    `).join("")
    : `<p class="empty-state">No resumes or CVs uploaded yet.</p>`;

  // Add event listeners
  docs.forEach((doc, index) => {
    const block = container.children[index];
    block.querySelector(".btn-show").addEventListener("click", () => {
      showAnalysisResults(doc.analysis || []);
    });
    block.querySelector(".btn-delete").addEventListener("click", () => {
      docs.splice(index, 1);
      localStorage.setItem("uploadedDocs", JSON.stringify(docs));
      renderUploadedDocs();
    });
  });
}

// ===================================
// Show results inside a modal
// ===================================
function showAnalysisResults(analysis = []) {
  const modal = document.getElementById("analysisResultModal");
  const container = document.getElementById("analysisResultsContainer");

  if (!Array.isArray(analysis)) {
    analysis = [];
  }

  container.innerHTML = analysis.length > 0
    ? analysis.map(result => `
        <div class="analysis-block">
          <h4>${result.file.toUpperCase()}</h4>
          <ul>
            ${result.feedback.map(f => `<li>${f}</li>`).join("")}
          </ul>
        </div>
      `).join("")
    : `<div class="empty-state">
        <p>No analysis results available</p>
      </div>`;

  modal.style.display = "flex";
}

const uploadModalForms = document.querySelectorAll("#uploadDataModal form");
uploadModalForms.forEach(f => {
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    return false;
  });
});

document.querySelectorAll("#uploadDataModal button").forEach(btn => {
  btn.setAttribute("type", "button");
});

// Prevent page to get refreshed
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
});

document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    this.closest('.modal').style.display = 'none';
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
});

// Run once on load
renderUploadedDocs();
});
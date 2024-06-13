/*!
* Start Bootstrap - Resume v7.0.5 (
)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
// update
// Scripts 
// 
const modeToggle = document.querySelector('#modeToggle');
const body = document.body;

window.addEventListener('DOMContentLoaded', event => {
    animateText();
    
    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            offset: 74,
        });
    };
    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    function animateText() {
        var roles = ['Senior QA Engineer', 'Technical Project Manager', 'ScrumMaster'];
        var roleText = document.getElementById('roles');
        var index = 0;
    
        function typeRole() {
            var text = roles[index];
            roleText.textContent = ''; // Clear previous role
            typeCharacters(text, 0); // Start typing the current role
        }
    
        function typeCharacters(text, charIndex) {
            if (charIndex < text.length) {
                roleText.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(function () {
                    typeCharacters(text, charIndex); // Recursive call to type next character
                }, 100); // Adjust the typing speed as needed
            } else {
                // Role typed out, wait before clearing
                setTimeout(function () {
                    clearRole(text);
                }, 1000); // Adjust the delay before clearing as needed
            }
        }
    
        function clearRole(text) {
            setTimeout(function () {
                var len = text.length;
                var currentText = roleText.textContent;
                if (currentText.length > 0) {
                    roleText.textContent = currentText.slice(0, -1); // Remove the last character
                    setTimeout(function () {
                        clearRole(text); // Recursive call to clear next character
                    }, 50); // Adjust the clearing speed as needed
                } else {
                    index = (index + 1) % roles.length; // Move to the next role in a loop
                    setTimeout(function () {
                        typeRole(); // Type the next role
                    }, 500); // Adjust the delay before typing the next role as needed
                }
            }, 5); // Adjust the delay before clearing as needed
        }
    
        // Start the animation
        typeRole();
    }

    // Dark mode
const modeToggle = document.querySelector('#modeToggle');
const body = document.body;

// Function to activate dark mode
function activateDarkMode() {
  body.classList.add('dark-mode');
  body.classList.remove('light-mode');
  localStorage.setItem('mode', 'dark');
}

// Function to activate light mode
function activateLightMode() {
  body.classList.add('light-mode');
  body.classList.remove('dark-mode');
  localStorage.setItem('mode', 'light');
}

// Event listener for the toggle switch
modeToggle.addEventListener('change', () => {
  if (modeToggle.checked) {
    activateDarkMode();
  } else {
    activateLightMode();
  }
});

// Check local storage for mode preference
const currentMode = localStorage.getItem('mode');
if (currentMode === 'dark') {
  activateDarkMode();
  modeToggle.checked = true;
} else {
  activateLightMode();
  modeToggle.checked = false;
}

});

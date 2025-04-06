// main.js - Core functionality for the SkillGrow application

document.addEventListener('DOMContentLoaded', function() {
    // Enable tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Enable popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Audio buttons functionality
    setupAudioButtons();
    
    // Animate elements on page load
    animateElementsOnScroll();
    
    // Setup age-appropriate content toggling
    setupAgeToggle();
});

/**
 * Sets up audio buttons to read text content for younger users
 */
function setupAudioButtons() {
    const audioButtons = document.querySelectorAll('.audio-btn');
    
    audioButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textToRead = this.getAttribute('data-text') || 
                               this.parentElement.querySelector('.audio-text').textContent;
            
            // Check if the browser supports speech synthesis
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(textToRead);
                utterance.rate = 0.9; // Slightly slower for children
                utterance.pitch = 1.1; // Slightly higher pitch for engagement
                window.speechSynthesis.speak(utterance);
                
                // Visual feedback
                this.innerHTML = '<i class="fas fa-volume-up"></i>';
                utterance.onend = () => {
                    this.innerHTML = '<i class="fas fa-volume-up"></i>';
                };
            } else {
                console.log('Speech synthesis not supported in this browser');
            }
        });
    });
}

/**
 * Animates elements when they come into view during scrolling
 */
function animateElementsOnScroll() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Only setup if there are elements to animate
    if (animatedElements.length === 0) return;
    
    // Observer options
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    // Callback function for intersection observer
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                // Stop observing after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    };
    
    // Create and setup the observer
    const observer = new IntersectionObserver(callback, options);
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Sets up toggles for age-appropriate content
 */
function setupAgeToggle() {
    const ageToggle = document.getElementById('age-toggle');
    if (!ageToggle) return;
    
    ageToggle.addEventListener('change', function() {
        const ageGroup = this.value;
        const contentElements = document.querySelectorAll('[data-age-group]');
        
        contentElements.forEach(element => {
            const elementAgeGroup = element.getAttribute('data-age-group');
            
            if (ageGroup === 'all' || elementAgeGroup === ageGroup) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    });
}

/**
 * Shows notification for achievements or progress
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, info, etc.)
 */
function showNotification(message, type = 'success') {
    // Use Bootstrap's toast component
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.innerHTML += toastHtml;
    const toastElement = toastContainer.querySelector('.toast:last-child');
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Remove the toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

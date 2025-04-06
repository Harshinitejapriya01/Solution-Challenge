// Module-specific JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize module components
    initModuleActivities();
    setupQuizzes();
    
    // Get module container
    const moduleContainer = document.querySelector('.module-container');
    if (!moduleContainer) return;
    
    // Track progress through module
    let currentStep = 0;
    const totalSteps = document.querySelectorAll('.activity-step').length;
    updateProgressBar(currentStep, totalSteps);
    
    // Navigation buttons
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    
    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            if (currentStep > 0) {
                navigateToStep(currentStep - 1);
            }
        });
        
        nextButton.addEventListener('click', () => {
            const currentActivity = document.querySelector(`.activity-step[data-step="${currentStep}"]`);
            
            // Check if the current step is a quiz that needs to be completed
            if (currentActivity && currentActivity.classList.contains('quiz-activity')) {
                const quizId = currentActivity.getAttribute('data-quiz-id');
                const quizCompleted = checkQuizCompletion(quizId);
                
                if (!quizCompleted) {
                    showAlert('Please complete the quiz before continuing', 'warning');
                    return;
                }
            }
            
            if (currentStep < totalSteps - 1) {
                navigateToStep(currentStep + 1);
            } else {
                completeModule();
            }
        });
    }
    
    // Function to navigate between steps
    function navigateToStep(step) {
        // Hide all steps
        document.querySelectorAll('.activity-step').forEach(activityStep => {
            activityStep.classList.add('d-none');
        });
        
        // Show the current step
        const stepElement = document.querySelector(`.activity-step[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.remove('d-none');
            currentStep = step;
            
            // Update progress bar
            updateProgressBar(currentStep, totalSteps);
            
            // Update buttons
            updateNavigationButtons(currentStep, totalSteps);
            
            // Save progress
            saveProgress(Math.floor((currentStep / (totalSteps - 1)) * 100));
        }
    }
    
    // Update the navigation buttons based on current step
    function updateNavigationButtons(current, total) {
        if (prevButton && nextButton) {
            prevButton.disabled = current === 0;
            
            if (current === total - 1) {
                nextButton.textContent = 'Complete';
                nextButton.classList.replace('btn-primary', 'btn-success');
            } else {
                nextButton.textContent = 'Next';
                nextButton.classList.replace('btn-success', 'btn-primary');
            }
        }
    }
    
    // Update progress bar
    function updateProgressBar(current, total) {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const progressPercentage = Math.floor((current / (total - 1)) * 100);
            progressBar.style.width = `${progressPercentage}%`;
            progressBar.setAttribute('aria-valuenow', progressPercentage);
            progressBar.textContent = `${progressPercentage}%`;
        }
    }
    
    // Initialize interactive activities in the module
    function initModuleActivities() {
        // Interactive drag and drop activities
        const draggableElements = document.querySelectorAll('.draggable');
        const dropZones = document.querySelectorAll('.drop-zone');
        
        draggableElements.forEach(elem => {
            elem.setAttribute('draggable', true);
            
            elem.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', this.id);
                this.classList.add('dragging');
            });
            
            elem.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
        });
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drop-hover');
            });
            
            zone.addEventListener('dragleave', function() {
                this.classList.remove('drop-hover');
            });
            
            zone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drop-hover');
                
                const draggedId = e.dataTransfer.getData('text/plain');
                const draggedElement = document.getElementById(draggedId);
                
                if (draggedElement) {
                    const correctAnswer = this.getAttribute('data-correct-item');
                    
                    if (draggedId === correctAnswer) {
                        this.classList.add('correct-match');
                        this.innerHTML = '';
                        this.appendChild(draggedElement.cloneNode(true));
                        draggedElement.classList.add('d-none');
                        
                        // Play success sound
                        playSound('success');
                    } else {
                        this.classList.add('incorrect-match');
                        setTimeout(() => {
                            this.classList.remove('incorrect-match');
                        }, 1000);
                        
                        // Play error sound
                        playSound('error');
                    }
                }
            });
        });

        // Interactive buttons for activities
        const activityButtons = document.querySelectorAll('.activity-button');
        activityButtons.forEach(button => {
            button.addEventListener('click', function() {
                const activityType = this.getAttribute('data-activity');
                const result = this.getAttribute('data-result');
                
                if (activityType && result) {
                    const resultContainer = document.getElementById(`${activityType}Result`);
                    if (resultContainer) {
                        resultContainer.innerHTML = result;
                        resultContainer.classList.remove('d-none');
                    }
                    
                    // Mark buttons in the same group
                    const activityGroup = this.getAttribute('data-group');
                    if (activityGroup) {
                        document.querySelectorAll(`[data-group="${activityGroup}"]`).forEach(btn => {
                            btn.classList.remove('btn-success', 'btn-danger');
                            btn.classList.add('btn-outline-secondary');
                        });
                        
                        // Highlight the clicked button
                        const isCorrect = this.getAttribute('data-correct') === 'true';
                        this.classList.remove('btn-outline-secondary');
                        this.classList.add(isCorrect ? 'btn-success' : 'btn-danger');
                        
                        // Play appropriate sound
                        playSound(isCorrect ? 'success' : 'error');
                    }
                }
            });
        });
    }
    
    // Setup quiz functionality
    function setupQuizzes() {
        const quizForms = document.querySelectorAll('.quiz-form');
        
        quizForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const quizId = this.getAttribute('data-quiz-id');
                const questions = this.querySelectorAll('.quiz-question');
                let score = 0;
                let totalQuestions = questions.length;
                
                questions.forEach(question => {
                    const questionId = question.getAttribute('data-question-id');
                    const selectedOption = document.querySelector(`input[name="q${questionId}"]:checked`);
                    
                    if (selectedOption) {
                        const isCorrect = selectedOption.getAttribute('data-correct') === 'true';
                        
                        // Mark question as correct or incorrect
                        const resultIcon = question.querySelector('.question-result');
                        if (resultIcon) {
                            resultIcon.innerHTML = isCorrect ? 
                                '<i class="fas fa-check-circle text-success"></i>' : 
                                '<i class="fas fa-times-circle text-danger"></i>';
                            resultIcon.classList.remove('d-none');
                        }
                        
                        if (isCorrect) {
                            score++;
                        }
                    }
                });
                
                // Display quiz results
                const resultElement = document.getElementById(`quiz${quizId}Result`);
                if (resultElement) {
                    const percentage = Math.round((score / totalQuestions) * 100);
                    resultElement.innerHTML = `
                        <div class="alert ${percentage >= 70 ? 'alert-success' : 'alert-warning'}">
                            <h4>Quiz Results</h4>
                            <p>You scored ${score} out of ${totalQuestions} (${percentage}%)</p>
                            ${percentage >= 70 ? 
                                '<p><i class="fas fa-trophy"></i> Great job! You can continue to the next section.</p>' : 
                                '<p><i class="fas fa-info-circle"></i> You might want to review this section before continuing.</p>'
                            }
                        </div>
                    `;
                    resultElement.classList.remove('d-none');
                    
                    // Mark quiz as completed if score is sufficient
                    if (percentage >= 70) {
                        localStorage.setItem(`quiz_${quizId}_completed`, 'true');
                    }
                }
            });
        });
    }
    
    // Check if a quiz has been completed
    function checkQuizCompletion(quizId) {
        const quizElement = document.querySelector(`.quiz-activity[data-quiz-id="${quizId}"]`);
        
        // If this step isn't a quiz or doesn't have completion requirement, return true
        if (!quizElement || !quizElement.getAttribute('data-requires-completion')) {
            return true;
        }
        
        return localStorage.getItem(`quiz_${quizId}_completed`) === 'true';
    }
    
    // Complete the module and save progress
    function completeModule() {
        const moduleId = moduleContainer.getAttribute('data-module-id');
        
        if (moduleId) {
            // Show completion message
            const completionModal = new bootstrap.Modal(document.getElementById('moduleCompletionModal'));
            completionModal.show();
            
            // Play celebration sound
            playSound('celebration');
            
            // Save 100% progress
            saveProgress(100);
        }
    }
    
    // Save progress to the server
    function saveProgress(percentage) {
        const moduleId = moduleContainer.getAttribute('data-module-id');
        
        if (!moduleId) return;
        
        fetch('/update_progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                module_id: moduleId,
                percentage: percentage
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Progress saved:', data);
        })
        .catch(error => {
            console.error('Error saving progress:', error);
        });
    }
    
    // Simple sound effects
    function playSound(type) {
        // Using Web Audio API for simple sounds
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        let oscillator = audioContext.createOscillator();
        let gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'success':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                
                setTimeout(() => {
                    let osc2 = audioContext.createOscillator();
                    osc2.connect(gainNode);
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
                    osc2.start();
                    osc2.stop(audioContext.currentTime + 0.2);
                }, 200);
                break;
                
            case 'error':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(196.00, audioContext.currentTime); // G3
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'celebration':
                // Play a small tune
                const notes = [
                    { note: 'C5', duration: 0.1 },
                    { note: 'E5', duration: 0.1 },
                    { note: 'G5', duration: 0.1 },
                    { note: 'C6', duration: 0.2 }
                ];
                
                const frequencies = {
                    'C5': 523.25,
                    'E5': 659.25,
                    'G5': 783.99,
                    'C6': 1046.50
                };
                
                let time = audioContext.currentTime;
                
                notes.forEach(noteObj => {
                    let osc = audioContext.createOscillator();
                    let gain = audioContext.createGain();
                    
                    gain.gain.setValueAtTime(0.3, time);
                    gain.gain.exponentialRampToValueAtTime(0.01, time + noteObj.duration);
                    
                    osc.frequency.setValueAtTime(frequencies[noteObj.note], time);
                    osc.type = 'sine';
                    
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    
                    osc.start(time);
                    osc.stop(time + noteObj.duration);
                    
                    time += noteObj.duration;
                });
                break;
        }
    }
    
    // If there are URL parameters, show the specified step
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    
    if (stepParam && !isNaN(parseInt(stepParam))) {
        const stepNumber = parseInt(stepParam);
        if (stepNumber >= 0 && stepNumber < totalSteps) {
            navigateToStep(stepNumber);
        }
    } else {
        // Start at the first step
        navigateToStep(0);
    }
});

// Progress tracking functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile progress charts
    const progressChartCanvas = document.getElementById('progressChart');
    
    if (progressChartCanvas) {
        // Get module progress data
        const modules = [];
        const progressValues = [];
        const backgroundColors = [];
        
        // Color palette for chart
        const colorPalette = [
            'rgba(75, 192, 192, 0.7)',  // Teal
            'rgba(255, 159, 64, 0.7)',  // Orange
            'rgba(54, 162, 235, 0.7)',  // Blue
            'rgba(255, 99, 132, 0.7)',  // Pink
            'rgba(153, 102, 255, 0.7)', // Purple
            'rgba(255, 205, 86, 0.7)'   // Yellow
        ];
        
        // Get data from DOM
        document.querySelectorAll('.module-progress-item').forEach((item, index) => {
            const moduleName = item.getAttribute('data-module-name');
            const progress = parseInt(item.getAttribute('data-progress'));
            
            if (moduleName && !isNaN(progress)) {
                modules.push(moduleName);
                progressValues.push(progress);
                backgroundColors.push(colorPalette[index % colorPalette.length]);
            }
        });
        
        // Create chart
        const progressChart = new Chart(progressChartCanvas, {
            type: 'bar',
            data: {
                labels: modules,
                datasets: [{
                    label: 'Completion %',
                    data: progressValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '% completed';
                            }
                        }
                    }
                }
            }
        });
        
        // Create achievements section
        const achievementsContainer = document.getElementById('achievementsContainer');
        
        if (achievementsContainer) {
            // Check if there are any achievements
            if (achievementsContainer.querySelectorAll('.achievement-item').length === 0) {
                achievementsContainer.innerHTML = `
                    <div class="text-center p-4">
                        <i class="fas fa-trophy fa-3x text-muted mb-3"></i>
                        <p>Complete modules to earn achievements!</p>
                    </div>
                `;
            } else {
                // Add animation to achievements
                document.querySelectorAll('.achievement-item').forEach((item, index) => {
                    item.style.animationDelay = `${index * 0.1}s`;
                });
            }
        }
    }
    
    // Add user preferences
    const themeSelector = document.getElementById('themeSelector');
    if (themeSelector) {
        themeSelector.addEventListener('change', function() {
            const selectedTheme = this.value;
            document.body.setAttribute('data-theme', selectedTheme);
            localStorage.setItem('userTheme', selectedTheme);
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('userTheme');
        if (savedTheme) {
            themeSelector.value = savedTheme;
            document.body.setAttribute('data-theme', savedTheme);
        }
    }
    
    // Audio preference toggle
    const audioToggle = document.getElementById('audioToggle');
    if (audioToggle) {
        audioToggle.addEventListener('change', function() {
            localStorage.setItem('audioEnabled', this.checked);
        });
        
        // Load saved preference
        const audioEnabled = localStorage.getItem('audioEnabled');
        if (audioEnabled !== null) {
            audioToggle.checked = audioEnabled === 'true';
        }
    }
    
    // Progress animation
    animateProgressBars();
});

// Function to animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar-animated');
    
    progressBars.forEach(bar => {
        const targetWidth = bar.getAttribute('data-progress') + '%';
        
        // Start at 0
        bar.style.width = '0%';
        
        // Animate to target width
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-in-out';
            bar.style.width = targetWidth;
        }, 100);
    });
}

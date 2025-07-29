// Character Creator Stage - Chub.AI Integration Demo
class CharacterCreatorStage {
    constructor() {
        this.state = {
            loading: false,
            error: null,
            success: null,
            authToken: 'demo_bearer_token_' + Math.random().toString(36).substr(2, 9)
        };
        
        this.validators = {
            validateName: (name) => {
                if (!name || name.trim().length === 0) {
                    return 'Character name is required';
                }
                if (name.length > 100) {
                    return 'Character name must be less than 100 characters';
                }
                return null;
            },
            
            validateTags: (tags) => {
                if (!tags) return null;
                const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                if (tagArray.length > 10) {
                    return 'Maximum 10 tags allowed';
                }
                for (let tag of tagArray) {
                    if (tag.length > 30) {
                        return 'Each tag must be less than 30 characters';
                    }
                }
                return null;
            },
            
            validateDefinition: (definition) => {
                if (!definition || definition.trim().length === 0) {
                    return 'Character definition is required';
                }
                if (definition.length < 50) {
                    return 'Character definition must be at least 50 characters';
                }
                if (definition.length > 5000) {
                    return 'Character definition must be less than 5000 characters';
                }
                return null;
            },
            
            validateAvatarUrl: (url) => {
                if (!url) return null;
                try {
                    new URL(url);
                    return null;
                } catch {
                    return 'Please enter a valid URL';
                }
            }
        };
        
        this.init();
    }
    
    init() {
        // Bind event listeners
        const form = document.getElementById('character-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        
        // Add real-time validation
        this.setupValidation();
        
        // Simulate authentication status
        this.updateAuthStatus();
        
        // Handle avatar file upload
        const avatarFile = document.getElementById('avatar-file');
        if (avatarFile) {
            avatarFile.addEventListener('change', this.handleAvatarFile.bind(this));
        }
    }
    
    setupValidation() {
        const fields = [
            { id: 'name', validator: 'validateName' },
            { id: 'tags', validator: 'validateTags' },
            { id: 'definition', validator: 'validateDefinition' },
            { id: 'avatar-url', validator: 'validateAvatarUrl' }
        ];
        
        fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (input) {
                input.addEventListener('blur', () => {
                    this.validateField(field.id, field.validator);
                });
                
                input.addEventListener('input', () => {
                    // Clear error on input
                    this.clearFieldError(field.id);
                });
            }
        });
    }
    
    validateField(fieldId, validatorName) {
        const input = document.getElementById(fieldId);
        if (!input) return true;
        
        const error = this.validators[validatorName](input.value);
        
        if (error) {
            this.showFieldError(fieldId, error);
            return false;
        } else {
            this.clearFieldError(fieldId);
            return true;
        }
    }
    
    showFieldError(fieldId, message) {
        const input = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + '-error');
        
        if (input) input.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    clearFieldError(fieldId) {
        const input = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + '-error');
        
        if (input) input.classList.remove('error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }
    
    validateAllFields() {
        // Validate required fields and show errors
        const nameValid = this.validateField('name', 'validateName');
        const definitionValid = this.validateField('definition', 'validateDefinition');
        const tagsValid = this.validateField('tags', 'validateTags');
        const avatarUrlValid = this.validateField('avatar-url', 'validateAvatarUrl');
        
        return nameValid && definitionValid && tagsValid && avatarUrlValid;
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        console.log('Form submission started');
        
        // Clear previous messages
        this.clearStatusMessages();
        
        // Validate all fields and show individual errors
        const isValid = this.validateAllFields();
        
        if (!isValid) {
            this.showStatusMessage('Please fix the errors above', 'error');
            return;
        }
        
        // Check authentication
        if (!this.state.authToken) {
            this.showStatusMessage('Authentication required. Please log in to Chub.AI', 'error');
            return;
        }
        
        // Set loading state
        this.setState({ loading: true, error: null, success: null });
        
        try {
            // Get form data
            const formData = new FormData(event.target);
            const payload = {
                name: formData.get('name')?.trim() || '',
                tagline: formData.get('tagline')?.trim() || '',
                avatarUrl: formData.get('avatarUrl')?.trim() || '',
                tags: formData.get('tags')?.trim() || '',
                definition: formData.get('definition')?.trim() || '',
                avatarFile: formData.get('avatarFile')
            };
            
            console.log('Payload:', payload);
            
            // Handle avatar upload if file is provided
            let avatarUrl = payload.avatarUrl;
            if (payload.avatarFile && payload.avatarFile.size > 0) {
                console.log('Uploading avatar...');
                avatarUrl = await this.uploadAvatar(payload.avatarFile);
            }
            
            // Create character
            console.log('Creating character...');
            const characterId = await this.createCharacter({
                name: payload.name,
                tagline: payload.tagline,
                avatarUrl: avatarUrl,
                tags: payload.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
                definition: payload.definition
            });
            
            console.log('Character created:', characterId);
            
            // Success - stop loading first
            this.setState({ loading: false, success: 'Character created successfully!' });
            
            // Show success modal
            this.showSuccessModal(characterId);
            
            // Reset form after showing modal
            this.resetForm();
            
        } catch (error) {
            console.error('Error creating character:', error);
            this.setState({ loading: false, error: error.message });
            this.showStatusMessage(error.message, 'error');
        }
    }
    
    async uploadAvatar(file) {
        // Simulate avatar upload process
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    reject(new Error('Avatar file size must be less than 5MB'));
                    return;
                }
                
                if (!file.type.startsWith('image/')) {
                    reject(new Error('Avatar must be an image file'));
                    return;
                }
                
                // Simulate successful upload
                const mockUrl = `https://chub.ai/avatars/${Date.now()}_${file.name}`;
                resolve(mockUrl);
            }, 1000);
        });
    }
    
    async createCharacter(data) {
        // Simulate API call to Chub.AI
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate successful creation (reduced error rate for testing)
                const random = Math.random();
                
                if (random < 0.05) {
                    // Simulate rate limit error
                    reject(new Error('Rate limit reached. Please try again in a minute.'));
                } else if (random < 0.08) {
                    // Simulate authentication error
                    reject(new Error('Authentication failed. Please log in again.'));
                } else if (random < 0.1) {
                    // Simulate server error
                    reject(new Error('Server error. Please try again later.'));
                } else {
                    // Simulate successful creation
                    const characterId = 'char_' + Math.random().toString(36).substr(2, 9);
                    resolve(characterId);
                }
            }, 1500); // Reduced API delay for better UX
        });
    }
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateUI();
    }
    
    updateUI() {
        const createButton = document.getElementById('create-button');
        const buttonText = createButton?.querySelector('.button-text');
        const spinner = createButton?.querySelector('.loading-spinner');
        
        if (createButton && buttonText && spinner) {
            if (this.state.loading) {
                createButton.disabled = true;
                buttonText.textContent = 'Creating Character...';
                spinner.classList.remove('hidden');
            } else {
                createButton.disabled = false;
                buttonText.textContent = 'Create Character';
                spinner.classList.add('hidden');
            }
        }
    }
    
    showStatusMessage(message, type) {
        const statusContainer = document.getElementById('status-messages');
        if (!statusContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `status-message ${type}`;
        messageElement.textContent = message;
        
        statusContainer.appendChild(messageElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }
    
    clearStatusMessages() {
        const statusContainer = document.getElementById('status-messages');
        if (statusContainer) {
            statusContainer.innerHTML = '';
        }
    }
    
    showSuccessModal(characterId) {
        const modal = document.getElementById('success-modal');
        const characterLink = document.getElementById('character-link');
        
        if (!modal || !characterLink) {
            console.error('Modal elements not found');
            return;
        }
        
        characterLink.href = `https://chub.ai/c/${characterId}`;
        characterLink.onclick = (e) => {
            e.preventDefault();
            // Simulate system message in chat
            this.addSystemMessage(`Character created successfully! Chat with your character: https://chub.ai/c/${characterId}`);
            // Open in new tab
            window.open(`https://chub.ai/c/${characterId}`, '_blank');
        };
        
        modal.classList.remove('hidden');
        
        // Close modal when clicking backdrop
        const backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.onclick = () => {
                this.closeSuccessModal();
            };
        }
    }
    
    closeSuccessModal() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    resetForm() {
        const form = document.getElementById('character-form');
        if (form) {
            form.reset();
        }
        
        // Clear all field errors
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.classList.remove('show');
        });
        
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
        
        // Re-enable avatar URL field
        const avatarUrlInput = document.getElementById('avatar-url');
        if (avatarUrlInput) {
            avatarUrlInput.disabled = false;
        }
    }
    
    updateAuthStatus() {
        const authIndicator = document.getElementById('auth-indicator');
        if (!authIndicator) return;
        
        if (this.state.authToken) {
            authIndicator.innerHTML = '<span>✓ Authenticated with Chub.AI</span>';
            authIndicator.className = 'status status--success';
        } else {
            authIndicator.innerHTML = '<span>⚠ Not authenticated</span>';
            authIndicator.className = 'status status--warning';
        }
    }
    
    handleAvatarFile(event) {
        const file = event.target.files[0];
        const avatarUrlInput = document.getElementById('avatar-url');
        
        if (file) {
            // Clear avatar URL if file is selected
            if (avatarUrlInput) {
                avatarUrlInput.value = '';
                avatarUrlInput.disabled = true;
            }
            
            // Show file info
            this.showStatusMessage(`Avatar file selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`, 'info');
        } else {
            if (avatarUrlInput) {
                avatarUrlInput.disabled = false;
            }
        }
    }
    
    // Method to load demo character data
    loadDemoCharacter() {
        console.log('Loading demo character...');
        const randomChar = demoCharacters[Math.floor(Math.random() * demoCharacters.length)];
        
        const nameInput = document.getElementById('name');
        const taglineInput = document.getElementById('tagline');
        const tagsInput = document.getElementById('tags');
        const definitionInput = document.getElementById('definition');
        
        if (nameInput) nameInput.value = randomChar.name;
        if (taglineInput) taglineInput.value = randomChar.tagline;
        if (tagsInput) tagsInput.value = randomChar.tags;
        if (definitionInput) definitionInput.value = randomChar.definition;
        
        // Clear any existing validation errors
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.classList.remove('show');
        });
        
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.classList.remove('error');
        });
        
        this.showStatusMessage('Demo character loaded! You can modify and create it.', 'info');
    }
    
    // Simulate Chub.AI Stage lifecycle methods
    beforePrompt(message, context) {
        // This would intercept chat messages before they're sent
        console.log('Before prompt:', message);
        return message;
    }
    
    afterResponse(message, context) {
        // This would handle responses from the AI
        console.log('After response:', message);
    }
    
    addSystemMessage(message) {
        // Simulate adding a system message to the chat
        console.log('System message:', message);
        this.showStatusMessage(message, 'success');
    }
}

// Demo data
const demoCharacters = [
    {
        name: "Aria the Wise",
        tagline: "Ancient wizard with vast knowledge",
        tags: "fantasy, wizard, wise, magic, ancient",
        definition: "Aria is an ancient wizard who has lived for over 1000 years. She possesses vast knowledge of magic and the world's history. Despite her age, she maintains a youthful appearance and a kind demeanor. She enjoys teaching others and sharing her wisdom, often speaking in riddles and metaphors. Aria is patient, thoughtful, and always seeks to help others grow and learn."
    },
    {
        name: "Captain Rex",
        tagline: "Brave space explorer",
        tags: "sci-fi, captain, brave, space, explorer",
        definition: "Captain Rex is a seasoned space explorer who has traveled to the far reaches of the galaxy. He's known for his bravery, quick thinking, and unwavering determination. Rex leads his crew with confidence and always puts their safety first. He has a dry sense of humor and enjoys sharing stories of his adventures across the stars."
    },
    {
        name: "Luna the Artist",
        tagline: "Creative soul with a passion for art",
        tags: "artist, creative, passionate, inspiring, dreamer",
        definition: "Luna is a talented artist who sees beauty in everything around her. She's passionate about various forms of art including painting, sculpture, and digital media. Luna is introspective, imaginative, and always looking for new ways to express herself creatively. She loves to inspire others to explore their own artistic abilities and often speaks about the emotional power of art."
    }
];

// Global functions for modal control
window.closeSuccessModal = function() {
    if (window.characterCreator) {
        window.characterCreator.closeSuccessModal();
    }
};

// Demo functionality
window.loadDemoCharacter = function() {
    console.log('loadDemoCharacter called');
    if (window.characterCreator) {
        window.characterCreator.loadDemoCharacter();
    } else {
        console.error('characterCreator not available');
    }
};

// Add demo button (for testing purposes)
function addDemoButton() {
    const formActions = document.querySelector('.form-actions');
    if (!formActions) return;
    
    const demoButton = document.createElement('button');
    demoButton.type = 'button';
    demoButton.className = 'btn btn--outline btn--sm';
    demoButton.textContent = 'Load Demo Character';
    demoButton.style.marginTop = 'var(--space-8)';
    demoButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.loadDemoCharacter();
    });
    
    formActions.appendChild(demoButton);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Initialize the character creator
    window.characterCreator = new CharacterCreatorStage();
    
    // Add demo functionality
    addDemoButton();
    
    // Handle browser back/forward
    window.addEventListener('popstate', function(event) {
        const modal = document.getElementById('success-modal');
        if (modal && !modal.classList.contains('hidden')) {
            window.characterCreator.closeSuccessModal();
        }
    });
    
    // Handle escape key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('success-modal');
            if (modal && !modal.classList.contains('hidden')) {
                window.characterCreator.closeSuccessModal();
            }
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + Enter to submit form
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            const form = document.getElementById('character-form');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
    
    console.log('Character Creator Stage initialized');
    console.log('This demo simulates the Chub.AI Stage functionality');
});
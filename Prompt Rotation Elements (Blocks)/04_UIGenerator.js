/**
 * UI GENERATOR BLOCK
 * 
 * Dynamic UI creation engine that generates beautiful, interactive controls for your
 * variables. Framework-agnostic with multiple style themes. Drop it anywhere!
 * 
 * INPUT: Variables array + configuration
 * OUTPUT: Complete UI with dropdowns, custom inputs, and controls
 * 
 * DEPENDENCIES: None (generates vanilla HTML/CSS/JS)
 */

class UIGenerator {
    constructor(config = {}) {
        this.config = {
            theme: config.theme || 'default', // default, dark, minimal, gradient
            containerClass: config.containerClass || 'prompt-rotation-ui',
            animations: config.animations !== false,
            compactMode: config.compactMode || false,
            maxHeight: config.maxHeight || '400px',
            ...config
        };
        
        // Style definitions
        this.themes = {
            default: {
                container: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4',
                variableBox: 'p-3 border border-gray-200 dark:border-gray-600 rounded-lg mb-3',
                label: 'block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300',
                select: 'w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm',
                button: 'px-3 py-1 rounded text-sm transition-colors',
                customInput: 'w-full p-2 border rounded text-sm bg-white dark:bg-gray-700'
            },
            dark: {
                container: 'bg-gray-900 rounded-xl shadow-xl p-4 text-white',
                variableBox: 'p-3 border border-gray-700 rounded-lg mb-3 bg-gray-800',
                label: 'block text-sm font-medium mb-2 text-gray-200',
                select: 'w-full p-2 border border-gray-600 rounded bg-gray-700 text-white text-sm',
                button: 'px-3 py-1 rounded text-sm transition-all hover:scale-105',
                customInput: 'w-full p-2 border border-gray-600 rounded text-sm bg-gray-700 text-white'
            },
            minimal: {
                container: 'p-4',
                variableBox: 'p-2 mb-2',
                label: 'text-xs font-medium mb-1 text-gray-600',
                select: 'w-full p-1 border-b border-gray-300 text-sm focus:border-blue-500 transition-colors',
                button: 'px-2 py-1 text-xs',
                customInput: 'w-full p-1 border-b text-sm'
            },
            gradient: {
                container: 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-2xl shadow-xl p-6',
                variableBox: 'p-3 bg-white dark:bg-gray-800 bg-opacity-70 backdrop-blur rounded-lg mb-3',
                label: 'block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200',
                select: 'w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm',
                button: 'px-3 py-1 rounded-lg text-sm font-medium transition-all hover:shadow-md',
                customInput: 'w-full p-2 border rounded-lg text-sm'
            }
        };
        
        // Event handlers storage
        this.eventHandlers = new Map();
    }
    
    /**
     * Generate complete UI for variables
     * @param {Array} variables - Array of variable objects
     * @param {HTMLElement|string} container - Container element or selector
     * @returns {HTMLElement} - Generated UI element
     */
    generateUI(variables, container) {
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!containerEl) {
            console.error('Container not found');
            return null;
        }
        
        // Clear existing content
        containerEl.innerHTML = '';
        
        // Create main wrapper
        const wrapper = this.createElement('div', {
            className: `${this.config.containerClass} ${this.themes[this.config.theme].container}`,
            style: this.config.maxHeight ? `max-height: ${this.config.maxHeight}; overflow-y: auto;` : ''
        });
        
        // Generate variable controls
        variables.forEach((variable, index) => {
            const variableUI = this.generateVariableControl(variable, index);
            wrapper.appendChild(variableUI);
        });
        
        // Add navigation controls if needed
        if (this.config.showNavigation) {
            const navControls = this.generateNavigationControls();
            wrapper.appendChild(navControls);
        }
        
        containerEl.appendChild(wrapper);
        
        // Apply animations if enabled
        if (this.config.animations) {
            this.applyAnimations(wrapper);
        }
        
        return wrapper;
    }
    
    /**
     * Generate control for a single variable
     */
    generateVariableControl(variable, index) {
        const theme = this.themes[this.config.theme];
        
        // Variable container
        const container = this.createElement('div', {
            className: theme.variableBox,
            'data-variable-index': index
        });
        
        // Label
        const label = this.createElement('label', {
            className: theme.label,
            textContent: variable.name + ':'
        });
        container.appendChild(label);
        
        // Control wrapper
        const controlWrapper = this.createElement('div', {
            className: 'flex gap-2'
        });
        
        // Dropdown select
        const select = this.generateSelect(variable, index);
        controlWrapper.appendChild(select);
        
        // Add custom button
        if (this.config.allowCustomOptions !== false) {
            const addButton = this.generateAddButton(variable, index);
            controlWrapper.appendChild(addButton);
        }
        
        container.appendChild(controlWrapper);
        
        // Custom input area (hidden by default)
        if (this.config.allowCustomOptions !== false) {
            const customInputArea = this.generateCustomInputArea(variable, index);
            container.appendChild(customInputArea);
        }
        
        return container;
    }
    
    /**
     * Generate select dropdown
     */
    generateSelect(variable, index) {
        const theme = this.themes[this.config.theme];
        const select = this.createElement('select', {
            className: theme.select + ' flex-1',
            'data-variable-index': index
        });
        
        // Prepare options
        let options = [...(variable.options || [])];
        
        // Ensure current_value is first if it exists
        if (variable.current_value) {
            options = options.filter(opt => opt !== variable.current_value);
            options.unshift(variable.current_value);
        }
        
        // Create option elements
        options.forEach(optionValue => {
            const isOriginal = optionValue === variable.current_value;
            const option = this.createElement('option', {
                value: optionValue,
                textContent: isOriginal ? `${optionValue} (Original)` : optionValue,
                selected: isOriginal
            });
            select.appendChild(option);
        });
        
        // Add change handler
        this.addEventHandler(select, 'change', (e) => {
            this.handleSelectChange(e, variable, index);
        });
        
        return select;
    }
    
    /**
     * Generate add custom option button
     */
    generateAddButton(variable, index) {
        const theme = this.themes[this.config.theme];
        const button = this.createElement('button', {
            className: `${theme.button} bg-blue-500 hover:bg-blue-600 text-white`,
            textContent: '+',
            title: 'Add custom options',
            'data-action': 'add-custom',
            'data-variable-index': index
        });
        
        this.addEventHandler(button, 'click', (e) => {
            this.toggleCustomInput(index);
        });
        
        return button;
    }
    
    /**
     * Generate custom input area
     */
    generateCustomInputArea(variable, index) {
        const theme = this.themes[this.config.theme];
        const container = this.createElement('div', {
            className: 'hidden mt-2',
            id: `custom-input-${index}`
        });
        
        // Textarea
        const textarea = this.createElement('textarea', {
            className: theme.customInput,
            placeholder: 'Add custom options (one per line)',
            rows: 3,
            id: `custom-text-${index}`
        });
        container.appendChild(textarea);
        
        // Button group
        const buttonGroup = this.createElement('div', {
            className: 'flex gap-2 mt-2'
        });
        
        // Add button
        const addBtn = this.createElement('button', {
            className: `${theme.button} bg-green-600 hover:bg-green-700 text-white`,
            textContent: 'Add Options'
        });
        this.addEventHandler(addBtn, 'click', () => {
            this.confirmCustomOptions(variable, index);
        });
        buttonGroup.appendChild(addBtn);
        
        // AI Expand button (if configured)
        if (this.config.enableAIExpand) {
            const aiBtn = this.createElement('button', {
                className: `${theme.button} bg-purple-600 hover:bg-purple-700 text-white`,
                textContent: 'AI Expand'
            });
            this.addEventHandler(aiBtn, 'click', () => {
                this.aiExpandOptions(variable, index);
            });
            buttonGroup.appendChild(aiBtn);
        }
        
        // Cancel button
        const cancelBtn = this.createElement('button', {
            className: `${theme.button} bg-gray-500 hover:bg-gray-600 text-white`,
            textContent: 'Cancel'
        });
        this.addEventHandler(cancelBtn, 'click', () => {
            this.toggleCustomInput(index, false);
        });
        buttonGroup.appendChild(cancelBtn);
        
        container.appendChild(buttonGroup);
        
        return container;
    }
    
    /**
     * Generate navigation controls
     */
    generateNavigationControls() {
        const theme = this.themes[this.config.theme];
        const container = this.createElement('div', {
            className: 'flex items-center justify-center gap-3 mt-4 p-3 border-t'
        });
        
        // Previous button
        const prevBtn = this.createElement('button', {
            className: `${theme.button} bg-gray-600 hover:bg-gray-700 text-white`,
            textContent: '← Previous',
            id: 'prev-combination'
        });
        container.appendChild(prevBtn);
        
        // Counter
        const counter = this.createElement('span', {
            className: 'px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium',
            textContent: '1 / 1',
            id: 'combination-counter'
        });
        container.appendChild(counter);
        
        // Next button
        const nextBtn = this.createElement('button', {
            className: `${theme.button} bg-gray-600 hover:bg-gray-700 text-white`,
            textContent: 'Next →',
            id: 'next-combination'
        });
        container.appendChild(nextBtn);
        
        return container;
    }
    
    /**
     * Helper to create elements with attributes
     */
    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });
        
        return element;
    }
    
    /**
     * Add event handler with tracking
     */
    addEventHandler(element, event, handler) {
        element.addEventListener(event, handler);
        
        // Store for cleanup
        if (!this.eventHandlers.has(element)) {
            this.eventHandlers.set(element, []);
        }
        this.eventHandlers.get(element).push({ event, handler });
    }
    
    /**
     * Toggle custom input visibility
     */
    toggleCustomInput(index, show = null) {
        const customInput = document.getElementById(`custom-input-${index}`);
        if (!customInput) return;
        
        if (show === null) {
            customInput.classList.toggle('hidden');
        } else {
            customInput.classList.toggle('hidden', !show);
        }
        
        if (!customInput.classList.contains('hidden')) {
            const textarea = document.getElementById(`custom-text-${index}`);
            if (textarea) textarea.focus();
        }
    }
    
    /**
     * Handle select change
     */
    handleSelectChange(event, variable, index) {
        const selectedValue = event.target.value;
        
        if (this.config.onVariableChange) {
            this.config.onVariableChange({
                variable: variable,
                index: index,
                oldValue: variable.selectedValue || variable.current_value,
                newValue: selectedValue
            });
        }
    }
    
    /**
     * Confirm custom options
     */
    confirmCustomOptions(variable, index) {
        const textarea = document.getElementById(`custom-text-${index}`);
        if (!textarea) return;
        
        const customText = textarea.value.trim();
        if (!customText) return;
        
        const newOptions = customText.split('\n')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);
        
        if (this.config.onCustomOptions) {
            this.config.onCustomOptions({
                variable: variable,
                index: index,
                options: newOptions
            });
        }
        
        // Clear and hide
        textarea.value = '';
        this.toggleCustomInput(index, false);
    }
    
    /**
     * AI expand options
     */
    aiExpandOptions(variable, index) {
        const textarea = document.getElementById(`custom-text-${index}`);
        if (!textarea) return;
        
        const examples = textarea.value.trim();
        if (!examples) return;
        
        if (this.config.onAIExpand) {
            this.config.onAIExpand({
                variable: variable,
                index: index,
                examples: examples.split('\n').map(e => e.trim()).filter(e => e)
            });
        }
    }
    
    /**
     * Apply entrance animations
     */
    applyAnimations(container) {
        const elements = container.querySelectorAll('[data-variable-index]');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.3s ease-out';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    /**
     * Update UI with new variables
     */
    updateVariables(variables) {
        // Find all selects and update their options
        variables.forEach((variable, index) => {
            const select = document.querySelector(`select[data-variable-index="${index}"]`);
            if (!select) return;
            
            // Clear and rebuild options
            select.innerHTML = '';
            
            let options = [...(variable.options || [])];
            if (variable.current_value) {
                options = options.filter(opt => opt !== variable.current_value);
                options.unshift(variable.current_value);
            }
            
            options.forEach(optionValue => {
                const isOriginal = optionValue === variable.current_value;
                const option = this.createElement('option', {
                    value: optionValue,
                    textContent: isOriginal ? `${optionValue} (Original)` : optionValue,
                    selected: optionValue === (variable.selectedValue || variable.current_value)
                });
                select.appendChild(option);
            });
        });
    }
    
    /**
     * Clean up event handlers
     */
    cleanup() {
        this.eventHandlers.forEach((handlers, element) => {
            handlers.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.eventHandlers.clear();
    }
}

// Export for use
window.UIGenerator = UIGenerator;

/**
 * USAGE EXAMPLE:
 * 
 * const uiGen = new UIGenerator({
 *     theme: 'gradient',
 *     animations: true,
 *     allowCustomOptions: true,
 *     enableAIExpand: true,
 *     showNavigation: true,
 *     onVariableChange: (data) => {
 *         console.log('Variable changed:', data);
 *         // Update your prompt
 *     },
 *     onCustomOptions: (data) => {
 *         console.log('Custom options added:', data);
 *         // Add to variable options
 *     },
 *     onAIExpand: (data) => {
 *         console.log('AI expand requested:', data);
 *         // Call your AI service
 *     }
 * });
 * 
 * // Generate UI
 * const variables = [
 *     { name: "Setting", current_value: "forest", options: ["forest", "desert", "ocean"] },
 *     { name: "Time", current_value: "dawn", options: ["dawn", "noon", "dusk", "midnight"] }
 * ];
 * 
 * uiGen.generateUI(variables, '#variable-controls');
 * 
 * // Update dynamically
 * variables[0].options.push("mountain");
 * uiGen.updateVariables(variables);
 */
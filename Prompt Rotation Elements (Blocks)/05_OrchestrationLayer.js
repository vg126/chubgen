/**
 * ORCHESTRATION LAYER
 * 
 * The master conductor that brings all blocks together into a seamless, powerful system.
 * This is your complete prompt rotation engine - ready to drop into any project!
 * 
 * INPUT: Configuration + prompt + container
 * OUTPUT: Fully functional prompt rotation system
 * 
 * DEPENDENCIES: All 4 previous blocks
 */

class PromptRotationOrchestrator {
    constructor(config = {}) {
        this.config = {
            // Core settings
            analysisModel: config.analysisModel || 'gpt-4',
            enableAI: config.enableAI !== false,
            enableCustomOptions: config.enableCustomOptions !== false,
            enableHistory: config.enableHistory !== false,
            
            // UI settings
            theme: config.theme || 'default',
            animations: config.animations !== false,
            showStats: config.showStats !== false,
            showPreview: config.showPreview !== false,
            
            // Limits
            maxVariables: config.maxVariables || 10,
            maxCombinations: config.maxCombinations || 10000,
            
            // Callbacks
            onPromptChange: config.onPromptChange || (() => {}),
            onAnalysisComplete: config.onAnalysisComplete || (() => {}),
            onError: config.onError || ((error) => console.error(error)),
            
            ...config
        };
        
        // Initialize all components
        this.initializeComponents();
        
        // State management
        this.state = {
            originalPrompt: '',
            currentPrompt: '',
            variables: [],
            isAnalyzing: false,
            history: [],
            stats: {}
        };
        
        // Bind methods
        this.analyzePrompt = this.analyzePrompt.bind(this);
        this.handleVariableChange = this.handleVariableChange.bind(this);
        this.handleCustomOptions = this.handleCustomOptions.bind(this);
        this.handleAIExpand = this.handleAIExpand.bind(this);
    }
    
    /**
     * Initialize all component blocks
     */
    initializeComponents() {
        // 1. Variable Analyzer
        this.analyzer = new VariableAnalyzer({
            maxVariables: this.config.maxVariables,
            minVariableLength: 2,
            onAnalysisComplete: (result) => this.onAnalysisResult(result)
        });
        
        // 2. Combination Engine
        this.engine = new CombinationEngine({
            maxCombinations: this.config.maxCombinations,
            onStateChange: (state) => this.onEngineStateChange(state),
            onNavigate: (state, direction) => this.onEngineNavigate(state, direction)
        });
        
        // 3. Prompt Replacer
        this.replacer = new PromptReplacer({
            caseInsensitive: true,
            preserveCase: true,
            wordBoundaries: true
        });
        
        // 4. UI Generator
        this.uiGenerator = new UIGenerator({
            theme: this.config.theme,
            animations: this.config.animations,
            allowCustomOptions: this.config.enableCustomOptions,
            enableAIExpand: this.config.enableAI,
            showNavigation: true,
            onVariableChange: this.handleVariableChange,
            onCustomOptions: this.handleCustomOptions,
            onAIExpand: this.handleAIExpand
        });
    }
    
    /**
     * Initialize the complete system
     * @param {string} prompt - Initial prompt
     * @param {HTMLElement|string} container - Container for UI
     */
    async initialize(prompt, container) {
        this.state.originalPrompt = prompt;
        this.state.currentPrompt = prompt;
        
        // Create main container structure
        this.setupContainer(container);
        
        // Show initial prompt
        this.updatePromptDisplay();
        
        // Auto-analyze if configured
        if (this.config.autoAnalyze && prompt) {
            await this.analyzePrompt(prompt);
        }
    }
    
    /**
     * Setup container with all sections
     */
    setupContainer(container) {
        const containerEl = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!containerEl) {
            throw new Error('Container not found');
        }
        
        this.container = containerEl;
        this.container.innerHTML = `
            <div class="prompt-rotation-orchestrator ${this.config.theme}">
                <!-- Prompt Input Section -->
                <div class="prompt-input-section mb-4">
                    <label class="block text-sm font-medium mb-2">Original Prompt</label>
                    <textarea id="original-prompt" class="w-full p-3 border rounded-lg" rows="3">${this.state.originalPrompt}</textarea>
                    <button id="analyze-btn" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        🔍 Analyze Variables
                    </button>
                </div>
                
                <!-- Loading State -->
                <div id="loading-state" class="hidden mb-4">
                    <div class="flex items-center text-blue-600">
                        <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Analyzing prompt variables...</span>
                    </div>
                </div>
                
                <!-- Variables Section -->
                <div id="variables-section" class="hidden mb-4">
                    <h3 class="text-lg font-medium mb-3">Rotation Variables</h3>
                    <div id="variables-container"></div>
                </div>
                
                <!-- Stats Section -->
                <div id="stats-section" class="hidden mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div class="text-2xl font-bold" id="stat-variables">0</div>
                            <div class="text-sm text-gray-600">Variables</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold" id="stat-combinations">0</div>
                            <div class="text-sm text-gray-600">Combinations</div>
                        </div>
                        <div>
                            <div class="text-2xl font-bold" id="stat-current">0</div>
                            <div class="text-sm text-gray-600">Current</div>
                        </div>
                    </div>
                </div>
                
                <!-- Output Section -->
                <div id="output-section" class="mb-4">
                    <label class="block text-sm font-medium mb-2">Current Prompt</label>
                    <div id="current-prompt" class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[60px]"></div>
                    <div class="mt-2 flex gap-2">
                        <button id="copy-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            📋 Copy
                        </button>
                        <button id="random-btn" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            🎲 Random
                        </button>
                        <button id="reset-btn" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            ↺ Reset
                        </button>
                    </div>
                </div>
                
                <!-- History Section -->
                <div id="history-section" class="hidden">
                    <h3 class="text-lg font-medium mb-2">History</h3>
                    <div id="history-list" class="space-y-2 max-h-40 overflow-y-auto"></div>
                </div>
            </div>
        `;
        
        // Attach event listeners
        this.attachEventListeners();
    }
    
    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Analyze button
        const analyzeBtn = this.container.querySelector('#analyze-btn');
        analyzeBtn.addEventListener('click', async () => {
            const prompt = this.container.querySelector('#original-prompt').value;
            await this.analyzePrompt(prompt);
        });
        
        // Copy button
        const copyBtn = this.container.querySelector('#copy-btn');
        copyBtn.addEventListener('click', () => this.copyCurrentPrompt());
        
        // Random button
        const randomBtn = this.container.querySelector('#random-btn');
        randomBtn.addEventListener('click', () => this.randomizeCombination());
        
        // Reset button
        const resetBtn = this.container.querySelector('#reset-btn');
        resetBtn.addEventListener('click', () => this.resetToOriginal());
        
        // Original prompt changes
        const originalPromptEl = this.container.querySelector('#original-prompt');
        originalPromptEl.addEventListener('input', (e) => {
            this.state.originalPrompt = e.target.value;
        });
    }
    
    /**
     * Analyze prompt for variables
     */
    async analyzePrompt(prompt) {
        if (!prompt || this.state.isAnalyzing) return;
        
        this.state.isAnalyzing = true;
        this.showLoading(true);
        
        try {
            // Call analyzer
            const result = await this.analyzer.analyze(prompt, {
                model: this.config.analysisModel
            });
            
            if (result.success) {
                this.state.variables = result.variables;
                this.onAnalysisResult(result);
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (error) {
            this.config.onError(error);
            this.showError('Failed to analyze prompt: ' + error.message);
        } finally {
            this.state.isAnalyzing = false;
            this.showLoading(false);
        }
    }
    
    /**
     * Handle analysis result
     */
    onAnalysisResult(result) {
        // Initialize engine with variables
        this.engine.initialize(result.variables);
        
        // Generate UI
        const container = this.container.querySelector('#variables-container');
        this.uiGenerator.generateUI(result.variables, container);
        
        // Show sections
        this.container.querySelector('#variables-section').classList.remove('hidden');
        if (this.config.showStats) {
            this.container.querySelector('#stats-section').classList.remove('hidden');
        }
        
        // Update display
        this.updatePromptDisplay();
        this.updateStats();
        
        // Callback
        this.config.onAnalysisComplete(result);
    }
    
    /**
     * Handle variable change from UI
     */
    handleVariableChange(data) {
        // Update engine
        this.engine.setVariableOption(data.index, 
            this.state.variables[data.index].options.indexOf(data.newValue)
        );
        
        // Update display
        this.updatePromptDisplay();
        this.updateStats();
    }
    
    /**
     * Handle custom options
     */
    handleCustomOptions(data) {
        // Add options to variable
        this.engine.addOptionsToVariable(data.index, data.options);
        
        // Update state
        this.state.variables[data.index].options.push(...data.options);
        
        // Update UI
        this.uiGenerator.updateVariables(this.state.variables);
        
        // Show success message
        this.showMessage(`Added ${data.options.length} custom options!`);
    }
    
    /**
     * Handle AI expand request
     */
    async handleAIExpand(data) {
        if (!this.config.enableAI) return;
        
        try {
            // This is where you'd integrate with your AI service
            // For now, we'll simulate it
            const expandedOptions = await this.simulateAIExpand(data.examples);
            
            // Update textarea with combined options
            const textarea = this.container.querySelector(`#custom-text-${data.index}`);
            textarea.value = [...data.examples, ...expandedOptions].join('\n');
            
            this.showMessage('AI generated additional options!');
        } catch (error) {
            this.showError('AI expansion failed: ' + error.message);
        }
    }
    
    /**
     * Update prompt display
     */
    updatePromptDisplay() {
        const engineState = this.engine.getState();
        const currentPrompt = this.replacer.replacePrompt(
            this.state.originalPrompt,
            engineState.variables
        );
        
        this.state.currentPrompt = currentPrompt;
        
        // Update display
        const promptEl = this.container.querySelector('#current-prompt');
        promptEl.textContent = currentPrompt;
        
        // Add to history
        if (this.config.enableHistory) {
            this.addToHistory(currentPrompt);
        }
        
        // Callback
        this.config.onPromptChange(currentPrompt, engineState);
    }
    
    /**
     * Update statistics display
     */
    updateStats() {
        const stats = this.engine.getStatistics();
        const state = this.engine.getState();
        
        this.container.querySelector('#stat-variables').textContent = stats.variableCount;
        this.container.querySelector('#stat-combinations').textContent = stats.totalCombinations;
        this.container.querySelector('#stat-current').textContent = state.currentCombination + 1;
    }
    
    /**
     * Engine state change handler
     */
    onEngineStateChange(state) {
        // Update navigation buttons
        const prevBtn = this.container.querySelector('#prev-combination');
        const nextBtn = this.container.querySelector('#next-combination');
        
        if (prevBtn) prevBtn.disabled = !state.hasPrevious;
        if (nextBtn) nextBtn.disabled = !state.hasNext;
        
        // Update counter
        const counter = this.container.querySelector('#combination-counter');
        if (counter) {
            counter.textContent = `${state.currentCombination + 1} / ${state.totalCombinations}`;
        }
    }
    
    /**
     * Engine navigation handler
     */
    onEngineNavigate(state, direction) {
        this.updatePromptDisplay();
        this.updateStats();
        
        // Update UI selections
        state.variables.forEach((variable, index) => {
            const select = this.container.querySelector(`select[data-variable-index="${index}"]`);
            if (select) {
                select.value = variable.selectedValue;
            }
        });
    }
    
    /**
     * Copy current prompt to clipboard
     */
    async copyCurrentPrompt() {
        try {
            await navigator.clipboard.writeText(this.state.currentPrompt);
            this.showMessage('Prompt copied to clipboard!');
        } catch (error) {
            this.showError('Failed to copy prompt');
        }
    }
    
    /**
     * Randomize combination
     */
    randomizeCombination() {
        this.engine.randomize();
        this.onEngineNavigate(this.engine.getState(), 'random');
    }
    
    /**
     * Reset to original
     */
    resetToOriginal() {
        this.engine.reset();
        this.onEngineNavigate(this.engine.getState(), 'reset');
    }
    
    /**
     * Add to history
     */
    addToHistory(prompt) {
        this.state.history.unshift({
            prompt: prompt,
            timestamp: Date.now(),
            combination: this.engine.getState().currentCombination
        });
        
        // Limit history
        if (this.state.history.length > 50) {
            this.state.history.pop();
        }
        
        // Update display
        this.updateHistoryDisplay();
    }
    
    /**
     * Update history display
     */
    updateHistoryDisplay() {
        const historyList = this.container.querySelector('#history-list');
        if (!historyList) return;
        
        historyList.innerHTML = this.state.history
            .slice(0, 10)
            .map((entry, index) => `
                <div class="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                     onclick="orchestrator.loadFromHistory(${index})">
                    <div class="truncate">${entry.prompt}</div>
                    <div class="text-xs text-gray-500">${new Date(entry.timestamp).toLocaleTimeString()}</div>
                </div>
            `).join('');
    }
    
    /**
     * Load from history
     */
    loadFromHistory(index) {
        const entry = this.state.history[index];
        if (!entry) return;
        
        this.engine.jumpTo(entry.combination);
        this.onEngineNavigate(this.engine.getState(), 'history');
    }
    
    /**
     * Show loading state
     */
    showLoading(show) {
        const loadingEl = this.container.querySelector('#loading-state');
        loadingEl.classList.toggle('hidden', !show);
    }
    
    /**
     * Show message
     */
    showMessage(message) {
        // You can implement a toast notification here
        console.log('Message:', message);
    }
    
    /**
     * Show error
     */
    showError(message) {
        // You can implement an error notification here
        console.error('Error:', message);
    }
    
    /**
     * Simulate AI expansion (replace with real implementation)
     */
    async simulateAIExpand(examples) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate some related options
        const expansions = [
            'expanded option 1',
            'expanded option 2',
            'expanded option 3'
        ];
        
        return expansions;
    }
    
    /**
     * Export current state
     */
    exportState() {
        return {
            originalPrompt: this.state.originalPrompt,
            variables: this.state.variables,
            currentCombination: this.engine.getState().currentCombination,
            history: this.state.history
        };
    }
    
    /**
     * Import state
     */
    importState(state) {
        this.state.originalPrompt = state.originalPrompt;
        this.state.variables = state.variables;
        this.state.history = state.history || [];
        
        // Reinitialize
        this.engine.initialize(state.variables);
        this.engine.jumpTo(state.currentCombination || 0);
        
        // Update UI
        this.onAnalysisResult({ variables: state.variables, success: true });
    }
    
    /**
     * Destroy and cleanup
     */
    destroy() {
        this.uiGenerator.cleanup();
        this.container.innerHTML = '';
    }
}

// Export for use
window.PromptRotationOrchestrator = PromptRotationOrchestrator;

/**
 * USAGE EXAMPLE:
 * 
 * // Create orchestrator
 * const orchestrator = new PromptRotationOrchestrator({
 *     theme: 'gradient',
 *     enableAI: true,
 *     autoAnalyze: true,
 *     showStats: true,
 *     analysisModel: 'gpt-4',
 *     onPromptChange: (prompt, state) => {
 *         console.log('New prompt:', prompt);
 *         // Send to your image generator
 *     },
 *     onAnalysisComplete: (result) => {
 *         console.log('Found variables:', result.variables);
 *     }
 * });
 * 
 * // Initialize with prompt and container
 * await orchestrator.initialize(
 *     "A dragon flying over the forest at dawn",
 *     '#prompt-rotation-container'
 * );
 * 
 * // The system is now fully operational!
 * // Users can:
 * // - Navigate through combinations
 * // - Add custom options
 * // - Use AI expansion
 * // - Copy prompts
 * // - See statistics
 * // - Access history
 * 
 * // Export/Import state
 * const state = orchestrator.exportState();
 * localStorage.setItem('promptRotation', JSON.stringify(state));
 * 
 * // Later...
 * const savedState = JSON.parse(localStorage.getItem('promptRotation'));
 * orchestrator.importState(savedState);
 */
/**
 * PROMPT ANALYZER BLOCK
 * 
 * Core engine that converts natural language prompts into structured variable arrays
 * for systematic prompt rotation and research.
 * 
 * INPUT: Text prompt + AI model selection
 * OUTPUT: Structured variables array with rotation options
 * 
 * DEPENDENCIES: Poe API access, basic alert/loading UI functions
 */

class PromptAnalyzer {
    constructor(config = {}) {
        this.config = {
            maxVariables: config.maxVariables || 7,
            optionsPerVariable: config.optionsPerVariable || 10,
            defaultModel: config.defaultModel || 'Claude-Sonnet-4',
            ...config
        };
        
        // Callbacks for UI integration
        this.onLoadingStart = config.onLoadingStart || (() => {});
        this.onLoadingEnd = config.onLoadingEnd || (() => {});
        this.onError = config.onError || ((msg) => alert(msg));
        this.onSuccess = config.onSuccess || (() => {});
        
        // Register Poe handler
        this.handlerName = `prompt-analyzer-${Date.now()}`;
        window.Poe.registerHandler(this.handlerName, (result) => this._handleResponse(result));
    }
    
    /**
     * Analyze a prompt and extract rotation variables
     * @param {string} prompt - The text prompt to analyze
     * @param {string} model - AI model to use for analysis (optional)
     * @returns {Promise<Array>} - Array of variable objects with options
     */
    async analyze(prompt, model = null) {
        if (!prompt || !prompt.trim()) {
            this.onError('Please enter a prompt to analyze.');
            return null;
        }
        
        const selectedModel = model || this.config.defaultModel;
        
        // Store for callback
        this.currentPrompt = prompt.trim();
        
        this.onLoadingStart('Analyzing prompt variables...');
        
        const analysisPrompt = this._buildAnalysisPrompt(prompt);
        
        try {
            await window.Poe.sendUserMessage(`@${selectedModel} ${analysisPrompt}`, {
                handler: this.handlerName,
                stream: false,
                openChat: false
            });
        } catch (error) {
            this.onLoadingEnd();
            this.onError('Error analyzing prompt: ' + error.message);
            return null;
        }
        
        // Return promise that resolves when analysis completes
        return new Promise((resolve, reject) => {
            this._resolvePromise = resolve;
            this._rejectPromise = reject;
        });
    }
    
    /**
     * Build the analysis prompt for the AI
     */
    _buildAnalysisPrompt(prompt) {
        return `
Analyze this prompt and identify key variables that could be rotated for systematic research: "${prompt}"

Your task:
1. Identify ${this.config.maxVariables} of the most important nouns, adjectives, locations, or concepts that could be varied
2. For each variable, generate exactly ${this.config.optionsPerVariable} diverse, relevant alternatives
3. Use the EXACT text from the original prompt as current_value for each variable

Output ONLY valid JSON in this exact format:
{
  "variables": [
    {
      "name": "variable_name",
      "current_value": "exact_text_from_original_prompt", 
      "options": ["option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8", "option9", "option10"]
    }
  ]
}

Limit to ${this.config.maxVariables} variables maximum. Each variable should have exactly ${this.config.optionsPerVariable} options.`;
    }
    
    /**
     * Handle the AI response
     */
    _handleResponse(result) {
        this.onLoadingEnd();
        
        if (result.status === "error") {
            const error = "Analysis error: " + (result.responses[0].statusText || 'Unknown error');
            this.onError(error);
            if (this._rejectPromise) this._rejectPromise(new Error(error));
            return;
        }
        
        if (result.status !== "complete") {
            return; // Still processing
        }
        
        try {
            const response = result.responses[0].content;
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                throw new Error('No JSON found in AI response');
            }
            
            const data = JSON.parse(jsonMatch[0]);
            
            if (!data.variables || !Array.isArray(data.variables)) {
                throw new Error('Invalid variables structure in response');
            }
            
            // Cap variables and validate structure
            const variables = data.variables.slice(0, this.config.maxVariables).map(v => ({
                name: v.name || 'Unknown Variable',
                current_value: v.current_value || '',
                options: Array.isArray(v.options) ? v.options.slice(0, this.config.optionsPerVariable) : []
            }));
            
            // Success callback
            this.onSuccess(variables, this.currentPrompt);
            
            // Resolve promise
            if (this._resolvePromise) {
                this._resolvePromise(variables);
            }
            
        } catch (error) {
            const errorMsg = 'Error parsing analysis results: ' + error.message;
            this.onError(errorMsg);
            if (this._rejectPromise) this._rejectPromise(new Error(errorMsg));
        }
    }
    
    /**
     * Get variable count estimate for a prompt (rough heuristic)
     */
    static estimateVariableCount(prompt) {
        const words = prompt.trim().split(/\s+/);
        const nouns = words.filter(word => 
            word.length > 3 && 
            /^[A-Z]/.test(word) || 
            /(ing|ed|er|est|ly|s)$/.test(word)
        );
        return Math.min(Math.max(Math.floor(nouns.length / 3), 3), 7);
    }
    
    /**
     * Validate if a prompt is suitable for analysis
     */
    static validatePrompt(prompt) {
        if (!prompt || typeof prompt !== 'string') return false;
        if (prompt.trim().length < 10) return false;
        if (prompt.trim().split(/\s+/).length < 3) return false;
        return true;
    }
}

// Export for use
window.PromptAnalyzer = PromptAnalyzer;

/**
 * USAGE EXAMPLE:
 * 
 * const analyzer = new PromptAnalyzer({
 *     maxVariables: 6,
 *     defaultModel: 'GPT-4o',
 *     onLoadingStart: (status) => showLoading(true, status),
 *     onLoadingEnd: () => showLoading(false),
 *     onError: (msg) => showAlert(msg),
 *     onSuccess: (variables, originalPrompt) => {
 *         console.log('Analysis complete:', variables);
 *         // Use variables to build UI, etc.
 *     }
 * });
 * 
 * // Analyze a prompt
 * const variables = await analyzer.analyze("A magical forest with glowing mushrooms at sunset");
 * 
 * // Or with custom model
 * const variables = await analyzer.analyze("Portrait of a wise old wizard", "Grok-4");
 */
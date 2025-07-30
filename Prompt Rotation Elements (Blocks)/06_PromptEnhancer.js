/**
 * PROMPT ENHANCER BLOCK
 * 
 * Advanced prompt enhancement engine that provides formatting, hi-fi enhancement,
 * and intelligent variable replacement using AI-powered optimization techniques.
 * Based on IMG-Rok enhancement patterns.
 * 
 * INPUT: Raw prompts, custom enhancement rules, AI model selection
 * OUTPUT: Formatted, enhanced, and optimized prompts ready for generation
 * 
 * DEPENDENCIES: Poe API access, basic alert/loading UI functions
 */

class PromptEnhancer {
    constructor(config = {}) {
        this.config = {
            defaultModel: config.defaultModel || 'Claude-Sonnet-4',
            maxPromptLength: config.maxPromptLength || 1200,
            enhancementTimeout: config.enhancementTimeout || 30000,
            ...config
        };
        
        // Callbacks for UI integration
        this.onLoadingStart = config.onLoadingStart || (() => {});
        this.onLoadingEnd = config.onLoadingEnd || (() => {});
        this.onError = config.onError || ((msg) => alert(msg));
        this.onSuccess = config.onSuccess || (() => {});
        
        // Register Poe handlers for different enhancement types
        this.formatHandlerName = `prompt-formatter-${Date.now()}`;
        this.hifiHandlerName = `prompt-hifi-${Date.now()}`;
        this.replaceHandlerName = `prompt-replacer-${Date.now()}`;
        
        window.Poe.registerHandler(this.formatHandlerName, (result) => this._handleFormatResponse(result));
        window.Poe.registerHandler(this.hifiHandlerName, (result) => this._handleHiFiResponse(result));
        window.Poe.registerHandler(this.replaceHandlerName, (result) => this._handleReplaceResponse(result));
        
        // Enhancement state
        this.currentEnhancement = null;
        this.enhancementQueue = [];
    }
    
    /**
     * Format prompt for basic grammar, syntax and logical consistency
     * @param {string} prompt - The prompt to format
     * @param {string} customRules - Optional custom enhancement rules
     * @param {string} model - AI model to use (optional)
     * @returns {Promise<string>} - Formatted prompt
     */
    async formatPrompt(prompt, customRules = '', model = null) {
        if (!prompt || !prompt.trim()) {
            this.onError('Please enter a prompt to format.');
            return null;
        }
        
        const selectedModel = model || this.config.defaultModel;
        
        this.currentEnhancement = 'format';
        this.onLoadingStart('Formatting prompt...');
        
        const customRulesInstruction = customRules ? `\n\nCUSTOM ENHANCEMENT RULES (HIGHEST PRIORITY): ${customRules}` : '';
        
        const formatPrompt = `Format and enhance this prompt for optimal image generation: "${prompt}"${customRulesInstruction}

CRITICAL FORMATTING REQUIREMENTS:
- Fix grammar, syntax and flow issues
- Resolve logical conflicts (e.g., character cannot have two different poses simultaneously)
- When variables create contradictions, choose the most coherent interpretation
- Ensure physical and logical possibility (one person cannot be both sitting and standing)
- Maintain readability and natural language flow
- Keep within ${this.config.maxPromptLength} characters maximum
- Preserve core intent of all elements while ensuring coherence

OUTPUT RESTRICTIONS:
- NEVER add prefixes like "Here is your prompt:" or "Enhanced prompt:"
- NEVER add suffixes like "Total characters: X" or explanations
- NEVER add quotation marks around the result
- NEVER add any metadata, instructions, or commentary
- Output ONLY the formatted prompt text, absolutely nothing else

Focus on FORMATTING and LOGICAL CONSISTENCY, not content expansion.`;

        try {
            await window.Poe.sendUserMessage(`@${selectedModel} ${formatPrompt}`, {
                handler: this.formatHandlerName,
                stream: false,
                openChat: false
            });
            
            // Return promise that resolves when formatting completes
            return new Promise((resolve, reject) => {
                this._formatResolve = resolve;
                this._formatReject = reject;
            });
            
        } catch (error) {
            this.onLoadingEnd();
            this.onError('Error formatting prompt: ' + error.message);
            return null;
        }
    }
    
    /**
     * Apply Hi-Fi enhancement for photorealistic, detailed prompts
     * @param {string} prompt - The prompt to enhance
     * @param {string} customRules - Optional custom enhancement rules
     * @param {string} model - AI model to use (optional)
     * @returns {Promise<string>} - Hi-Fi enhanced prompt
     */
    async enhanceHiFi(prompt, customRules = '', model = null) {
        if (!prompt || !prompt.trim()) {
            this.onError('Please enter a prompt to enhance.');
            return null;
        }
        
        const selectedModel = model || this.config.defaultModel;
        
        this.currentEnhancement = 'hifi';
        this.onLoadingStart('Applying Hi-Fi enhancement...');
        
        const customRulesInstruction = customRules ? `\n\nCUSTOM ENHANCEMENT RULES (HIGHEST PRIORITY): ${customRules}` : '';
        
        const hifiPrompt = `Transform this prompt into a hyper-detailed, photorealistic masterpiece: "${prompt}"${customRulesInstruction}

APPLY ADVANCED PROMPT ENGINEERING FRAMEWORK:

ATOMIC DECONSTRUCTION:
- Break down into: Subject, Action, Environment, Lighting
- Describe each component independently before interactions

SPECIFICITY OVER VAGUENESS:
- Transform subjective qualities into objective, physical descriptions
- Instead of "beautiful eyes" → "almond-shaped eyes with defined iris detail and visible limbal ring"
- Instead of "sad expression" → "slight downward turn of outer eye corners, relaxed upper eyelid"

POSE-CONSEQUENCE DYNAMICS:
- Describe underlying causes to achieve visual effects
- Instead of "sweaty skin" → "character has just completed strenuous activity, resulting in visible perspiration"
- Instead of "tense muscles" → "character is mid-exertion, causing visible muscle definition and tension"

GEOMETRIC PRECISION:
- Use anatomical landmarks and proportions
- Define facial features with surgical precision
- Specify body architecture with measurements and ratios

TECHNICAL MARKERS:
- Include photographic details: lens type, lighting setup, composition
- Add era-appropriate technical characteristics if period piece
- Specify material properties: fabric texture, surface reflectivity, wear patterns

ENVIRONMENTAL CONTEXT:
- Layer technical capture markers (how image was created)
- Add cultural/environmental markers (what content depicts)
- Ensure lighting consistency and physical plausibility

OUTPUT RESTRICTIONS:
- NEVER add prefixes like "Here is your enhanced prompt:" 
- NEVER add suffixes like "Total characters: X"
- NEVER add quotation marks or metadata
- Output ONLY the enhanced prompt text, absolutely nothing else

Transform the simple prompt into a sophisticated, technically precise description that will generate stunning photorealistic results.`;

        try {
            await window.Poe.sendUserMessage(`@${selectedModel} ${hifiPrompt}`, {
                handler: this.hifiHandlerName,
                stream: false,
                openChat: false
            });
            
            // Return promise that resolves when enhancement completes
            return new Promise((resolve, reject) => {
                this._hifiResolve = resolve;
                this._hifiReject = reject;
            });
            
        } catch (error) {
            this.onLoadingEnd();
            this.onError('Error enhancing prompt: ' + error.message);
            return null;
        }
    }
    
    /**
     * Apply variable replacements to prompt using current selections
     * @param {string} originalPrompt - The original template prompt
     * @param {Array} variables - Variables array with current selections
     * @returns {string} - Prompt with variables replaced
     */
    replaceVariables(originalPrompt, variables) {
        if (!originalPrompt || !Array.isArray(variables)) {
            return originalPrompt || '';
        }
        
        let replacedPrompt = originalPrompt;
        
        // Apply variable replacements
        variables.forEach(variable => {
            const currentValue = variable.current_value || '';
            const selectedValue = variable.selectedValue || variable.current_value || '';
            
            if (currentValue && selectedValue !== currentValue) {
                // Try multiple replacement patterns for better matching
                const patterns = [
                    new RegExp(`\\b${this._escapeRegExp(currentValue)}\\b`, 'gi'), // Word boundary match
                    new RegExp(this._escapeRegExp(currentValue), 'gi') // Exact match
                ];
                
                for (const pattern of patterns) {
                    if (pattern.test(replacedPrompt)) {
                        replacedPrompt = replacedPrompt.replace(pattern, selectedValue);
                        break; // Stop after first successful replacement
                    }
                }
            }
        });
        
        return replacedPrompt;
    }
    
    /**
     * Intelligent variable replacement using AI to ensure coherence
     * @param {string} originalPrompt - The original template prompt  
     * @param {Array} variables - Variables with selections
     * @param {string} model - AI model to use (optional)
     * @returns {Promise<string>} - Intelligently replaced prompt
     */
    async replaceVariablesIntelligent(originalPrompt, variables, model = null) {
        if (!originalPrompt || !Array.isArray(variables) || variables.length === 0) {
            return originalPrompt || '';
        }
        
        const selectedModel = model || this.config.defaultModel;
        
        this.currentEnhancement = 'replace';
        this.onLoadingStart('Applying intelligent variable replacement...');
        
        // Build replacement context
        const replacements = variables.map(v => ({
            original: v.current_value || '',
            replacement: v.selectedValue || v.current_value || '',
            variable: v.name
        })).filter(r => r.original && r.replacement && r.original !== r.replacement);
        
        if (replacements.length === 0) {
            this.onLoadingEnd();
            return originalPrompt; // No replacements needed
        }
        
        const replacementList = replacements.map(r => 
            `- Replace "${r.original}" with "${r.replacement}" (${r.variable})`
        ).join('\n');
        
        const replacePrompt = `Apply these variable replacements to create a coherent prompt: "${originalPrompt}"

REPLACEMENTS TO APPLY:
${replacementList}

INTELLIGENT REPLACEMENT RULES:
- Ensure grammatical correctness after replacements
- Maintain logical consistency and physical possibility
- Adjust surrounding context if needed for coherence
- Preserve the core intent and structure of the original prompt
- Handle pronoun references and related adjectives appropriately

OUTPUT RESTRICTIONS:
- NEVER add prefixes, suffixes, or explanations
- NEVER add quotation marks or metadata
- Output ONLY the final prompt with replacements applied
- Ensure the result reads naturally and coherently

Apply all replacements intelligently while maintaining prompt quality.`;

        try {
            await window.Poe.sendUserMessage(`@${selectedModel} ${replacePrompt}`, {
                handler: this.replaceHandlerName,
                stream: false,
                openChat: false
            });
            
            // Return promise that resolves when replacement completes
            return new Promise((resolve, reject) => {
                this._replaceResolve = resolve;
                this._replaceReject = reject;
            });
            
        } catch (error) {
            this.onLoadingEnd();
            this.onError('Error applying intelligent replacement: ' + error.message);
            return null;
        }
    }
    
    /**
     * Chain multiple enhancements together
     * @param {string} prompt - Starting prompt
     * @param {Object} options - Enhancement options
     * @returns {Promise<string>} - Final enhanced prompt
     */
    async chainEnhancements(prompt, options = {}) {
        const {
            variables = [],
            customRules = '',
            applyFormatting = true,
            applyHiFi = false,
            useIntelligentReplace = true,
            model = null
        } = options;
        
        let currentPrompt = prompt;
        
        try {
            // Step 1: Variable replacement
            if (variables.length > 0) {
                if (useIntelligentReplace) {
                    currentPrompt = await this.replaceVariablesIntelligent(currentPrompt, variables, model);
                } else {
                    currentPrompt = this.replaceVariables(currentPrompt, variables);
                }
            }
            
            // Step 2: Basic formatting
            if (applyFormatting) {
                currentPrompt = await this.formatPrompt(currentPrompt, customRules, model);
            }
            
            // Step 3: Hi-Fi enhancement (optional)
            if (applyHiFi) {
                currentPrompt = await this.enhanceHiFi(currentPrompt, customRules, model);
            }
            
            return currentPrompt;
            
        } catch (error) {
            this.onError('Error in enhancement chain: ' + error.message);
            return prompt; // Return original on error
        }
    }
    
    /**
     * Handle format response from AI
     */
    _handleFormatResponse(result) {
        this.onLoadingEnd();
        
        if (result.status === "error") {
            const error = "Formatting error: " + (result.responses[0].statusText || 'Unknown error');
            this.onError(error);
            if (this._formatReject) this._formatReject(new Error(error));
            return;
        }
        
        if (result.status !== "complete") return;
        
        const formattedText = result.responses[0].content.trim();
        this.onSuccess(formattedText, 'format');
        
        if (this._formatResolve) {
            this._formatResolve(formattedText);
        }
    }
    
    /**
     * Handle Hi-Fi enhancement response from AI
     */
    _handleHiFiResponse(result) {
        this.onLoadingEnd();
        
        if (result.status === "error") {
            const error = "Hi-Fi enhancement error: " + (result.responses[0].statusText || 'Unknown error');
            this.onError(error);
            if (this._hifiReject) this._hifiReject(new Error(error));
            return;
        }
        
        if (result.status !== "complete") return;
        
        const enhancedText = result.responses[0].content.trim();
        this.onSuccess(enhancedText, 'hifi');
        
        if (this._hifiResolve) {
            this._hifiResolve(enhancedText);
        }
    }
    
    /**
     * Handle intelligent replacement response from AI
     */
    _handleReplaceResponse(result) {
        this.onLoadingEnd();
        
        if (result.status === "error") {
            const error = "Replacement error: " + (result.responses[0].statusText || 'Unknown error');
            this.onError(error);
            if (this._replaceReject) this._replaceReject(new Error(error));
            return;
        }
        
        if (result.status !== "complete") return;
        
        const replacedText = result.responses[0].content.trim();
        this.onSuccess(replacedText, 'replace');
        
        if (this._replaceResolve) {
            this._replaceResolve(replacedText);
        }
    }
    
    /**
     * Escape special regex characters
     */
    _escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * Validate prompt length and quality
     */
    static validatePrompt(prompt) {
        if (!prompt || typeof prompt !== 'string') return { valid: false, reason: 'Invalid prompt type' };
        if (prompt.trim().length === 0) return { valid: false, reason: 'Empty prompt' };
        if (prompt.length > 2000) return { valid: false, reason: 'Prompt too long (max 2000 chars)' };
        return { valid: true };
    }
    
    /**
     * Get enhancement statistics
     */
    getStats() {
        return {
            currentEnhancement: this.currentEnhancement,
            queueLength: this.enhancementQueue.length,
            maxPromptLength: this.config.maxPromptLength,
            defaultModel: this.config.defaultModel
        };
    }
}

// Export for use
window.PromptEnhancer = PromptEnhancer;

/**
 * USAGE EXAMPLES:
 * 
 * const enhancer = new PromptEnhancer({
 *     defaultModel: 'GPT-4o',
 *     maxPromptLength: 1000,
 *     onLoadingStart: (status) => showLoading(true, status),
 *     onLoadingEnd: () => showLoading(false),
 *     onError: (msg) => showAlert(msg),
 *     onSuccess: (result, type) => {
 *         console.log(`${type} enhancement complete:`, result);
 *     }
 * });
 * 
 * // Basic formatting
 * const formatted = await enhancer.formatPrompt(
 *     "A wizard sitting and standing in forest", 
 *     "Keep lighting consistent"
 * );
 * 
 * // Hi-Fi enhancement
 * const enhanced = await enhancer.enhanceHiFi(
 *     "Portrait of a woman",
 *     "Focus on facial expressions"
 * );
 * 
 * // Variable replacement
 * const replaced = enhancer.replaceVariables(originalPrompt, variablesArray);
 * 
 * // Intelligent replacement
 * const intelligent = await enhancer.replaceVariablesIntelligent(
 *     originalPrompt, 
 *     variablesArray
 * );
 * 
 * // Chain multiple enhancements
 * const final = await enhancer.chainEnhancements("A magical forest", {
 *     variables: variablesArray,
 *     customRules: "Keep South Asian context",
 *     applyFormatting: true,
 *     applyHiFi: true,
 *     useIntelligentReplace: true
 * });
 */
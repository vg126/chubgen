/**
 * PROMPT REPLACER BLOCK
 * 
 * The text transformation engine that takes your original prompt and current variable
 * selections to produce the final rotated prompt. Handles all edge cases intelligently.
 * 
 * INPUT: Original prompt + current variable selections
 * OUTPUT: Transformed prompt with substitutions applied
 * 
 * DEPENDENCIES: None (pure text processing)
 */

class PromptReplacer {
    constructor(config = {}) {
        this.config = {
            caseInsensitive: config.caseInsensitive !== false, // Default true
            preserveCase: config.preserveCase !== false,      // Default true
            wordBoundaries: config.wordBoundaries !== false,  // Default true
            multipleReplacements: config.multipleReplacements !== false, // Default true
            ...config
        };
        
        // Replacement history for debugging/undo
        this.history = [];
        this.maxHistory = config.maxHistory || 50;
    }
    
    /**
     * Main replacement function
     * @param {string} originalPrompt - The base prompt text
     * @param {Array} variables - Array of variables with current selections
     * @returns {string} - Transformed prompt
     */
    replacePrompt(originalPrompt, variables) {
        if (!originalPrompt || !Array.isArray(variables)) {
            return originalPrompt || '';
        }
        
        let prompt = originalPrompt;
        const replacements = [];
        
        // Sort variables by length of original value (longest first)
        // This prevents partial replacements in compound words
        const sortedVariables = [...variables].sort((a, b) => {
            const lenA = (a.current_value || '').length;
            const lenB = (b.current_value || '').length;
            return lenB - lenA;
        });
        
        sortedVariables.forEach(variable => {
            const originalValue = variable.current_value;
            const newValue = variable.selectedValue || variable.current_value;
            
            if (!originalValue || originalValue === newValue) {
                return; // Skip if no change needed
            }
            
            // Perform replacement
            const result = this._replaceVariable(prompt, originalValue, newValue, variable.name);
            
            if (result.replaced) {
                prompt = result.text;
                replacements.push({
                    variable: variable.name,
                    from: originalValue,
                    to: newValue,
                    count: result.count
                });
            }
        });
        
        // Add to history
        this._addToHistory({
            original: originalPrompt,
            result: prompt,
            replacements: replacements,
            timestamp: Date.now()
        });
        
        return prompt;
    }
    
    /**
     * Replace a single variable in the text
     */
    _replaceVariable(text, originalValue, newValue, variableName) {
        let count = 0;
        let result = text;
        
        // Build regex pattern
        const pattern = this._buildPattern(originalValue);
        
        if (this.config.preserveCase) {
            // Smart case preservation
            result = text.replace(pattern, (match) => {
                count++;
                return this._preserveCase(match, newValue);
            });
        } else {
            // Simple replacement
            result = text.replace(pattern, () => {
                count++;
                return newValue;
            });
        }
        
        return {
            text: result,
            replaced: count > 0,
            count: count
        };
    }
    
    /**
     * Build regex pattern based on configuration
     */
    _buildPattern(value) {
        // Escape special regex characters
        const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        let pattern = escaped;
        
        // Add word boundaries if configured
        if (this.config.wordBoundaries) {
            // Smart word boundaries that handle punctuation
            pattern = `\\b${escaped}\\b`;
        }
        
        // Create flags
        let flags = 'g'; // Always global
        if (this.config.caseInsensitive) {
            flags += 'i';
        }
        
        try {
            return new RegExp(pattern, flags);
        } catch (e) {
            // Fallback to simple pattern if regex fails
            return new RegExp(escaped, flags);
        }
    }
    
    /**
     * Preserve case when replacing
     */
    _preserveCase(original, replacement) {
        // All caps
        if (original === original.toUpperCase()) {
            return replacement.toUpperCase();
        }
        
        // Title case
        if (original[0] === original[0].toUpperCase()) {
            return replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase();
        }
        
        // Default to replacement as-is
        return replacement;
    }
    
    /**
     * Advanced replacement with custom patterns
     * @param {string} prompt - The prompt text
     * @param {Object} replacementMap - Map of patterns to replacements
     */
    customReplace(prompt, replacementMap) {
        let result = prompt;
        
        Object.entries(replacementMap).forEach(([pattern, replacement]) => {
            try {
                const regex = new RegExp(pattern, 'g');
                result = result.replace(regex, replacement);
            } catch (e) {
                // Fallback to literal replacement
                result = result.split(pattern).join(replacement);
            }
        });
        
        return result;
    }
    
    /**
     * Replace with callback function for dynamic replacements
     */
    replaceWithCallback(prompt, variables, callback) {
        let result = prompt;
        
        variables.forEach(variable => {
            const pattern = this._buildPattern(variable.current_value);
            result = result.replace(pattern, (match, ...args) => {
                return callback(match, variable, args);
            });
        });
        
        return result;
    }
    
    /**
     * Get replacement preview without applying
     */
    previewReplacements(originalPrompt, variables) {
        const highlights = [];
        let offset = 0;
        
        variables.forEach(variable => {
            const originalValue = variable.current_value;
            const newValue = variable.selectedValue || variable.current_value;
            
            if (!originalValue || originalValue === newValue) return;
            
            const pattern = this._buildPattern(originalValue);
            let match;
            
            while ((match = pattern.exec(originalPrompt)) !== null) {
                highlights.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    original: match[0],
                    replacement: this.config.preserveCase 
                        ? this._preserveCase(match[0], newValue)
                        : newValue,
                    variable: variable.name
                });
            }
        });
        
        // Sort by position
        highlights.sort((a, b) => a.start - b.start);
        
        return highlights;
    }
    
    /**
     * Add to history
     */
    _addToHistory(entry) {
        this.history.unshift(entry);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
    }
    
    /**
     * Get replacement history
     */
    getHistory() {
        return [...this.history];
    }
    
    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
    }
    
    /**
     * Undo last replacement (if history available)
     */
    undo() {
        if (this.history.length > 0) {
            const last = this.history[0];
            return last.original;
        }
        return null;
    }
    
    /**
     * Validate that all variables can be found in prompt
     */
    validateVariables(prompt, variables) {
        const missing = [];
        const found = [];
        
        variables.forEach(variable => {
            const pattern = this._buildPattern(variable.current_value);
            if (pattern.test(prompt)) {
                found.push(variable.name);
            } else {
                missing.push({
                    name: variable.name,
                    value: variable.current_value
                });
            }
        });
        
        return {
            valid: missing.length === 0,
            found: found,
            missing: missing
        };
    }
    
    /**
     * Extract potential variables from a prompt (reverse engineering)
     */
    suggestVariables(prompt, options = {}) {
        const minLength = options.minLength || 3;
        const maxLength = options.maxLength || 30;
        const patterns = options.patterns || [
            /\b[A-Z][a-z]+\b/g,              // Capitalized words
            /\b\d+\s*(?:hours?|days?|years?)\b/gi, // Time expressions
            /\b(?:red|blue|green|yellow|purple|orange|black|white)\b/gi, // Colors
            /\b(?:small|medium|large|tiny|huge|giant)\b/gi, // Sizes
        ];
        
        const suggestions = new Set();
        
        patterns.forEach(pattern => {
            const matches = prompt.match(pattern) || [];
            matches.forEach(match => {
                if (match.length >= minLength && match.length <= maxLength) {
                    suggestions.add(match);
                }
            });
        });
        
        return Array.from(suggestions);
    }
}

// Export for use
window.PromptReplacer = PromptReplacer;

/**
 * USAGE EXAMPLE:
 * 
 * const replacer = new PromptReplacer({
 *     caseInsensitive: true,
 *     preserveCase: true,
 *     wordBoundaries: true
 * });
 * 
 * const originalPrompt = "A Dragon flying over the Forest at Dawn";
 * const variables = [
 *     { name: "creature", current_value: "Dragon", selectedValue: "Phoenix" },
 *     { name: "location", current_value: "Forest", selectedValue: "Ocean" },
 *     { name: "time", current_value: "Dawn", selectedValue: "Midnight" }
 * ];
 * 
 * const result = replacer.replacePrompt(originalPrompt, variables);
 * // "A Phoenix flying over the Ocean at Midnight"
 * 
 * // Preview without applying
 * const preview = replacer.previewReplacements(originalPrompt, variables);
 * // Shows what will be replaced and where
 * 
 * // Validate variables exist
 * const validation = replacer.validateVariables(originalPrompt, variables);
 * // { valid: true, found: ["creature", "location", "time"], missing: [] }
 */
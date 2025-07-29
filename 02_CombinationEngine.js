/**
 * COMBINATION ENGINE BLOCK
 * 
 * Mathematical engine that handles all combinations of variable options and provides
 * navigation through the possibility space. Core of the prompt rotation system.
 * 
 * INPUT: Variables array with options
 * OUTPUT: Navigation controls, combination counting, current state
 * 
 * DEPENDENCIES: None (pure math/logic)
 */

class CombinationEngine {
    constructor(config = {}) {
        this.config = {
            maxCombinations: config.maxCombinations || 10000,
            ...config
        };
        
        // State
        this.variables = [];
        this.currentCombination = 0;
        this.totalCombinations = 0;
        
        // Callbacks for UI updates
        this.onStateChange = config.onStateChange || (() => {});
        this.onNavigate = config.onNavigate || (() => {});
    }
    
    /**
     * Initialize with variables array
     * @param {Array} variables - Array of variable objects with options
     */
    initialize(variables) {
        if (!Array.isArray(variables) || variables.length === 0) {
            this.variables = [];
            this.currentCombination = 0;
            this.totalCombinations = 0;
            this._notifyStateChange();
            return;
        }
        
        this.variables = variables.map(v => ({
            ...v,
            options: Array.isArray(v.options) ? v.options : [v.current_value || '']
        }));
        
        this.currentCombination = 0;
        this._calculateCombinations();
        this._notifyStateChange();
    }
    
    /**
     * Calculate total number of combinations
     */
    _calculateCombinations() {
        if (this.variables.length === 0) {
            this.totalCombinations = 0;
            return;
        }
        
        this.totalCombinations = Math.min(
            this.variables.reduce((total, variable) => {
                const optionCount = variable.options?.length || 1;
                return total * optionCount;
            }, 1),
            this.config.maxCombinations
        );
    }
    
    /**
     * Navigate to next combination
     * @returns {boolean} - True if navigation successful
     */
    next() {
        if (this.currentCombination >= this.totalCombinations - 1) {
            return false; // Already at last combination
        }
        
        this.currentCombination++;
        this._applyCurrentCombination();
        this._notifyNavigation('next');
        return true;
    }
    
    /**
     * Navigate to previous combination
     * @returns {boolean} - True if navigation successful
     */
    previous() {
        if (this.currentCombination <= 0) {
            return false; // Already at first combination
        }
        
        this.currentCombination--;
        this._applyCurrentCombination();
        this._notifyNavigation('previous');
        return true;
    }
    
    /**
     * Jump to specific combination index
     * @param {number} index - Target combination index (0-based)
     * @returns {boolean} - True if navigation successful
     */
    jumpTo(index) {
        if (index < 0 || index >= this.totalCombinations) {
            return false;
        }
        
        this.currentCombination = index;
        this._applyCurrentCombination();
        this._notifyNavigation('jump');
        return true;
    }
    
    /**
     * Apply current combination index to variable selections
     */
    _applyCurrentCombination() {
        if (this.variables.length === 0) return;
        
        let remaining = this.currentCombination;
        
        // Convert linear index to multi-dimensional selection
        for (let i = this.variables.length - 1; i >= 0; i--) {
            const variable = this.variables[i];
            const optionCount = variable.options?.length || 1;
            const optionIndex = remaining % optionCount;
            
            // Update variable's current selection
            variable.selectedIndex = optionIndex;
            variable.selectedValue = variable.options[optionIndex];
            
            remaining = Math.floor(remaining / optionCount);
        }
    }
    
    /**
     * Set specific variable to specific option
     * @param {number} variableIndex - Index of variable to change
     * @param {number} optionIndex - Index of option to select
     */
    setVariableOption(variableIndex, optionIndex) {
        if (variableIndex < 0 || variableIndex >= this.variables.length) return false;
        
        const variable = this.variables[variableIndex];
        if (optionIndex < 0 || optionIndex >= variable.options.length) return false;
        
        // Update the variable
        variable.selectedIndex = optionIndex;
        variable.selectedValue = variable.options[optionIndex];
        
        // Calculate what combination index this represents
        this._calculateCurrentCombinationFromSelections();
        this._notifyNavigation('manual');
        return true;
    }
    
    /**
     * Calculate current combination index from individual variable selections
     */
    _calculateCurrentCombinationFromSelections() {
        let combinationIndex = 0;
        let multiplier = 1;
        
        for (let i = this.variables.length - 1; i >= 0; i--) {
            const variable = this.variables[i];
            const selectedIndex = variable.selectedIndex || 0;
            combinationIndex += selectedIndex * multiplier;
            multiplier *= variable.options?.length || 1;
        }
        
        this.currentCombination = Math.min(combinationIndex, this.totalCombinations - 1);
    }
    
    /**
     * Get current state snapshot
     */
    getState() {
        return {
            currentCombination: this.currentCombination,
            totalCombinations: this.totalCombinations,
            variables: this.variables.map(v => ({
                name: v.name,
                current_value: v.current_value,
                selectedValue: v.selectedValue || v.current_value,
                selectedIndex: v.selectedIndex || 0,
                options: [...(v.options || [])]
            })),
            hasNext: this.currentCombination < this.totalCombinations - 1,
            hasPrevious: this.currentCombination > 0,
            progress: this.totalCombinations > 0 ? (this.currentCombination + 1) / this.totalCombinations : 0
        };
    }
    
    /**
     * Get current selections as key-value pairs
     */
    getCurrentSelections() {
        return this.variables.reduce((selections, variable) => {
            selections[variable.name] = variable.selectedValue || variable.current_value;
            return selections;
        }, {});
    }
    
    /**
     * Reset to first combination (all original values)
     */
    reset() {
        this.currentCombination = 0;
        this.variables.forEach(variable => {
            variable.selectedIndex = 0;
            variable.selectedValue = variable.options?.[0] || variable.current_value;
        });
        this._notifyNavigation('reset');
    }
    
    /**
     * Add new options to a variable and recalculate
     * @param {number} variableIndex - Index of target variable
     * @param {Array} newOptions - Array of new option strings
     */
    addOptionsToVariable(variableIndex, newOptions) {
        if (variableIndex < 0 || variableIndex >= this.variables.length) return false;
        if (!Array.isArray(newOptions) || newOptions.length === 0) return false;
        
        const variable = this.variables[variableIndex];
        
        // Add new options, avoiding duplicates
        newOptions.forEach(option => {
            if (!variable.options.includes(option)) {
                variable.options.push(option);
            }
        });
        
        // Recalculate combinations
        this._calculateCombinations();
        this._notifyStateChange();
        return true;
    }
    
    /**
     * Generate random combination
     */
    randomize() {
        if (this.totalCombinations === 0) return false;
        
        const randomIndex = Math.floor(Math.random() * this.totalCombinations);
        return this.jumpTo(randomIndex);
    }
    
    /**
     * Notify state change
     */
    _notifyStateChange() {
        this.onStateChange(this.getState());
    }
    
    /**
     * Notify navigation event
     */
    _notifyNavigation(direction) {
        this.onNavigate(this.getState(), direction);
    }
    
    /**
     * Get statistics about the combination space
     */
    getStatistics() {
        return {
            variableCount: this.variables.length,
            totalCombinations: this.totalCombinations,
            averageOptionsPerVariable: this.variables.length > 0 
                ? this.variables.reduce((sum, v) => sum + (v.options?.length || 0), 0) / this.variables.length 
                : 0,
            maxCombinationsReached: this.totalCombinations >= this.config.maxCombinations,
            currentProgress: `${this.currentCombination + 1}/${this.totalCombinations}`
        };
    }
}

// Export for use
window.CombinationEngine = CombinationEngine;

/**
 * USAGE EXAMPLE:
 * 
 * const engine = new CombinationEngine({
 *     maxCombinations: 5000,
 *     onStateChange: (state) => {
 *         console.log('Total combinations:', state.totalCombinations);
 *         updateUI(state);
 *     },
 *     onNavigate: (state, direction) => {
 *         console.log('Navigated', direction, 'to combination', state.currentCombination + 1);
 *         updatePromptDisplay(state.variables);
 *     }
 * });
 * 
 * // Initialize with variables
 * engine.initialize(variablesFromAnalyzer);
 * 
 * // Navigate
 * engine.next();           // Move to next combination
 * engine.previous();       // Move to previous
 * engine.jumpTo(50);       // Jump to specific combination
 * engine.randomize();      // Random combination
 * 
 * // Manual selection
 * engine.setVariableOption(0, 3); // Set first variable to 4th option
 * 
 * // Get current state
 * const selections = engine.getCurrentSelections();
 * // { "setting": "cave", "creature": "dragon", "time": "midnight" }
 */
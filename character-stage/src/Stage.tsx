import React from 'react';
import './styles.css';

export interface StageContext {
  authToken?: string;
}

export interface StageBase {
  load?(context: StageContext): void | Promise<void>;
  beforePrompt?(message: string, context: StageContext): Promise<string | void>;
  afterResponse?(message: string, context: StageContext): void | Promise<void>;
  render(): React.ReactNode;
}

function CharacterCreator() {
  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2>Character Creator</h2>
        <p className="stage-subtitle">Create AI characters directly in chat</p>
      </div>
      
      <form className="character-form">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Character Name *</label>
          <input
            id="name"
            name="name"
            className="form-control"
            placeholder="Enter character name"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="definition">Character Definition *</label>
          <textarea
            id="definition"
            name="definition"
            className="form-control character-definition"
            placeholder="Describe your character's personality, background, and behavior..."
            rows={6}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn--primary btn--full-width">
            Create Character
          </button>
        </div>
      </form>
    </div>
  );
}

export const Stage: StageBase = {
  load(context: StageContext) {
    console.log('Stage loaded', context);
  },

  render() {
    return <CharacterCreator />;
  }
};

export default Stage;
import React, { useState } from 'react';
import './styles.css';

// Minimal Chub.AI Stage interfaces (extracted from @chub-ai/stages-ts)
interface Message {
  content: string;
  anonymizedId: string; 
  isBot: boolean;
}

interface InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType> {
  characters: { [key: string]: any };
  users: { [key: string]: any };
  config: ConfigType;
  messageState: MessageStateType | null;
  environment: string;
  initState: InitStateType | null;
  chatState: ChatStateType | null;
}

interface LoadResponse<InitStateType, ChatStateType, MessageStateType> {
  success: boolean;
  error: string | null;
  initState: InitStateType | null;
  chatState: ChatStateType | null;
}

interface StageResponse<ChatStateType, MessageStateType> {
  stageDirections: string | null;
  messageState: MessageStateType | null;
  modifiedMessage: string | null;
  systemMessage: string | null;
  error: string | null;
  chatState: ChatStateType | null;
}

abstract class StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {
  constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {}
  
  abstract load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>>;
  abstract setState(state: MessageStateType): Promise<void>;
  abstract beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>>;
  abstract afterResponse(botMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>>;
  abstract render(): React.ReactElement;
}

interface CharacterData {
  name: string;
  definition: string;
  tagline?: string;
  tags?: string[];
  personality?: string;
  scenario?: string;
  greeting?: string;
}

// Character creation utilities
function generateCharacterPrompt(character: CharacterData): string {
  const parts = [];
  
  if (character.name) {
    parts.push(`Character Name: ${character.name}`);
  }
  
  if (character.personality) {
    parts.push(`Personality: ${character.personality}`);
  }
  
  if (character.scenario) {
    parts.push(`Scenario: ${character.scenario}`);
  }
  
  if (character.definition) {
    parts.push(`Character Description: ${character.definition}`);
  }
  
  return parts.join('\n');
}

function exportCharacterData(character: CharacterData): string {
  const exportData = {
    name: character.name,
    tagline: character.tagline || '',
    definition: character.definition,
    greeting: character.greeting || `Hello! I'm ${character.name}.`,
    tags: character.tags || [],
    personality: character.personality || '',
    scenario: character.scenario || '',
    created_by_stage: 'ChubGen Character Creator',
    creation_date: new Date().toISOString()
  };
  
  return JSON.stringify(exportData, null, 2);
}

// State types for the Stage
type MessageStateType = {
  activeCharacter?: CharacterData;
  characterLibrary: CharacterData[];
};

type ConfigType = {
  theme?: 'light' | 'dark';
  autoApply?: boolean;
};

type InitStateType = {};

type ChatStateType = {
  appliedCharacters: string[];
};

export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {
  private characterLibrary: CharacterData[] = [];
  private activeCharacter: CharacterData | null = null;

  constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
    super(data);
    
    const { messageState, chatState, config } = data;
    
    // Initialize character library from message state
    if (messageState?.characterLibrary) {
      this.characterLibrary = messageState.characterLibrary;
    }
    
    if (messageState?.activeCharacter) {
      this.activeCharacter = messageState.activeCharacter;
    }
  }

  async load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>> {
    return {
      success: true,
      error: null,
      initState: null,
      chatState: null,
    };
  }

  async setState(state: MessageStateType): Promise<void> {
    if (state?.characterLibrary) {
      this.characterLibrary = state.characterLibrary;
    }
    if (state?.activeCharacter) {
      this.activeCharacter = state.activeCharacter;
    }
  }

  async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
    // If there's an active character, inject their context into the prompt
    if (this.activeCharacter) {
      const characterContext = generateCharacterPrompt(this.activeCharacter);
      const stageDirections = `\n\n[Character Context for this conversation:\n${characterContext}]\n`;
      
      return {
        stageDirections,
        messageState: {
          activeCharacter: this.activeCharacter,
          characterLibrary: this.characterLibrary
        },
        modifiedMessage: null,
        systemMessage: null,
        error: null,
        chatState: null,
      };
    }
    
    return {
      stageDirections: null,
      messageState: {
        activeCharacter: this.activeCharacter,
        characterLibrary: this.characterLibrary
      },
      modifiedMessage: null,
      systemMessage: null,
      error: null,
      chatState: null,
    };
  }

  async afterResponse(botMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
    return {
      stageDirections: null,
      messageState: {
        activeCharacter: this.activeCharacter,
        characterLibrary: this.characterLibrary
      },
      modifiedMessage: null,
      systemMessage: null,
      error: null,
      chatState: null,
    };
  }

  private addCharacterToLibrary = (character: CharacterData) => {
    this.characterLibrary = [...this.characterLibrary, character];
  };

  private setActiveCharacter = (character: CharacterData | null) => {
    this.activeCharacter = character;
  };

  private exportCharacter = (character: CharacterData) => {
    const exportData = exportCharacterData(character);
    
    // Create download
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name.replace(/[^\w-]/g, '_')}_character.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    return (
      <CharacterCreatorStage
        characterLibrary={this.characterLibrary}
        activeCharacter={this.activeCharacter}
        onAddCharacter={this.addCharacterToLibrary}
        onSetActiveCharacter={this.setActiveCharacter}
        onExportCharacter={this.exportCharacter}
      />
    );
  }
}

// React component for the Stage UI
interface CharacterCreatorStageProps {
  characterLibrary: CharacterData[];
  activeCharacter: CharacterData | null;
  onAddCharacter: (character: CharacterData) => void;
  onSetActiveCharacter: (character: CharacterData | null) => void;
  onExportCharacter: (character: CharacterData) => void;
}

function CharacterCreatorStage({
  characterLibrary,
  activeCharacter,
  onAddCharacter,
  onSetActiveCharacter,
  onExportCharacter
}: CharacterCreatorStageProps) {
  const [formData, setFormData] = useState<Partial<CharacterData>>({
    name: '',
    definition: '',
    tagline: '',
    personality: '',
    scenario: '',
    greeting: '',
    tags: []
  });
  
  const [showLibrary, setShowLibrary] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Character name is required');
      return;
    }
    
    if (!formData.definition?.trim()) {
      setError('Character definition is required');
      return;
    }
    
    if (formData.definition.length < 50) {
      setError('Character definition must be at least 50 characters');
      return;
    }

    const character: CharacterData = {
      name: formData.name.trim(),
      definition: formData.definition.trim(),
      tagline: formData.tagline?.trim() || '',
      personality: formData.personality?.trim() || '',
      scenario: formData.scenario?.trim() || '',
      greeting: formData.greeting?.trim() || `Hello! I'm ${formData.name}.`,
      tags: formData.tags || []
    };
    
    onAddCharacter(character);
    setSuccess(`Character "${character.name}" created and added to library!`);
    
    // Reset form
    setFormData({
      name: '',
      definition: '',
      tagline: '',
      personality: '',
      scenario: '',
      greeting: '',
      tags: []
    });
  };

  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2>Character Creator</h2>
        <p className="stage-subtitle">Create characters and inject them into chat context</p>
        
        <div className="stage-nav">
          <button 
            className={`btn ${!showLibrary ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setShowLibrary(false)}
          >
            Create
          </button>
          <button 
            className={`btn ${showLibrary ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setShowLibrary(true)}
          >
            Library ({characterLibrary.length})
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {!showLibrary ? (
        <form className="character-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Character Name *</label>
            <input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter character name"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="tagline">Tagline</label>
            <input
              id="tagline"
              name="tagline"
              value={formData.tagline || ''}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Brief character description"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="personality">Personality</label>
            <textarea
              id="personality"
              name="personality"
              value={formData.personality || ''}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Character's personality traits..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="scenario">Scenario</label>
            <textarea
              id="scenario"
              name="scenario"
              value={formData.scenario || ''}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Setting or scenario context..."
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="definition">Character Definition *</label>
            <textarea
              id="definition"
              name="definition"
              value={formData.definition || ''}
              onChange={handleInputChange}
              className="form-control character-definition"
              placeholder="Detailed character description, background, and behavior... (minimum 50 characters)"
              rows={6}
              required
            />
            <small className="form-hint">
              {(formData.definition || '').length}/50 minimum characters
            </small>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="greeting">Greeting Message</label>
            <textarea
              id="greeting"
              name="greeting"
              value={formData.greeting || ''}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Character's initial greeting..."
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              name="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              className="form-control"
              placeholder="fantasy, warrior, helpful"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn--primary btn--full-width">
              Add to Library
            </button>
          </div>
        </form>
      ) : (
        <div className="character-library">
          {activeCharacter && (
            <div className="active-character">
              <h3>Active Character</h3>
              <div className="character-card active">
                <h4>{activeCharacter.name}</h4>
                <p>{activeCharacter.tagline}</p>
                <div className="character-actions">
                  <button 
                    className="btn btn--secondary"
                    onClick={() => onSetActiveCharacter(null)}
                  >
                    Deactivate
                  </button>
                  <button 
                    className="btn btn--secondary"
                    onClick={() => onExportCharacter(activeCharacter)}
                  >
                    Export JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          <h3>Character Library</h3>
          {characterLibrary.length === 0 ? (
            <p className="empty-library">No characters created yet. Switch to Create tab to add some!</p>
          ) : (
            <div className="character-grid">
              {characterLibrary.map((character, index) => (
                <div key={index} className={`character-card ${activeCharacter?.name === character.name ? 'active' : ''}`}>
                  <h4>{character.name}</h4>
                  <p>{character.tagline}</p>
                  {character.tags && character.tags.length > 0 && (
                    <div className="character-tags">
                      {character.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="character-actions">
                    <button 
                      className="btn btn--primary"
                      onClick={() => onSetActiveCharacter(character)}
                      disabled={activeCharacter?.name === character.name}
                    >
                      {activeCharacter?.name === character.name ? 'Active' : 'Activate'}
                    </button>
                    <button 
                      className="btn btn--secondary"
                      onClick={() => onExportCharacter(character)}
                    >
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Stage;
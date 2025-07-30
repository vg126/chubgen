import React, { useState } from 'react';
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

interface CharacterData {
  name: string;
  definition: string;
  tagline?: string;
  avatar_url?: string;
  tags?: string[];
  public?: boolean;
}

let stageContext: StageContext | null = null;

// API function to create character using Chub.AI endpoint
async function createCharacter(characterData: CharacterData): Promise<any> {
  const authToken = stageContext?.authToken;
  
  if (!authToken) {
    throw new Error('Authentication token not available');
  }
  
  const payload = {
    name: characterData.name,
    definition: characterData.definition,
    tagline: characterData.tagline || '',
    avatar_url: characterData.avatar_url || '',
    tags: characterData.tags || [],
    public: characterData.public || false,
    node: 'chub'
  };
  
  const response = await fetch('https://api.chub.ai/v1/characters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CH-API-KEY': authToken
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }
  
  return await response.json();
}

function CharacterCreator() {
  const [formData, setFormData] = useState({
    name: '',
    definition: '',
    tagline: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Character name is required');
      return;
    }
    
    if (!formData.definition.trim()) {
      setError('Character definition is required');
      return;
    }
    
    if (formData.definition.length < 50) {
      setError('Character definition must be at least 50 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const characterData: CharacterData = {
        name: formData.name.trim(),
        definition: formData.definition.trim(),
        tagline: formData.tagline.trim(),
        public: false // Keep private by default
      };
      
      const result = await createCharacter(characterData);
      
      setSuccess(`Character "${formData.name}" created successfully! Character ID: ${result.id}`);
      
      // Reset form
      setFormData({
        name: '',
        definition: '',
        tagline: ''
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2>Character Creator</h2>
        <p className="stage-subtitle">Create AI characters directly in chat</p>
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
      
      <form className="character-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Character Name *</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-control"
            placeholder="Enter character name"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="tagline">Tagline (Optional)</label>
          <input
            id="tagline"
            name="tagline"
            value={formData.tagline}
            onChange={handleInputChange}
            className="form-control"
            placeholder="Brief character description"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="definition">Character Definition *</label>
          <textarea
            id="definition"
            name="definition"
            value={formData.definition}
            onChange={handleInputChange}
            className="form-control character-definition"
            placeholder="Describe your character's personality, background, and behavior... (minimum 50 characters)"
            rows={6}
            required
            disabled={loading}
          />
          <small className="form-hint">
            {formData.definition.length}/50 minimum characters
          </small>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn--primary btn--full-width"
            disabled={loading}
          >
            {loading ? 'Creating Character...' : 'Create Character'}
          </button>
        </div>
      </form>
    </div>
  );
}

export const Stage: StageBase = {
  load(context: StageContext) {
    console.log('Stage loaded', context);
    stageContext = context; // Store context for API access
  },

  render() {
    return <CharacterCreator />;
  }
};

export default Stage;
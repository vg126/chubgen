import React, { useState } from 'react';
import type { ReactElement } from 'react';
import type { Stage } from '../Stage';
import '../Stage.css';

export interface FormValues {
  name: string;
  tagline: string;
  avatarUrl: string;
  tags: string;
  definition: string;
}

export function CharacterCreatorStage({ stage }: { stage: Stage }): ReactElement {
  const [values, setValues] = useState<FormValues>({ name: '', tagline: '', avatarUrl: '', tags: '', definition: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const validate = (field?: keyof FormValues): Partial<Record<keyof FormValues, string>> => {
    const v = { ...values };
    const errs: Partial<Record<keyof FormValues, string>> = {};
    const checkField = (f: keyof FormValues) => !field || field === f;
    if (checkField('name')) {
      if (!v.name.trim()) errs.name = 'Character name is required';
      else if (v.name.length > 100) errs.name = 'Character name must be less than 100 characters';
    }
    if (checkField('tags')) {
      if (v.tags) {
        const arr = v.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (arr.length > 10) errs.tags = 'Maximum 10 tags allowed';
        arr.forEach(t => { if (t.length > 30) errs.tags = 'Each tag must be less than 30 characters'; });
      }
    }
    if (checkField('definition')) {
      if (!v.definition.trim()) errs.definition = 'Character definition is required';
      else if (v.definition.length < 50) errs.definition = 'Character definition must be at least 50 characters';
      else if (v.definition.length > 5000) errs.definition = 'Character definition must be less than 5000 characters';
    }
    if (checkField('avatarUrl')) {
      if (v.avatarUrl) {
        try { new URL(v.avatarUrl); } catch { errs.avatarUrl = 'Please enter a valid URL'; }
      }
    }
    return errs;
  };

  const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleBlur = (field: keyof FormValues) => () => {
    const errs = validate(field);
    setErrors(prev => ({ ...prev, ...errs }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const token = stage.authToken;
    if (!token) { setStatus('Authentication required'); return; }
    setLoading(true);
    setStatus(null);
    try {
      await stage.createCharacter(values, token);
      setStatus('Character created successfully');
      setValues({ name: '', tagline: '', avatarUrl: '', tags: '', definition: '' });
    } catch (err: any) {
      setStatus(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="stage-container">
      <div className="stage-header">
        <h2>Character Creator</h2>
        <p className="stage-subtitle">Create AI characters directly in chat</p>
      </div>
      {status && <div className="status-message info">{status}</div>}
      <form className="character-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Character Name *</label>
          <input id="name" className={`form-control${errors.name ? ' error' : ''}`} value={values.name} onChange={handleChange('name')} onBlur={handleBlur('name')} />
          {errors.name && <div className="error-message show">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="tagline" className="form-label">Tagline</label>
          <input id="tagline" className="form-control" value={values.tagline} onChange={handleChange('tagline')} />
        </div>
        <div className="form-group">
          <label htmlFor="avatar-url" className="form-label">Avatar URL</label>
          <input id="avatar-url" className={`form-control${errors.avatarUrl ? ' error' : ''}`} value={values.avatarUrl} onChange={handleChange('avatarUrl')} onBlur={handleBlur('avatarUrl')} />
          {errors.avatarUrl && <div className="error-message show">{errors.avatarUrl}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="tags" className="form-label">Tags</label>
          <input id="tags" className={`form-control${errors.tags ? ' error' : ''}`} value={values.tags} onChange={handleChange('tags')} onBlur={handleBlur('tags')} />
          {errors.tags && <div className="error-message show">{errors.tags}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="definition" className="form-label">Character Definition *</label>
          <textarea id="definition" className={`form-control character-definition${errors.definition ? ' error' : ''}`} value={values.definition} onChange={handleChange('definition')} onBlur={handleBlur('definition')} rows={6} />
          {errors.definition && <div className="error-message show">{errors.definition}</div>}
        </div>
        <div className="form-actions">
          <button type="submit" id="create-button" className="btn btn--primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Character'}
          </button>
        </div>
      </form>
    </div>
  );
}

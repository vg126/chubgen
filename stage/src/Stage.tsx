import type { ReactElement } from 'react';
import { StageBase, StageResponse, InitialData, Message } from '@chub-ai/stages-ts';
import { LoadResponse } from '@chub-ai/stages-ts/dist/types/load';
import { CharacterCreatorStage } from './components';
import type { FormValues } from './components';

export class Stage extends StageBase<any, any, any, any> {
  authToken: string;
  constructor(data: InitialData<any, any, any, any>) {
    super(data);
    this.authToken = (data as any).authToken || '';
  }

  async load(): Promise<Partial<LoadResponse<any, any, any>>> {
    return { success: true };
  }

  async setState(_state: any): Promise<void> {
    // no-op for this simple stage
  }

  async beforePrompt(_msg: Message): Promise<Partial<StageResponse<any, any>>> {
    return {};
  }

  async afterResponse(_msg: Message): Promise<Partial<StageResponse<any, any>>> {
    return {};
  }

  async createCharacter(values: FormValues, token: string): Promise<string> {
    const payload = {
      name: values.name,
      tagline: values.tagline,
      avatar_url: values.avatarUrl,
      tags: values.tags.split(',').map(t => t.trim()).filter(Boolean),
      definition: values.definition
    };

    const res = await fetch('https://api.chub.ai/v1/characters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Character creation failed');
    }
    const data = await res.json();
    return data.id || data.character_id || '';
  }

  render(): ReactElement {
    return <CharacterCreatorStage stage={this} />;
  }
}

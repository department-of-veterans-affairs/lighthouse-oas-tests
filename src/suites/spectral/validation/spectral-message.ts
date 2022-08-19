import { Severity, MessageTemplate, Message } from '../../../validation';

export enum Type {
  GenericSpectralWarning,
  GenericSpectralError,
}

const messageTemplates: Record<Type, MessageTemplate> = {
  [Type.GenericSpectralWarning]: {
    severity: Severity.WARNING,
    details: 'Warning: Spectral warning...',
  },
  [Type.GenericSpectralError]: {
    severity: Severity.ERROR,
    details: 'Spectral error...',
  },
};

class SpectralMessage extends Message {
  constructor(type: unknown, path: string[], _properties?: string[]) {
    super(type, path, _properties);

    this.template = messageTemplates[type as Type];

    this.message = this.resolveMessage(_properties);
    this._hash = this.generateHash();
  }
}

export default SpectralMessage;

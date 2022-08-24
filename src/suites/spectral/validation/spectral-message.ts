import { Severity, MessageTemplate, Message } from '../../../validation';

export enum Type {
  SpectralWarning,
  SpectralError,
}

//  For Spectral the templates are based on the originally provided message given from the tool
const messageTemplates: Record<Type, MessageTemplate> = {
  [Type.SpectralWarning]: {
    severity: Severity.WARNING,
    details: '{0}',
  },
  [Type.SpectralError]: {
    severity: Severity.ERROR,
    details: '{0}',
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

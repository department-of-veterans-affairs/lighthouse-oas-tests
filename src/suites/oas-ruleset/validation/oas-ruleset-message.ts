import { Severity, MessageTemplate, Message } from '../../../validation';

export enum Type {
  OasRulesetWarning,
  OasRulesetError,
}

//  For Spectral the templates are based on the originally provided message given from the tool
const messageTemplates: Record<Type, MessageTemplate> = {
  [Type.OasRulesetWarning]: {
    severity: Severity.WARNING,
    details: '{0}',
  },
  [Type.OasRulesetError]: {
    severity: Severity.ERROR,
    details: '{0}',
  },
};

class OasRulesetMessage extends Message {
  constructor(type: unknown, path: string[], _properties?: string[]) {
    super(type, path, _properties);

    this.template = messageTemplates[type as Type];

    this.message = this.resolveMessage(_properties);
    this._hash = this.generateHash();
  }
}

export default OasRulesetMessage;

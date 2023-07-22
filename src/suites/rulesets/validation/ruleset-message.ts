import { Severity, MessageTemplate, Message } from '../../../validation';

export enum Type {
  RulesetWarning,
  RulesetError,
}

//  For Spectral the templates are based on the originally provided message given from the tool
const messageTemplates: Record<Type, MessageTemplate> = {
  [Type.RulesetWarning]: {
    severity: Severity.WARNING,
    details: '{0}',
  },
  [Type.RulesetError]: {
    severity: Severity.ERROR,
    details: '{0}',
  },
};

class RulesetMessage extends Message {
  constructor(type: Type, path: string[], _properties?: string[]) {
    super(type, path, _properties);

    this.template = messageTemplates[type];

    this.message = this.resolveMessage(_properties);
    this._hash = this.generateHash();
  }
}

export default RulesetMessage;

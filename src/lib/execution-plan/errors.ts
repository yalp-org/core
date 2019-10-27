export class UnknownExecutionPlanFormatError extends Error {
  constructor(extension) {
    super(`Provided extension (${extension}) is not supported. Supported formats: .yml|.yaml`);
  }
}

export class InvalidYamlError extends Error {
  public yamlParseError = null;

  constructor(yamlParseError: Error) {
    super();
    this.yamlParseError = yamlParseError;
  }
}

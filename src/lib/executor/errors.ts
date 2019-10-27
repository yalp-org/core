export class ProcedureNotImplementedError extends Error {
  constructor(name) {
    super(`Procedure ${name} not implemented`);
  }
}

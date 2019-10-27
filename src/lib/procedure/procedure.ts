import { ExecutionContext } from '../executor/executor';

export type SimpleProcedureConfig = string;

export interface ComplexProcedureConfig {
  name: string;
  params: any;
}

export type ProcedureConfig = SimpleProcedureConfig | ComplexProcedureConfig;

export interface Procedure {
  name: string;
  params?: object;
  procedureFunction: ProcedureFunction;
}

export type ProcedureFunction = (
  params: ProcedureFunctionParams,
) => Promise<any>;

export interface ProcedureFunctionParams {
  executionContext: Readonly<ExecutionContext>;
  originalParams: Readonly<object>;
  currentParams: object;
}

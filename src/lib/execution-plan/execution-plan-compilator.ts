import path from 'path';
import { Procedure } from '../procedure';
import {
  ExecutionPhase,
  ExecutionPlan,
  RawExecutionPlan,
} from './execution-plan';

export function compile(rawExecutionPlan: RawExecutionPlan): ExecutionPlan {
  const executionPhases = <ExecutionPhase[]>rawExecutionPlan.execute.map(
    phase => {
      const directories = phase.directories.map(resolveDir);
      const procedures = <Procedure[]>phase.procedures.map(compileProcedure);

      return {
        directories,
        procedures,
      };
    },
  );

  return {
    execute: executionPhases,
    version: rawExecutionPlan.version,
  };
}

export function resolveDir(directory) {
  return path.join(process.cwd(), directory);
}

export function compileProcedure(procedure): Procedure {
  if (typeof procedure === 'string') {
    return {
      name: procedure,
      params: {},
      procedureFunction: resolveProcedureFunction(procedure),
    };
  }

  const [procedureName] = Object.keys(procedure);

  return {
    name: procedureName,
    params: procedure[procedureName].params,
    procedureFunction: resolveProcedureFunction(procedure.name),
  };
}

function resolveProcedureFunction(name) {
  return async () => {
    console.log('placeholder', name);
  };
}

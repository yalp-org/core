import path from 'path';
import { Procedure } from '../procedure';
import {
  ExecutionPhase,
  ExecutionPlan,
  RawExecutionPlan,
} from './execution-plan';

import buildInProcedures from '@yalp/procedures';

export async function compile(rawExecutionPlan: RawExecutionPlan): Promise<ExecutionPlan> {
  const executionPhases = await Promise.all( rawExecutionPlan.execute.map(
    async (phase) => {
      const directories = phase.directories.map(resolveDir);
      const procedures = await Promise.all(phase.procedures.map(compileProcedure));

      return {
        directories,
        procedures,
      };
    },
  ));

  return {
    execute: await Promise.all(executionPhases),
    version: rawExecutionPlan.version,
  };
}

export function resolveDir(directory) {
  return path.join(process.cwd(), directory);
}

export async function compileProcedure(procedure): Promise<Procedure> {
  if (typeof procedure === 'string') {
    return resolveProcedure(procedure);
  }

  const [procedureName] = Object.keys(procedure);

  return resolveProcedure(procedureName, procedure[procedureName]);
}

export async function resolveProcedure(
  name: string,
  params: object = null,
): Promise<Procedure> {
  if (buildInProcedures[name]) {
    return {
      name,
      params,
      procedureFunction: buildInProcedures[name].procedureFunction,
    };
  }

  let procedureFunction;

  try {
    const { default: procedure } = await import(name);
    procedureFunction = procedure.procedureFunction;
    /*tslint:disable-next-line:no-empty*/
  } catch {}

  return {
    name,
    params,
    procedureFunction,
  };
}

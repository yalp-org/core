import {
  compileExecutionPlan,
  ExecutionPlan,
  RawExecutionPlan,
} from '../execution-plan';

import { ProcedureFunctionParams, Procedure } from '../procedure';

import { ProcedureNotImplementedError } from './errors';

export enum ExecutionStrategy {
  Write,
  DryRun,
}

export interface ExecutionContext {
  path: string;
}

export const createExecutor = (
  planPath: string,
  executionStrategy: ExecutionStrategy,
) => async () => {
  const plan: ExecutionPlan = await compileExecutionPlan({ path: planPath });

  return execute({
    plan,
    strategy: executionStrategy,
  });
};

export interface ExecutorParams {
  plan: ExecutionPlan;
  strategy: ExecutionStrategy;
}

let sampleplan = {
  version: '0.0.1',
  execute: [
    {
      directories: ['test-a', 'test-b'],
      procedures: [
        'git-status',
        { 'change-dependency': { from: 'adep', to: 'bdep' } },
      ],
    },
    {
      directories: ['mocks'],
      procedures: [{ 'exec-command': { command: 'cat ${path}/foo.txt' } }],
    },
  ],
};

const execute = async (params: ExecutorParams): Promise<void> => {
  const {
    strategy,
    plan: { execute: executionPhases },
  } = params;

  for (const phase of executionPhases) {
    const { directories, procedures } = phase;

    for (const dir of directories) {
      const allParams: ProcedureFunctionParams = {
        currentParams: {},
        executionContext: Object.freeze({ path: dir }),
        originalParams: {},
      };

      for (let i = 0; i < procedures.length; i++) {
        const procedure = procedures[i];
        const { params: procedureParams, name, procedureFunction } = procedure;

        try {
          console.log(`${i}) ${name} ===================================`);
          console.group();

          if (!procedureFunction) {
            throw new ProcedureNotImplementedError(name);
          }

          allParams.originalParams = Object.freeze({ ...procedureParams });

          if (strategy === ExecutionStrategy.Write) {
            const currentParams = await procedure.procedureFunction(allParams);

            if (currentParams) {
              allParams.currentParams = {
                ...procedureParams,
                ...currentParams,
              };
            }
          } else {
            console.log('dry run with params', allParams);
          }

          console.groupEnd();
          console.log('  status: SUCCESS');
        } catch (e) {
          console.error('  status: ERROR');
          console.error(e);
        } finally {
          console.groupEnd();
        }
      }
    }
  }
};

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { ProcedureConfig, Procedure } from '../procedure';
import { UnknownExecutionPlanFormatError, InvalidYamlError } from './errors';
import { promisify } from 'util';

import {compile} from './execution-plan-compilator'

const readFile = promisify(fs.readFile);

export interface RawExecutionPhase {
  directories: string[];
  procedures: ProcedureConfig[];
}

export interface RawExecutionPlan {
  version: string;
  execute: RawExecutionPhase[];
}

export interface ExecutionPhase {
  directories: string[];
  procedures: Procedure[];
}

export interface ExecutionPlan {
  version: string;
  execute: ExecutionPhase[];
}

export async function readYaml(yamlFile: string): Promise<RawExecutionPlan> {
  try {
    const yamlContent = await readFile(yamlFile, 'utf8');
    return yaml.safeLoad(yamlContent);
  } catch (e) {
    throw new InvalidYamlError(e);
  }
}

export interface PlanCompilatorParams {
  path: string;
}

export async function compileExecutionPlan(
  params: PlanCompilatorParams,
): Promise<ExecutionPlan> {
  const { path: planPath } = params;
  const extension = path.extname(planPath);

  switch (extension) {
    case '.yml':
    case '.yaml':
      return compileFromYaml(params);

    default:
      throw new UnknownExecutionPlanFormatError(extension);
  }
}

export async function compileFromYaml(
  params: PlanCompilatorParams,
): Promise<ExecutionPlan> {
  const content = <RawExecutionPlan>await readYaml(params.path);
  return compile(content);
}

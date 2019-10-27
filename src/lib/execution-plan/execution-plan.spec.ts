import path from 'path';
import { InvalidYamlError } from './errors';
import { RawExecutionPlan, readYaml } from './execution-plan';

jest.mock('fs', () => ({
  readFile: readFileMock
}))

describe('execution plan logic', () => {
  describe('readYaml', () => {
    it('should throw when yaml file is invalid', async () => {
      const invalidPlanPath = path.resolve(
        __dirname,
        'broken.yml',
      );

      await expect(readYaml(invalidPlanPath)).rejects.toEqual(
        new InvalidYamlError(new Error()),
      );
    });

    it('should return object if yaml is valid', async () => {
      const validPlanPath = path.resolve(__dirname, 'correct.yml');
      const plan: RawExecutionPlan = await readYaml(validPlanPath);

      expect(plan.version).toEqual('0.0.3');
    });
  });
});


function readFileMock (file, opts, cb) {
  if (file.includes('correct.yml')) {
    return cb(null, `version: 0.0.3
execute:
  - withRoot: .
  - procedures:
      - a
      - b
`);
  } else if (file.includes('broken.yml')) {
    return cb(`version @! 1.0.0I am invalid
        - file
        broken`);
  }

  return cb(new Error('file not found'));
};

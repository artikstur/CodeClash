import type {TestCase} from "../core/TestCase.ts";

export interface SolutionResult {
  testCase: TestCase;
  solution: {
    outPut: string | null;
    solutionStatus: number;
    testDate: string;
    id: number;
  };
}

export interface SolutionStatusResponse {
  status: number;
  data?: SolutionResult[];
}
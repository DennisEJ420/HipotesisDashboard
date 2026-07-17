import {
  generateApiAResponse,
  generateApiBResponse
} from './simulation.service';

export function collectApiASamples(
  amount: number,
  mean?: number,
  variation?: number
): number[] {
  const samples: number[] = [];
  for (let i = 0; i < amount; i++) {
    samples.push(generateApiAResponse(mean, variation));
  }
  return samples;
}

export function collectApiBSamples(
  amount: number,
  mean?: number,
  variation?: number
): number[] {
  const samples: number[] = [];
  for (let i = 0; i < amount; i++) {
    samples.push(generateApiBResponse(mean, variation));
  }
  return samples;
}
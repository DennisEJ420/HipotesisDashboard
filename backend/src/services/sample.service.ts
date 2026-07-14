import {
    generateApiAResponse,
    generateApiBResponse
} from './simulation.service';


export function collectApiASamples(amount: number): number[] {

    const samples: number[] = [];

    for (let i = 0; i < amount; i++) {
        samples.push(generateApiAResponse());
    }

    return samples;
}


export function collectApiBSamples(amount: number): number[] {

    const samples: number[] = [];

    for (let i = 0; i < amount; i++) {
        samples.push(generateApiBResponse());
    }

    return samples;
}
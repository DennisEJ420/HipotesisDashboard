import { runTwoSampleTest } from './two-sample';
import { collectApiASamples, collectApiBSamples } from '../services/sample.service';

// Generamos 30 muestras dinámicas
const apiA = collectApiASamples(50); 
const apiB = collectApiBSamples(50);

const result = runTwoSampleTest(
    apiA,
    apiB,
    0.05
);

console.log(
    JSON.stringify(
        result,
        null,
        2
    )
);
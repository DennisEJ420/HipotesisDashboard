import { runOneSampleTest } from './one-sample';


const apiData = [

193,216,184,181,183,
185,202,202,182,194,
207,213,203,189,211,
213,206,190,217,219,
195,199,216,183,211,
190,192,185,195,191,
192,190,208,187,194,
209,205,196,192,194,
213,201,217,181,193,
205,188,190,200,197

];


const result = runOneSampleTest(
    apiData,
    200,
    0.05
);


console.log(
    JSON.stringify(result, null, 2)
);
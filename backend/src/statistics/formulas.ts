import { FormulaStep } from './statistics.types';

//FORMULA MEDIA
export function calculateMean(data: number[]): FormulaStep {
    const sum = data.reduce((acc, value) => acc + value, 0);
    const mean = sum / data.length;

    return {
        name: 'Media',
        formula: 'x̄ = Σx / n',
        // Sustitución limpia de una vez: x̄ = Suma / n
        substitution: `x̄ = ${sum} / ${data.length}`,
        steps: [
            `Σx = ${sum}`,
            `${sum} / ${data.length}`,
            `x̄ = ${mean.toFixed(4)}`
        ],
        result: Number(mean.toFixed(4))
    };
}

//FORMULA VARIANZA
export function calculateVariance(data: number[]): FormulaStep {
    const mean = calculateMean(data).result;
    
    // Calculamos directamente la suma de las diferencias al cuadrado
    const sumOfSquaredDifferences = data.reduce((acc, value) => {
        return acc + Math.pow(value - mean, 2);
    }, 0);
    
    const variance = sumOfSquaredDifferences / (data.length - 1);

    return {
        name: 'Varianza',
        formula: 's² = Σ(x - x̄)² / (n - 1)',
        // Sustitución limpia directa: s² = Suma_Diferencias / (n - 1)
        substitution: `s² = ${sumOfSquaredDifferences.toFixed(4)} / (${data.length} - 1)`,
        steps: [
            `Σ(x - x̄)² = ${sumOfSquaredDifferences.toFixed(4)}`,
            `${sumOfSquaredDifferences.toFixed(4)} / (${data.length - 1})`,
            `s² = ${variance.toFixed(4)}`
        ],
        result: Number(variance.toFixed(4))
    };
}

//FORMULA DESVIACION ESTANDAR
export function calculateStandardDeviation(data: number[]): FormulaStep {
    const variance = calculateVariance(data).result;
    const standardDeviation = Math.sqrt(variance);

    return {
        name: 'Desviación Estándar',
        formula: 's = √(s²)',
        substitution: `s = √(${variance.toFixed(4)})`,
        steps: [
            `√(${variance.toFixed(4)})`,
            `s = ${standardDeviation.toFixed(4)}`
        ],
        result: Number(standardDeviation.toFixed(4))
    };
}

//FORMULA ERROR ESTÁNDAR
export function calculateStandardError(data: number[]): FormulaStep {
    const standardDeviation = calculateStandardDeviation(data).result;
    const sqrtN = Math.sqrt(data.length);
    const standardError = standardDeviation / sqrtN;

    return {
        name: 'Error Estándar',
        formula: 'SE = s / √n',
        substitution: `SE = ${standardDeviation.toFixed(4)} / √${data.length}`,
        steps: [
            `√${data.length} = ${sqrtN.toFixed(4)}`,
            `${standardDeviation.toFixed(4)} / ${sqrtN.toFixed(4)}`,
            `SE = ${standardError.toFixed(4)}`
        ],
        result: Number(standardError.toFixed(4))
    };
}
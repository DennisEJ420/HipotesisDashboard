import { Request, Response } from 'express';
import { runOneSampleTest } from '../statistics/one-sample';
import { runTwoSampleTest } from '../statistics/two-sample';
import {
  collectApiASamples,
  collectApiBSamples
} from '../services/sample.service';

export function runHypothesis(req: Request, res: Response) {
  const {
    type,
    alpha = 0.05,
    sampleSize = 50,
    populationMean = 200,
    alternative = 'different',
    
    //estrechamos la diferencia a solo 3ms para forzar el solapamiento
    meanA = 197,
    variationA = 12,
    meanB = 200, 
    variationB = 12
  } = req.body;

  if (!type) {
    return res.status(400).json({
      error: 'Debe indicar el parámetro "type" como "one" o "two"'
    });
  }

  // Recolectar muestras usando los parámetros dinámicos
  const apiA = collectApiASamples(sampleSize, meanA, variationA);
  const apiB = collectApiBSamples(sampleSize, meanB, variationB);

  let response: any = {
    configuration: {
      type,
      alpha,
      sampleSize,
      populationMean,
      alternative,
      meanA,
      variationA,
      meanB,
      variationB
    },
    chart: {
      apiA,
      apiB: type === 'two' ? apiB : []
    },
    statistics: {},
    formulas: {},
    decision: {}
  };

  if (type === 'one') {
    const result = runOneSampleTest(apiA, populationMean, alpha);

    response.statistics = {
      apiA: result.statistics
    };

    response.formulas = {
      mean: result.statistics.mean,
      variance: result.statistics.variance,
      standardDeviation: result.statistics.standardDeviation,
      standardError: result.statistics.standardError,
      tStudent: result.tStatistic
    };

    response.decision = {
      h0: `μ = ${populationMean}`,
      h1: alternative === 'different'
        ? `μ ≠ ${populationMean}`
        : `μ ${alternative} ${populationMean}`,
      pValue: result.pValue,
      alpha,
      result: result.decision
    };
  }

  if (type === 'two') {
    const result = runTwoSampleTest(apiA, apiB, alpha);

    response.statistics = {
      apiA: result.sampleA,
      apiB: result.sampleB
    };

    response.formulas = {
      meanA: result.sampleA.mean,
      varianceA: result.sampleA.variance,
      deviationA: result.sampleA.standardDeviation,
      errorA: result.sampleA.standardError,

      meanB: result.sampleB.mean,
      varianceB: result.sampleB.variance,
      deviationB: result.sampleB.standardDeviation,
      errorB: result.sampleB.standardError,

      // Se añade el Error Estándar Combinado al JSON de respuesta
      pooledStandardError: result.pooledStandardError || (result as any).pooledSE || null,

      tStudent: result.tStatistic
    };

    response.decision = {
      h0: 'μA = μB',
      h1: 'μA ≠ μB',
      pValue: result.pValue,
      alpha,
      result: result.decision
    };
  }

  return res.json(response);
}
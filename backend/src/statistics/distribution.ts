import { jStat } from 'jstat';


export function calculatePValue(
    tStatistic: number,
    degreesOfFreedom: number
): number {


    const probability =
        2 *
        (1 - jStat.studentt.cdf(
            Math.abs(tStatistic),
            degreesOfFreedom
        ));


    return Number(probability.toFixed(6));

}
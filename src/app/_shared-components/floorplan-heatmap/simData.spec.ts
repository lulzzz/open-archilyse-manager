import { pointToIsoPoint, isoPointToPoint } from './simData';

describe('Sim data', () => {

  it('should create', () => {

    const x = 50; const y = 0;

    const options = {
      translateX: 100,
      translateY: 200,
      scaleX: 1,
      scaleY: 1,
      rotate: 0
    };

    const isoPoint = pointToIsoPoint(x, y, options, 1000, 1000);

    console.log('isoPoint', isoPoint);

    const originalPoint = isoPointToPoint(isoPoint[0], isoPoint[1], options, 1000, 1000);

    console.log('originalPoint', originalPoint);

    expect(x).toBe(originalPoint[0]);
    expect(y).toBe(originalPoint[1]);

  });
});

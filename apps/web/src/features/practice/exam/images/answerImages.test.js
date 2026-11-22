import { describe, expect, it } from 'vitest';
import { canSendWithImages, fitWithin, imageErrorKey, pendingKind } from './answerImages';

describe('answer images', () => {
  it('fits a photo inside 1600 px without enlarging it', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(1200, 4800)).toEqual({ width: 400, height: 1600 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('sends a typed answer, a photo, or both', () => {
    expect(canSendWithImages({ hasTypedAnswer: false, imageCount: 0 })).toBe(false);
    expect(canSendWithImages({ hasTypedAnswer: false, imageCount: 1 })).toBe(true);
    expect(canSendWithImages({ hasTypedAnswer: true, imageCount: 0 })).toBe(true);
  });

  it('maps server refusal codes to their own message, anything else to generic', () => {
    expect(imageErrorKey('image_limit_reached')).toBe('image_limit_reached');
    expect(imageErrorKey('weird')).toBe('generic');
    expect(imageErrorKey(null)).toBe('generic');
  });

  it('tells who the step is waiting for', () => {
    expect(pendingKind('review:pending')).toBe('review');
    expect(pendingKind('self:pending')).toBe('self');
    expect(pendingKind('26')).toBeNull();
  });
});

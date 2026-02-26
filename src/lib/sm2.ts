/**
 * SM-2 间隔重复算法
 * quality: 0=完全忘记, 1=错误但想起来了, 2=错误但简单, 3=困难才对, 4=犹豫后对, 5=轻松对
 */

const INITIAL_EF = 2.5;
const MIN_EF = 1.3;

export interface Sm2State {
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export function initialSm2State(): Sm2State {
  return {
    interval: 0,
    easeFactor: INITIAL_EF,
    repetitions: 0,
  };
}

/**
 * 根据本次评分计算下一次的 interval、easeFactor、repetitions。
 * quality 建议 1-5，<3 视为未掌握，重置间隔。
 */
export function nextSm2State(
  current: Sm2State,
  quality: number
): Sm2State {
  let { interval, easeFactor, repetitions } = current;

  if (quality < 3) {
    return {
      interval: 0,
      easeFactor,
      repetitions: 0,
    };
  }

  // EF' = EF + (0.1 - (5-q)(0.08 + (5-q)*0.02))
  const q = Math.max(0, Math.min(5, quality));
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  let newEf = easeFactor + efDelta;
  if (newEf < MIN_EF) newEf = MIN_EF;

  const newRepetitions = repetitions + 1;
  let newInterval: number;
  if (newRepetitions === 1) {
    newInterval = 1;
  } else if (newRepetitions === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * newEf);
  }
  if (newInterval < 1) newInterval = 1;

  return {
    interval: newInterval,
    easeFactor: newEf,
    repetitions: newRepetitions,
  };
}

/** 将 nextReview 设为今天 + interval 天，返回 ISO 日期字符串 */
export function nextReviewDate(intervalDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + intervalDays);
  return d.toISOString().slice(0, 10);
}

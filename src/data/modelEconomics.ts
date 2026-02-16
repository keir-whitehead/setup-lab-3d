import type { AIModelDef, AIModelResult } from '../types';

const DEFAULT_ELECTRICITY_RATE = 0.3;
const DEFAULT_HOURS_PER_DAY = 12;
const DAYS_PER_MONTH = 30;

type ModelCostShape = Pick<
  AIModelDef | AIModelResult,
  'type' | 'params' | 'costPerMTokenInput' | 'costPerMTokenOutput' | 'costPerImage' | 'costPerAudioHour'
>;

export const parseModelSizeInBillions = (params: string): number | null => {
  const match = params.match(/([\d.]+)\s*([BM])/i);
  if (!match) return null;

  const value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value)) return null;

  const unit = match[2].toUpperCase();
  return unit === 'M' ? value / 1000 : value;
};

export const getModelPowerWatts = (params: string): number => {
  const sizeB = parseModelSizeInBillions(params);
  if (sizeB === null) return 80;
  if (sizeB < 10) return 60;
  if (sizeB < 40) return 80;
  if (sizeB < 100) return 100;
  return 120;
};

export const getLocalCostPerHour = (
  params: string,
  electricityRate: number = DEFAULT_ELECTRICITY_RATE
): number => (getModelPowerWatts(params) / 1000) * electricityRate;

export const getLocalMonthlyCost = (
  params: string,
  electricityRate: number = DEFAULT_ELECTRICITY_RATE,
  hoursPerDay: number = DEFAULT_HOURS_PER_DAY
): number => getLocalCostPerHour(params, electricityRate) * hoursPerDay * DAYS_PER_MONTH;

const getMonthlyTokenVolumeM = (params: string): number => {
  const sizeB = parseModelSizeInBillions(params);
  if (sizeB === null) return 100;
  if (sizeB < 10) return 200;
  if (sizeB <= 70) return 100;
  if (sizeB > 100) return 30;
  return 100;
};

export const getCloudMonthlyCost = (model: ModelCostShape): number | null => {
  if (model.type === 'llm') {
    if (model.costPerMTokenInput === undefined || model.costPerMTokenOutput === undefined) return null;
    const monthlyTokensM = getMonthlyTokenVolumeM(model.params);
    return (model.costPerMTokenInput + model.costPerMTokenOutput) * monthlyTokensM;
  }

  if (model.type === 'image') {
    if (model.costPerImage === undefined) return null;
    return model.costPerImage * 5000;
  }

  if (model.costPerAudioHour === undefined) return null;
  return model.costPerAudioHour * 200;
};

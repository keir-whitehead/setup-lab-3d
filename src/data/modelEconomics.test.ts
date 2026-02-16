import {
  getCloudMonthlyCost,
  getLocalCostPerHour,
  getLocalMonthlyCost,
  getModelPowerWatts,
  parseModelSizeInBillions,
} from './modelEconomics';

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

(() => {
  assert(parseModelSizeInBillions('3B') === 3, '3B should parse to 3');
  assert(parseModelSizeInBillions('809M') === 0.809, '809M should parse to 0.809');
  assert(getModelPowerWatts('8B') === 60, '<10B should map to 60W');
  assert(getModelPowerWatts('32B') === 80, '10-40B should map to 80W');
  assert(getModelPowerWatts('72B') === 100, '40-100B should map to 100W');
  assert(getModelPowerWatts('123B') === 120, '100B+ should map to 120W');

  const localHourly = getLocalCostPerHour('8B');
  assert(localHourly === 0.018, '8B local hourly should be 0.018 at $0.30/kWh');

  const localMonthly = getLocalMonthlyCost('8B');
  assert(localMonthly === 6.48, '8B local monthly should be 6.48 at 12h/day');

  const smallCloud = getCloudMonthlyCost({
    type: 'llm',
    params: '3B',
    costPerMTokenInput: 0.01,
    costPerMTokenOutput: 0.03,
  });
  assert(smallCloud === 8, '3B model cloud monthly should use 200M tokens');

  const generalCloud = getCloudMonthlyCost({
    type: 'llm',
    params: '32B',
    costPerMTokenInput: 0.15,
    costPerMTokenOutput: 0.45,
  });
  assert(generalCloud === 60, '32B model cloud monthly should use 100M tokens');

  const frontierCloud = getCloudMonthlyCost({
    type: 'llm',
    params: '123B',
    costPerMTokenInput: 2,
    costPerMTokenOutput: 6,
  });
  assert(frontierCloud === 240, '123B model cloud monthly should use 30M tokens');
})();

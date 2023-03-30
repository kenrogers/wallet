import { Stack } from '@stacks/ui';

import { FeesCard } from '../../../components/fees-card';
import { useBitcoinSetFees } from './useBitcoinSetFees';

interface BitcoinSetFeeProps {
  onChooseFee(feeRate: number, feeValue: number, time: string): Promise<void> | void;
}

export function BitcoinSetFee({ onChooseFee }: BitcoinSetFeeProps) {
  const { feesList } = useBitcoinSetFees();

  return (
    <Stack p="extra-loose" width="100%" spacing="base">
      {feesList.map(({ label, value, btcValue, fiatValue, time, feeRate }) => (
        <FeesCard
          key={label}
          feeType={label}
          feeAmount={btcValue}
          feeFiatValue={fiatValue}
          arrivesIn={time}
          onClick={() => onChooseFee(feeRate, value, time)}
        />
      ))}
    </Stack>
  );
}

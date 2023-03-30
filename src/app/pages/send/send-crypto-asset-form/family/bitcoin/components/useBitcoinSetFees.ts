import { useMemo } from 'react';

import { createMoney } from '@shared/models/money.model';

import { baseCurrencyAmountInQuote } from '@app/common/money/calculate-money';
import { formatMoney, i18nFormatCurrency } from '@app/common/money/format-money';
import { BtcSizeFeeEstimator } from '@app/common/transactions/bitcoin/fees/btc-size-fee-estimator';
import { useCurrentTaprootAccountUninscribedUtxos } from '@app/query/bitcoin/balance/bitcoin-balances.query';
import { BtcFeeType, btcTxTimeMap } from '@app/query/bitcoin/bitcoin-client';
import { useBitcoinFeeRate } from '@app/query/bitcoin/fees/fee-estimates.hooks';
import { useCryptoCurrencyMarketData } from '@app/query/common/market-data/market-data.hooks';

export function useBitcoinSetFees() {
  const uninscribedUtxos = useCurrentTaprootAccountUninscribedUtxos();

  const btcMarketData = useCryptoCurrencyMarketData('BTC');
  const { data: feeRate } = useBitcoinFeeRate();

  const feesList = useMemo(() => {
    function getFiatFeeValue(fee: number) {
      return `~ ${i18nFormatCurrency(
        baseCurrencyAmountInQuote(createMoney(Math.ceil(txVBytes * fee), 'BTC'), btcMarketData)
      )}`;
    }

    if (!feeRate) return [];
    const txSizer = new BtcSizeFeeEstimator();
    const { txVBytes } = txSizer.calcTxSize({
      input_count: uninscribedUtxos.length,
      p2wpkh_output_count: 1,
    });
    const highFeeValue = Math.ceil(txVBytes * feeRate.fastestFee);
    const standartFeeValue = Math.ceil(txVBytes * feeRate.halfHourFee);
    const lowFeeValue = Math.ceil(txVBytes * feeRate.economyFee);

    return [
      {
        label: BtcFeeType.High,
        value: highFeeValue,
        btcValue: formatMoney(createMoney(highFeeValue, 'BTC')),
        time: btcTxTimeMap.fastestFee,
        fiatValue: getFiatFeeValue(highFeeValue),
        feeRate: feeRate.fastestFee,
      },

      {
        label: BtcFeeType.Standard,
        value: standartFeeValue,
        btcValue: formatMoney(createMoney(standartFeeValue, 'BTC')),
        time: btcTxTimeMap.halfHourFee,
        fiatValue: getFiatFeeValue(standartFeeValue),
        feeRate: feeRate.halfHourFee,
      },
      {
        label: BtcFeeType.Low,
        value: lowFeeValue,
        btcValue: formatMoney(createMoney(lowFeeValue, 'BTC')),
        time: btcTxTimeMap.economyFee,
        fiatValue: getFiatFeeValue(lowFeeValue),
        feeRate: feeRate.economyFee,
      },
    ];
  }, [feeRate, uninscribedUtxos.length, btcMarketData]);

  return {
    feesList,
  };
}

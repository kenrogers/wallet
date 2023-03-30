import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { bytesToHex } from '@stacks/common';
import { StacksTransaction } from '@stacks/transactions';

import { BitcoinSendFormValues } from '@shared/models/form.model';
import { RouteUrls } from '@shared/route-urls';

interface ConfirmationRouteState {
  decimals?: number;
  token?: string;
  tx: string;
  hasHeaderTitle?: boolean;
}

interface ConfirmationRouteStacksSip10Args {
  decimals?: number;
  name?: string;
  tx: StacksTransaction;
}

interface ConfirmationRouteBtcArgs {
  tx: string;
  recipient: string;
  fee: number;
  time: string;
}

export function useSendFormNavigate() {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      backToSendForm(state: any) {
        return navigate('../', { relative: 'path', replace: true, state });
      },
      toChooseTransactionFee(values: BitcoinSendFormValues) {
        return navigate('set-fee', {
          state: {
            values,
            hasHeaderTitle: true,
          },
        });
      },
      toConfirmAndSignBtcTransaction({ tx, recipient, fee, time }: ConfirmationRouteBtcArgs) {
        return navigate(RouteUrls.SendBtcConfirmation, {
          state: {
            tx,
            recipient,
            fee,
            time,
            hasHeaderTitle: true,
          } as ConfirmationRouteState,
        });
      },
      toConfirmAndSignStxTransaction(tx: StacksTransaction) {
        return navigate('confirm', {
          replace: true,
          state: {
            tx: bytesToHex(tx.serialize()),
            hasHeaderTitle: true,
          } as ConfirmationRouteState,
        });
      },
      toConfirmAndSignStacksSip10Transaction({
        decimals,
        name,
        tx,
      }: ConfirmationRouteStacksSip10Args) {
        return navigate('confirm', {
          replace: true,
          state: {
            decimals,
            token: name,
            tx: bytesToHex(tx.serialize()),
          } as ConfirmationRouteState,
        });
      },
      toErrorPage(error: unknown) {
        return navigate('../error', { relative: 'path', replace: true, state: { error } });
      },
    }),
    [navigate]
  );
}

import { Outlet } from 'react-router-dom';

import { InternalMethods } from '@shared/message-types';

import { useInterval } from '@app/common/utils/use-interval';
import { useRouteHeaderState } from '@app/store/ui/ui.hooks';

import { ContainerLayout } from './container.layout';

export function Container() {
  const [routeHeader] = useRouteHeaderState();

  useInterval(() => {
    const x = performance.now();
    chrome.runtime.sendMessage({ method: InternalMethods.CheckServiceWorkerStatus }, resp => {
      // eslint-disable-next-line no-console
      console.log(resp);
      const y = performance.now();
      // eslint-disable-next-line no-console
      console.log(y - x);
      if (y - x > 180 && resp.keysInMem === 0) location.reload();
    });
  }, 4_000);

  return (
    <ContainerLayout header={routeHeader}>
      <Outlet />
    </ContainerLayout>
  );
}

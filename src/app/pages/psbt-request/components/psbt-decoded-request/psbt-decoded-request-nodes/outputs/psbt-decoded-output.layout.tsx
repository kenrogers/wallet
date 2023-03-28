import { ReactNode } from 'react';

import { Box, Stack } from '@stacks/ui';

import { PsbtDecodedNodeFooter } from '../psbt-decoded-node-footer';

interface PsbtDecodedOutputLayoutProps {
  address: string;
  children: ReactNode;
}
export function PsbtDecodedOutputLayout({ address, children }: PsbtDecodedOutputLayoutProps) {
  return (
    <Stack spacing="base">
      <Box pb="tight" mt="loose">
        {children}
      </Box>
      <hr />
      <PsbtDecodedNodeFooter address={address} type="output" />
    </Stack>
  );
}

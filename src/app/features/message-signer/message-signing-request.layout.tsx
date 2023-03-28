import { Stack } from '@stacks/ui';

import { MessageSigningHeader } from '../../pages/stacks-message-signing-request/components/message-signing-header';

interface MessageSigningRequestLayoutProps {
  children: React.ReactNode;
}
export function MessageSigningRequestLayout({ children }: MessageSigningRequestLayoutProps) {
  return (
    <Stack px={['loose', 'unset']} spacing="loose" width="100%">
      <MessageSigningHeader />
      {children}
    </Stack>
  );
}

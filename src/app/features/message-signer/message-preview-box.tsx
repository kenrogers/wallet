import { Box, Stack, Text, color } from '@stacks/ui';

import { HashDrawer } from '../../pages/stacks-message-signing-request/components/hash-drawer';

interface MessageBoxProps {
  message: string;
  hash: string;
}
export function MessagePreviewBox({ message, hash }: MessageBoxProps) {
  return (
    <Box minHeight="260px">
      <Stack
        border="4px solid"
        paddingBottom="8px"
        borderColor={color('border')}
        borderRadius="20px"
        backgroundColor={color('border')}
      >
        <Stack
          bg={color('bg')}
          borderRadius="16px"
          fontSize={2}
          lineHeight="1.6"
          px="loose"
          py="loose"
          spacing="tight"
          overflowX="scroll"
        >
          {message.split(/\r?\n/).map(line => (
            <Text key={line}>{line}</Text>
          ))}
        </Stack>
        {hash ? <HashDrawer hash={hash} /> : null}
      </Stack>
    </Box>
  );
}

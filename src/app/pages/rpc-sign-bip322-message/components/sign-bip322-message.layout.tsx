import { Box, Button, Flex, Text } from '@stacks/ui';

import { figmaTheme } from '@app/common/utils/figma-theme';
import { Favicon } from '@app/components/favicon';
import { Flag } from '@app/components/layout/flag';
import { Caption } from '@app/components/typography';

interface SignBip322MessageLayoutProps {
  requester: string;
  message: string;
  onUserApproveSignBip322Message(): void;
}
export function SignBip322MessageLayout(props: SignBip322MessageLayoutProps) {
  const { requester, message, onUserApproveSignBip322Message } = props;
  return (
    <Flex flexDirection="column" height="100vh" width="100%">
      <Flex
        flex={1}
        flexDirection="column"
        justifyContent="center"
        textAlign="center"
        alignItems="center"
        mx="extra-loose"
      >
        <Text as="h1" mt="base" fontSize="24px" fontWeight={500} lineHeight="36px">
          {requester} is requesting to sign a message
        </Text>
        <Flag img={<Favicon origin={requester} />} mt="base">
          <Caption>{requester}</Caption>
          <Caption>Learn more about BIP-322 message signing</Caption>
        </Flag>

        <Box mt="base">{message}</Box>

        <Button mt="extra-loose" onClick={() => onUserApproveSignBip322Message()} width="100%">
          Sign message
        </Button>
      </Flex>
      <Flex
        backgroundColor={figmaTheme.backgroundSubdued}
        px="loose"
        py="base"
        lineHeight="20px"
        textAlign="center"
        alignSelf="bottom"
      >
        <Text fontSize="14px" color={figmaTheme.textSubdued}>
          By signing this message, you're proving to {requester} that you own a certain bitcoin
          address
        </Text>
      </Flex>
    </Flex>
  );
}

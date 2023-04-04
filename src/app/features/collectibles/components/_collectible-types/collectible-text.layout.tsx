import { Box, Text } from '@stacks/ui';
import { sanitize } from 'dompurify';

interface CollectibleTextLayoutProps {
  children: string;
}
export function CollectibleTextLayout({ children }: CollectibleTextLayoutProps) {
  return (
    <Box
      _after={{
        content: '""',
        position: 'absolute',
        bottom: '0',
        left: '0',
        height: '30px',
        width: '100%',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,1))',
      }}
      backgroundColor="black"
      color="white"
      height="100%"
      p="20px"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'left',
      }}
      width="100%"
    >
      <Text>{sanitize(children)}</Text>
    </Box>
  );
}

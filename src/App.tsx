import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { WalletStatus } from "./WalletStatus";

function App() {
  return (
    <div>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>Sui Meetup</Heading>
        </Box>

        <Box>
          <ConnectButton connectText="連接錢包" style={{ height: 20 }} />
        </Box>
      </Flex>
      <Container>
        <Container mt="5" pt="2" px="4">
          <WalletStatus />
        </Container>
      </Container>
    </div>
  );
}

export default App;

import { useCurrentAccount } from "@mysten/dapp-kit";
import { Container, Flex, Text, Link } from "@radix-ui/themes";
import { OwnedObjects } from "./OwnedObjects";

export function WalletStatus() {
  const account = useCurrentAccount();

  return (
    <Container my="2">
      {account ? null : (
        <Flex direction="column" align="center">
          <Text size="6" mb="3">
            請先連接錢包
          </Text>
          <Flex
            direction="column"
            align="center"
            mb="3"
            style={{
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 5,
            }}
          >
            <Text align="center" mb="3" size="7">
              Why we choose Sui ?
            </Text>
            <Text align="center" mb="3">
              Blockchain favors people over platforms. It can remove
              untrustworthy intermediaries and protect our privacy. Direct
              digital ownership offers everyone greater control, allowing us to
              realize the value of the internet.
            </Text>
            <Text align="center" mb="3">
              We believe in this vision. But we believe it must be delivered
              with the utmost security, accessibility, and creativity.
            </Text>
            <Text align="center">That's why Sui was created.</Text>
          </Flex>
          <Text mb="3">錢包安裝（目前 Sui 僅提供瀏覽器錢包）</Text>
          <Link
            target="_blank"
            href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
          >
            Sui Wallet Browser Extension
          </Link>
        </Flex>
      )}
      <OwnedObjects />
    </Container>
  );
}

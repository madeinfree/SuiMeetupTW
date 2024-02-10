import { useState } from "react";
import {
  useCurrentAccount,
  useSuiClientQuery,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Button, Flex, Text, TextField, Link } from "@radix-ui/themes";

const Clock =
  "0x0000000000000000000000000000000000000000000000000000000000000006";
const Package =
  "0xe37de4f2a860425080abb821859619c487e9929e1ced38a8c6fce29c90d0a186";
const Dashboard =
  "0x9243c249a13d182ab0db3ee3a6db9d787ffb161a4e39d8f30c64c054687dc521";

export function OwnedObjects() {
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  const account = useCurrentAccount();
  const { data, isPending, error }: any = useGetRegister();
  const { data: mintCapData }: any = useGetMintCap();
  const { data: identityData }: any = useGetIdentity();

  const [passId, setPassId] = useState("");

  if (!account) {
    return;
  }

  if (error) {
    return <Flex>Error: {error.message}</Flex>;
  }

  if (isPending || !data) {
    return <Flex>Loading...</Flex>;
  }

  if (identityData?.data.length) {
    return (
      <Flex direction="column" my="2" align="center">
        <Text size="6" align="center" mb="3">
          嗨，{identityData.data[0].data.content.fields.pass_id}！
        </Text>
        <Text mb="3">
          即將在 2024-03-02 13:30-17:00 舉辦第一次小型 Sui 技術分享，
        </Text>
        <Text mb="3">過幾天就會開放報名，</Text>
        <Text mb="3">非常期待您的參與！</Text>
      </Flex>
    );
  }

  if (mintCapData?.data.length) {
    return (
      <Flex direction="column" my="2">
        <Text size="6" align="center" mb="3">
          鑄造活動身份證明
        </Text>
        <Flex
          direction="column"
          mb="3"
          style={{
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 5,
          }}
        >
          <Text mb="3" size="7">
            注意事項
          </Text>
          <Text mb="3">您已經獲得了活動身份證明鑄造資格，期待認識您。</Text>
          <Text mb="3">
            鑄造資格編號：
            <Link
              target="_blank"
              href={`https://suiexplorer.com/object/${mintCapData.data[0].data.objectId}?network=testnet`}
            >
              Sui Explorer
            </Link>
          </Text>
          <Text mb="3">
            最後一個步驟點擊「開始鑄造」，會自動將鑄造資格銷毀，並且獲得「活動身份證」。
          </Text>
          <Text mb="3">
            ＊所有動作都皆只需要預設鏈上交易手續費，無額外費用。
          </Text>
        </Flex>
        <Text>怎麼稱呼呢？</Text>
        <TextField.Input
          autoFocus
          mb="3"
          value={passId}
          onChange={(e) => setPassId(e.target.value)}
        />
        <Button
          disabled={passId.length <= 0}
          color="cyan"
          onClick={() => {
            const txb = new TransactionBlock();

            txb.moveCall({
              target: `${Package}::identity::mint_identity`,
              arguments: [
                txb.object(mintCapData.data[0].data.objectId),
                txb.object(Dashboard),
                txb.pure(passId),
                txb.object(Clock),
              ],
            });

            signAndExecuteTransactionBlock(
              {
                transactionBlock: txb,
                chain: "sui:testnet",
              },
              {
                onSuccess: () => {
                  location.reload();
                },
              },
            );
          }}
        >
          開始鑄造
        </Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column" my="2">
      <Text size="6" align="center" mb="3">
        申請活動身份證明鑄造資格
      </Text>
      <Flex
        direction="column"
        mb="3"
        style={{
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 5,
        }}
      >
        <Text mb="3" size="7">
          注意事項
        </Text>
        <Text mb="3">Sui Meeptup 將會大量採用 Sui 來進行活動登記與紀錄</Text>
        <Text mb="3">
          目前正在進行第一次的申請活動身份證明，申請完後會開始排隊，在近期釋出申請空位時，一併分發活動身份證明鑄造資格
        </Text>
        <Text mb="3">
          獲得活動身份證明鑄造資格後，即可在網頁中鑄造未來用於參與活動的「身份證明」
        </Text>
        <Text mb="3">以下是要參與未來活動前，需要進行的事情</Text>
        <Text mb="3">
          <ul>
            <li>申請活動身份證明鑄造資格（register）</li>
            <li>等待獲得活動身份證明鑄造資格（MintCap）</li>
            <li>鑄造活動證明（Identity）</li>
            <li>未來利用活動證明參與活動</li>
          </ul>
        </Text>
        <Text mb="3">＊所有動作都皆只需要預設鏈上交易手續費，無額外費用。</Text>
      </Flex>
      {data.data.content.fields.register.fields.users.includes(
        account.address,
      ) ? (
        <Text align="center" size="6">
          已登記完畢，請等待分發身份證明鑄造資格。
        </Text>
      ) : (
        <Button
          color="cyan"
          onClick={() => {
            const txb = new TransactionBlock();

            txb.moveCall({
              target: `${Package}::identity::participate_register`,
              arguments: [txb.object(Dashboard)],
            });

            signAndExecuteTransactionBlock(
              {
                transactionBlock: txb,
                chain: "sui:testnet",
              },
              {
                onSuccess: () => {
                  location.reload();
                },
              },
            );
          }}
        >
          我要進行登記
        </Button>
      )}
    </Flex>
  );
}

const useGetRegister = () => {
  const account = useCurrentAccount();
  const { data, isPending, error } = useSuiClientQuery(
    "getObject",
    {
      id: Dashboard,
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!account,
    },
  );

  return {
    data,
    isPending,
    error,
  };
};

const useGetMintCap = () => {
  const account = useCurrentAccount();
  const { data, isPending, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      filter: {
        MatchAll: [
          {
            MoveModule: {
              package: Package,
              module: "identity",
            },
          },
          {
            StructType: `${Package}::identity::MintCap`,
          },
        ],
      },
      options: {
        showContent: true,
      },
      owner: account?.address as string,
    },
    {
      enabled: !!account,
    },
  );

  return {
    data,
    isPending,
    error,
  };
};

const useGetIdentity = () => {
  const account = useCurrentAccount();
  const { data, isPending, error, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      filter: {
        MatchAll: [
          {
            MoveModule: {
              package: Package,
              module: "identity",
            },
          },
          {
            StructType: `${Package}::identity::Identity`,
          },
        ],
      },
      options: {
        showContent: true,
      },
      owner: account?.address as string,
    },
    {
      enabled: !!account,
    },
  );

  return {
    data,
    isPending,
    error,
    refetch,
  };
};

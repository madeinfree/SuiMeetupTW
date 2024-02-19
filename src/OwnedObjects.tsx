import { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSuiClientQuery,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  Button,
  Flex,
  Text,
  TextField,
  Link,
  Card,
  Badge,
  Strong,
} from "@radix-ui/themes";
import axios from "axios";

const Clock =
  "0x0000000000000000000000000000000000000000000000000000000000000006";
const Package =
  "0xd6c973cd3bfb5d542fa7e15fc148ef89ccb4bfe71992ce3f9cc9308ba78e378b";
const Dashboard =
  "0x32bf6fbd39a78281add664dfc50209af1419abaa4b82b444c5839072e4bd39bd";
const Events =
  "0x73b3f4e27cfa932b27d6494a6916f25f25a7c367144d33083a20452f5fef2a31";
const EventsTable =
  "0x2077f36b98567f64f047251d406cf58a3b18d8088459fab7dc08ebf9520d7bb6";

export function OwnedObjects() {
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  const account = useCurrentAccount();
  const { data, isPending, error }: any = useGetRegister();
  const { data: mintCapData }: any = useGetMintCap();
  const { data: identityData }: any = useGetIdentity();
  const [events, setEvents] = useState([]);

  const getEvents = async () => {
    if (events.length) return;
    const allEvents = await useGetEventsDynamicFields();
    setEvents(allEvents.result);
  };

  useEffect(() => {
    getEvents();
  }, []);

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
        {/* <Text size="6" align="center" mb="3">
          嗨，{identityData.data[0].data.content.fields.pass_id}！
        </Text> */}
        {events.map((event: any, index) => {
          return (
            <Card key={index} asChild style={{ maxWidth: 550 }} mt="5">
              <div>
                <Flex gap="2">
                  <Badge color="cyan">New</Badge>
                  <Text as="div" size="2" weight="bold">
                    {event.data.content.fields.value.fields.title}
                  </Text>
                </Flex>
                <Text as="div" color="gray" size="2" mt="3">
                  時間：
                  {new Date(
                    Number(event.data.content.fields.value.fields.start_at),
                  ).toLocaleDateString()}
                </Text>
                <Text as="div" color="gray" size="2" mt="3">
                  地點：
                  <Link
                    target="_blank"
                    href="https://maps.app.goo.gl/FKFnxfLpD5Rn1oAu7"
                  >
                    言文字 Emoji Cafe & Bar｜貓 x 插座 x 網路 x 深夜
                  </Link>
                </Text>
                <Text as="div" color="gray" size="2" mt="3">
                  預期人數：
                  {event.data.content.fields.value.fields.participate_limit}
                </Text>
                <Text as="div" color="gray" size="2" mt="3">
                  參與人數：
                  {event.data.content.fields.value.fields.participate.length}
                </Text>
                <Text as="div" color="gray" size="2" mt="3">
                  {event.data.content.fields.value.fields.description}
                </Text>
                {event.data.content.fields.value.fields.participate.includes(
                  account.address,
                ) ? (
                  <Text align="center" as="div" color="gray" size="2" mt="3">
                    <Strong>報名完成</Strong>
                  </Text>
                ) : (
                  <Button
                    mt="3"
                    onClick={() => {
                      const txb = new TransactionBlock();

                      txb.moveCall({
                        target: `${Package}::meetup::join_event`,
                        arguments: [
                          txb.object(identityData?.data[0].data.objectId),
                          txb.object(Events),
                          txb.pure(event.data.content.fields.name),
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
                    我要報名
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
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
      <Text size="4" align="center" mb="3">
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
        <Text mb="3">Sui Meeptup TW 將會大量採用 Sui 來進行活動登記與紀錄</Text>
        <Text mb="3">
          目前正在進行第一次的申請活動身份證明，申請後在近期釋出申請空位時，會一併分發活動身份證明鑄造資格
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
          <Badge color="blue">已登記完畢，請等待分發身份證明鑄造資格。</Badge>
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

const useGetEventsDynamicFields = async () => {
  const fields = await axios({
    method: "POST",
    url: "https://fullnode.testnet.sui.io/",
    data: {
      jsonrpc: "2.0",
      id: "1",
      method: "suix_getDynamicFields",
      params: [EventsTable],
    },
  });
  if (fields.data?.result?.data?.length) {
    const ids = fields.data?.result?.data.map((d: any) => d.objectId);
    const result = await axios({
      method: "POST",
      url: "https://fullnode.testnet.sui.io/",
      data: {
        jsonrpc: "2.0",
        id: "1",
        method: "sui_multiGetObjects",
        params: [
          ids,
          {
            showContent: true,
          },
        ],
      },
    });
    return {
      result: result.data.result,
    };
  }

  return {
    result: [],
  };
};

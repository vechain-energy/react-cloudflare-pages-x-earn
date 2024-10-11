import React from 'react';
// fails:
// TypeError: Class extends value undefined is not a constructor or null
// ..
// > 4140 | var JSONRPCEthersProvider = class extends vechain_sdk_core_ethers3.JsonRpcApiProvider {
// … skipping to 
// import { subscriptions } from '@vechain/sdk-network';
import useWebSocket from 'react-use-websocket';
import { NODE_URL } from '~/config';
import { BloomFilter, Hex, Address } from "@vechain/sdk-core";

type Beat = {
  number: number;
  id: string;
  parentID: string;
  timestamp: number;
  txsFeatures: number;
  gasLimit: number;
  bloom: string;
  k: number;
  obsolete: boolean;
};

const DELAY = 100;

/**
 * @TODO: hook is currently disabled, until https://github.com/vechain/vechain-sdk-js/issues/1359 is updated
 */

/**
 * Subscribe to blockchain updates and filter them based on provided addresses, transactions or data.
 *
 * @param {string[]} addressesOrData - An array of addresses, transaction ids or data to filter the incoming beats.
 * @returns {Beat | null} - The latest block that matches the filter criteria or null if no match is found.
 */
const useBeats = (addressesOrData: (string | `0x${string}` | null | undefined)[]) => {
  const [block, setBlock] = React.useState<Beat | null>(null);
  const { lastJsonMessage } = useWebSocket(
    `${NODE_URL}/subscriptions/beat2`.replace('http', 'ws'),
    // subscriptions.getBeatSubscriptionUrl(NODE_URL),
    {
      share: true,
      shouldReconnect: () => true,
    }
  );

  React.useEffect(() => {
    try {
      const block = lastJsonMessage as Beat | null;
      if (!block) { return }

      const filter = new BloomFilter(Hex.of(block.bloom).bytes, block.k)

      if (
        (addressesOrData
          .filter(value => Boolean(value)) as string[])
          .some((addressOrData: string) =>
            filter.contains(Hex.of(addressOrData))
          )
      ) {
        setTimeout(() => setBlock(block), DELAY);
      }
    } catch {
      /* ignore */
    }
  }, [lastJsonMessage]);

  return block;
};

export { useBeats };

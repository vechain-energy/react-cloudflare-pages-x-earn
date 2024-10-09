import React from 'react';
import { subscriptions } from '@vechain/sdk-network';
// import { bloomUtils, addressUtils } from '@vechain/sdk-core';
import useWebSocket from 'react-use-websocket';
import { NODE_URL } from '~/config';

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
  // const { lastJsonMessage } = useWebSocket(
  //   subscriptions.getBeatSubscriptionUrl(NODE_URL),
  //   {
  //     share: true,
  //     shouldReconnect: () => true,
  //   }
  // );

  // React.useEffect(() => {
  //   try {
  //     const block = lastJsonMessage as Beat;
  //     if (
  //       (addressesOrData
  //         .filter(value => Boolean(value)) as string[])
  //         .some((addressOrData: string) =>
  //           addressUtils.isAddress(addressOrData)
  //             ? bloomUtils.isAddressInBloom(block.bloom, block.k, addressOrData)
  //             : bloomUtils.isInBloom(block.bloom, block.k, addressOrData)
  //         )
  //     ) {
  //       setTimeout(() => setBlock(block), DELAY);
  //     }
  //   } catch {
  //     /* ignore */
  //   }
  // }, [lastJsonMessage]);

  return block;
};

export { useBeats };

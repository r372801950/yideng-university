import { WagmiProvider, createConfig, http } from 'wagmi';
import {mainnet, sepolia} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';

// const config = createConfig(
//   getDefaultConfig({
//     // Your dApps chains
//     chains: [mainnet],
//     transports: {
//       // RPC URL for each chain 98064ca1c1c04949b93f61ef466c7f15
//       [mainnet.id]: http(
//         `https://mainnet.infura.io/v3/98064ca1c1c04949b93f61ef466c7f15`
//       ),
//     },
//
//     // Required API Keys
//     walletConnectProjectId: '54b71bc841c7f8a39dfe10dbdd194b0f',
//     // Required App Info
//     appName: 'Your App Name',
//     // Optional App Info
//     appDescription: 'Your App Description',
//     appUrl: 'https://family.co', // your app's url
//     appIcon: 'https://family.co/logo.png', // your app's icon, no bigger than 1024x1024px (max. 1MB)
//   })
// );
const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})

const queryClient = new QueryClient();

import { ReactNode } from 'react';

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

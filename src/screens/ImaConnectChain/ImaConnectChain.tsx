import Card from '@/components/Card/Card';
import { useChainConnect } from '@/features/bridge';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from 'wagmi';

export default function ImaConnectChain() {
  const { chains, chain: originChain } = useNetwork();
  const [selectedChainName, setSelectedChainName] = useState('');

  const allSChains = [...chains.map((chain) => chain.name)].map((chainName) => {
    return {
      chainName,
      chainId: chains.find((c) => c.name === chainName)?.id,
      ...useChainConnect({ chainName }),
    };
  });

  const chain = useChainConnect({
    chainName: selectedChainName,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (chain?.connect.isSuccess) {
      navigate(`/ima_manager/token_map/${selectedChainName}`);
      chain?.connect.reset();
    }
  }, [chain?.connect.isSuccess]);

  const handleSubmit = () => {
    chain?.connect?.write?.();
  };

  return (
    <div className="grid grid-rows-[1fr_max-content] h-full rounded-lg bg-[var(--white)] p-2">
      <Card full heading="Connect chains">
        <ToggleGroup.Root
          type="single"
          disabled={chain?.connect.isLoading}
          value={selectedChainName}
          onValueChange={(value) => setSelectedChainName(value)}
          className="flex flex-row flex-wrap h-full w-full
      overflow-auto gap-4"
        >
          {chains.map((someChain) => {
            const chain = useChainConnect({
              chainName: someChain.name,
            });
            return chain.status !== 'none' ||
              someChain.name === originChain?.name ? (
              <></>
            ) : (
              <>
                <ToggleGroup.Item
                  className="
              flex-[1_0_21%] h-[calc(25%-1rem)] relative flex flex-col justify-center items-center p-4
              text-center text-sm border rounded-lg cursor-pointer hover:bg-[var(--gray1)]
              group radix-state-on:rounded-tr-2xl radix-state-on:border-[var(--green8)]
              transition-all
              "
                  value={someChain.name}
                >
                  <CheckCircleIcon
                    className="transition-all opacity-0 group-radix-state-on:opacity-100 absolute top-1 right-1 text-[var(--green8)]"
                    width={20}
                  />
                  <p className="font-semibold">{someChain.name}</p>
                  <p className="text-[var(--gray11)]">{someChain.id}</p>
                </ToggleGroup.Item>
              </>
            );
          })}
        </ToggleGroup.Root>
      </Card>
      <div className="flex justify-center items-center p-4">
        <button
          className="btn btn-wide"
          onClick={() => {
            debugger;
            handleSubmit();
          }}
          disabled={
            !selectedChainName || !chain?.connect || chain?.connect.isLoading
          }
        >
          Connect
        </button>
      </div>
    </div>
  );
}
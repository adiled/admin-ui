import Field from '@/elements/Field/Field';
import { FormProvider, useForm } from 'react-hook-form';
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useQuery,
} from 'wagmi';

import { CrownIcon } from '@/components/Icons/Icons';
import { addresses } from '@/features/network';
import { NETWORK } from '@/features/network/literals';
import NotSupported from '@/screens/NotSupported';

import { ContractDetailList } from '@/features/network/contract';
import { useTypedContract } from '@/features/network/hooks';
import { build, CONTRACT } from '@/features/network/manifest';

import { getAbi } from '@/features/network/abi/abi';
import { useMemo } from 'react';

type FormData = {
  contractAddress: ContractDetailList['address'];
  role: string;
  assigneeAddress: string;
};

const EXCLUDE_LIST = {};

const contractsWithRoles = Object.entries(CONTRACT).map((id, details) => {
  try {
    const abi = getAbi({ id });
  } catch (e) {
    return;
  }
});

export default function RoleAssigner() {
  const form = useForm({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {
      contractAddress: CONTRACT['CONFIG_CONTROLLER'].address,
      role: '',
      assigneeAddress: '',
    } as FormData,
  });
  const { address } = useAccount();
  const { chain } = useNetwork();

  const contractAddress = form.watch('contractAddress');
  const role = form.watch('role');
  const assigneeAddress = form.watch('assigneeAddress');

  const selectedContractId = useMemo(() => {
    return build.contractIdFromAddress(contractAddress);
  }, [contractAddress]);

  const { contract, abi } = useTypedContract({
    id: selectedContractId,
  });

  const roles = abi
    ? abi
        .filter(
          ({ type, name }) => type === 'function' && name.includes('_ROLE'),
        )
        .map((fragment) => fragment.name)
    : [];

  const { data: roleHash } = useQuery({
    enabled: !!role,
    queryKey: [selectedContractId, 'role', role],
    queryFn: () => {
      return contract?.[role]();
    },
  });

  const { config } = usePrepareContractWrite({
    abi,
    address: contractAddress,
    functionName: 'grantRole',
    args: [roleHash, assigneeAddress],
  });
  const { writeAsync } = useContractWrite(config);

  return (
    <div
      className="h-full w-full rounded-lg bg-[var(--white)] p-6 relative"
      data-s="-1"
    >
      {chain?.network !== NETWORK.SKALE ? (
        <NotSupported theme="blur">
          <CrownIcon className="mr-4" />
          &emsp;
          <strong>Assign Roles</strong> to users for various SKALE SChain
          operations.
        </NotSupported>
      ) : (
        <></>
      )}
      <div className="py-2">
        <p>Please fill in all inputs to assign role:</p>
      </div>
      <div className="grid grid-cols-2">
        <div>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                writeAsync?.();
              })}
            >
              <Field<FormData>
                name="contractAddress"
                label="Contract"
                control={() => (
                  <select>
                    {Object.values(CONTRACT)
                      .filter()
                      .map((contract) => (
                        <option value={contract.address}>
                          {contract.name}
                        </option>
                      ))}
                  </select>
                )}
                required="Contract is required"
                placeholder="Choose a contract"
              />
              <Field<FormData>
                name="role"
                label="Role"
                control={() => (
                  <select>
                    {roles.map((role) => (
                      <option value={role}>{role}</option>
                    ))}
                  </select>
                )}
                required="Contract is required"
                placeholder="Choose a role"
              />
              <Field<FormData>
                name="assigneeAddress"
                label="Assignee"
                control={() => <input type="text" />}
                required="Assignee address is required"
                placeholder="0x..."
              >
                <div className="my-2 flex flex-row gap-4">
                  <button
                    className="btn btn-outline text-sm"
                    onClick={() => {
                      form.setValue(
                        'assigneeAddress',
                        addresses.SCHAIN_MULTISIG_WALLET_ADDRESS as string,
                      );
                      form.trigger('assigneeAddress');
                    }}
                  >
                    Fill pre-deployed Multisig
                  </button>
                  <button
                    className="btn btn-outline text-sm"
                    onClick={() => {
                      form.setValue('assigneeAddress', address as string);
                      form.trigger('assigneeAddress');
                    }}
                  >
                    Fill my address
                  </button>
                </div>
              </Field>
              <button type="submit" className="btn mt-8">
                Assign Role
              </button>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

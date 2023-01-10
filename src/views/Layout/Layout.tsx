import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import useKey from 'react-use/lib/useKey';
import SideNavigation from '@/views/SideNavigation/SideNavigation';

import { ConnectKitButton } from 'connectkit';

import { useNetwork } from 'wagmi';
import { tw } from 'twind';
import {
  FcdIcon,
  GithubIcon,
  MtmIcon,
  RoleIcon,
} from '@/components/Icons/Icons';
import { useConfigController } from '@/features/interim/hooks';

export default function Layout() {
  const [inspectMode, setInspectMode] = useState(false);

  useKey(
    (e) => e.ctrlKey && e.key === '.',
    () => {
      setInspectMode(!inspectMode);
    },
  );

  const { chain } = useNetwork();
  const { flags, connected } = useConfigController();

  return (
    <>
      <header className="flex h-min w-full items-center justify-between border-b-2 border-[var(--gray3)] bg-[var(--white)] p-2 text-[var(--black)]">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-8 rounded" />
          <h3 className="">SKALE Chain UI</h3>
        </Link>
        <div className="flex items-center gap-4">
          <div className="font-mono">
            <ConnectKitButton />
          </div>
          <a href="" className="font-mono">
            <GithubIcon color="var(--black)" />
          </a>
          <a href="" className="font-mono">
            LinkIcon
          </a>
        </div>
      </header>

      <main className={`${tw`flex`} ${inspectMode ? 'inspect' : ''}`}>
        <SideNavigation />
        <section className="h-full w-full bg-[var(--gray3)] px-6 py-4">
          <Outlet />
        </section>
      </main>

      <footer
        className="
        flex h-min items-center bg-[var(--bg-color-footer)]
        px-8 py-2 text-sm text-[var(--color-footer)]"
      >
        <p>Powered by Dirt Road Dev</p>
        <p className="flex items-center justify-center gap-2 pl-24">
          {connected ? (
            <>
              <span
                className={tw`opacity-[${flags?.fcdEnabled ? '1' : '0.5'}]`}
              >
                <FcdIcon color="var(--gray10)" /> Free Contract Deployment
              </span>
              <span
                className={tw`opacity-[${flags?.mtmEnabled ? '1' : '0.5'}]`}
              >
                <MtmIcon color={'var(--gray10)'} /> Multi-transaction Mode
              </span>
            </>
          ) : (
            <></>
          )}
        </p>
        <p className="ml-auto flex items-center justify-between gap-4">
          {chain ? (
            <>
              {' '}
              <span>Chain: {chain?.name}</span>
              <span>ID: {chain?.id}</span>
              <span>Type: Staging</span>
            </>
          ) : (
            <p className="flex items-center gap-2">
              {' '}
              <span className="h-2 w-2 rounded-full bg-[var(--gray8)]"></span>{' '}
              Not Connected
            </p>
          )}
          <div className="cursor-pointer">
            <RoleIcon color={'var(--gray10)'} />
          </div>
          <button
            className="py-1"
            onClick={(e) => setInspectMode(!inspectMode)}
          >
            Dev Mode: {inspectMode ? 1 : 0}
          </button>
        </p>
      </footer>
    </>
  );
}

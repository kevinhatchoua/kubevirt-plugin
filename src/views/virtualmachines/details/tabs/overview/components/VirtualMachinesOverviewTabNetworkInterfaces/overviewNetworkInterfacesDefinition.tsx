import React, { FC } from 'react';
import { TFunction } from 'i18next';
import FirstItemListPopover from 'src/views/virtualmachines/list/components/FirstItemListPopover/FirstItemListPopover';

import VMNetworkResourceLink from '@kubevirt-utils/components/VMNetworkResourceLink/VMNetworkResourceLink';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isPodNetwork } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { removeLinkLocalIPV6 } from '@kubevirt-utils/utils/utils';

import { InterfacesData } from './utils/types';

const NameCell: FC<{ row: InterfacesData }> = ({ row }) => {
  const displayName = row?.iface?.name ?? row?.network?.name;

  if (!row.network || isPodNetwork(row.network)) {
    return (
      <div data-test={`network-interface-${row?.network?.name}`}>{displayName}</div>
    );
  }

  return (
    <div data-test={`network-interface-${row?.network?.name}`}>
      <VMNetworkResourceLink
        displayLabel={displayName}
        network={row.network}
        vmNamespace={getNamespace(row.vm)}
      />
    </div>
  );
};

const IpAddressCell: FC<{ row: InterfacesData }> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const ipAddresses = removeLinkLocalIPV6(row?.ipAddresses ?? []);

  return (
    <div data-test={`network-interface-ip-${row?.network?.name}`}>
      <FirstItemListPopover
        headerContent={t('IP addresses')}
        includeCopyFirstItem
        items={ipAddresses}
      />
    </div>
  );
};

export const getOverviewNetworkInterfacesColumns = (
  t: TFunction,
): ColumnConfig<InterfacesData, undefined>[] => [
  {
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <NameCell row={row} />,
  },
  {
    key: 'ip',
    label: t('IP address'),
    renderCell: (row) => <IpAddressCell row={row} />,
  },
];

export const getOverviewNetworkInterfaceRowId = (row: InterfacesData): string =>
  `${row.network?.name ?? 'unknown'}-${row.iface?.macAddress ?? 'no-mac'}`;

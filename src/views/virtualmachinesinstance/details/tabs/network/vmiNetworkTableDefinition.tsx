import React from 'react';
import { TFunction } from 'i18next';

import VMNetworkResourceLink from '@kubevirt-utils/components/VMNetworkResourceLink/VMNetworkResourceLink';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { VMINetworkPresentation } from '@kubevirt-utils/resources/vmi/types';

export type VMINetworkTableCallbacks = {
  vmNamespace: string;
};

export const getVMINetworkColumns = (
  t: TFunction,
): ColumnConfig<VMINetworkPresentation, VMINetworkTableCallbacks>[] => [
  {
    getValue: (r) => r.network?.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (r) => r.network?.name ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.iface?.model ?? '',
    key: 'model',
    label: t('Model'),
    renderCell: (r) => r.iface?.model ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.network?.multus?.networkName ?? (r.network?.pod ? 'pod' : ''),
    key: 'network',
    label: t('Network'),
    renderCell: (r, callbacks) =>
      r.network ? (
        <VMNetworkResourceLink network={r.network} vmNamespace={callbacks?.vmNamespace ?? ''} />
      ) : (
        NO_DATA_DASH
      ),
    sortable: true,
  },
  {
    getValue: (r) => (r.iface ? getPrintableNetworkInterfaceType(r.iface) : ''),
    key: 'type',
    label: t('Type'),
    renderCell: (r) => (r.iface ? getPrintableNetworkInterfaceType(r.iface) : NO_DATA_DASH),
    sortable: true,
  },
  {
    getValue: (r) => r.iface?.macAddress ?? '',
    key: 'macAddress',
    label: t('MAC Address'),
    renderCell: (r) => r.iface?.macAddress ?? NO_DATA_DASH,
    sortable: true,
  },
];

export const getVMINetworkRowId = (row: VMINetworkPresentation): string =>
  `${row.network?.name ?? NO_DATA_DASH}-${row.iface?.macAddress ?? NO_DATA_DASH}`;

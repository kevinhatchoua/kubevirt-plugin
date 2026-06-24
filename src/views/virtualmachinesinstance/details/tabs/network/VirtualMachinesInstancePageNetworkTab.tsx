import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';

import useVirtualMachineInstanceNetworkTab from './hooks/useVirtualMachineInstanceNetworkTab';
import { getVMINetworkColumns, getVMINetworkRowId } from './vmiNetworkTableDefinition';

import './virtual-machines-insance-page-network-tab.scss';

type VirtualMachinesInstancePageNetworkTabProps = {
  obj: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageNetworkTab: FC<VirtualMachinesInstancePageNetworkTabProps> = ({
  obj: vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [data] = useVirtualMachineInstanceNetworkTab(vmi);

  const columns = useMemo(() => getVMINetworkColumns(t), [t]);
  const callbacks = useMemo(() => ({ vmNamespace: getNamespace(vmi) }), [vmi]);

  return (
    <div className="VirtualMachinesInstancePageNetworkTab">
      <ListPageBody>
        <KubevirtTable
          ariaLabel={t('Network interfaces table')}
          callbacks={callbacks}
          columns={columns}
          data={data ?? []}
          dataTest="vmi-network-interfaces-table"
          getRowId={getVMINetworkRowId}
          initialSortKey="name"
          loaded={!!vmi}
          noDataMsg={t('No network interfaces found')}
        />
      </ListPageBody>
    </div>
  );
};

export default VirtualMachinesInstancePageNetworkTab;

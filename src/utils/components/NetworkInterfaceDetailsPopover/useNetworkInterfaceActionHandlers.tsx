import React, { useCallback } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { deleteNetworkInterface } from '@kubevirt-utils/components/NetworkInterfaceModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkInterface } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { Alert, AlertVariant, ButtonVariant } from '@patternfly/react-core';
import VirtualMachinesEditNetworkInterfaceModal from '@virtualmachines/details/tabs/configuration/network/components/modal/VirtualMachinesEditNetworkInterfaceModal';
import { getConfigInterfaceStateFromVM } from '@virtualmachines/details/tabs/configuration/network/utils/utils';
import { isRunning } from '@virtualmachines/utils';

type UseNetworkInterfaceActionHandlersProps = {
  nicName: string;
  nicPresentation: NetworkPresentation;
  vm: V1VirtualMachine;
};

const useNetworkInterfaceActionHandlers = ({
  nicName,
  nicPresentation,
  vm,
}: UseNetworkInterfaceActionHandlersProps) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const isHotPlugNIC = Boolean(nicPresentation?.iface?.bridge);
  const interfaceState = getConfigInterfaceStateFromVM(vm, nicName);
  const isInterfaceMissing = !getNetworkInterface(vm, nicName);
  const actionsDisabled =
    interfaceState === NetworkInterfaceState.ABSENT || isInterfaceMissing;

  const onConfigure = useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <VirtualMachinesEditNetworkInterfaceModal
        isOpen={isOpen}
        nicPresentation={nicPresentation}
        onClose={onClose}
        vm={vm}
      />
    ));
  }, [createModal, nicPresentation, vm]);

  const onRemove = useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <TabModal<V1VirtualMachine>
        headerText={t('Delete NIC?')}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={() => deleteNetworkInterface(vm, nicName, nicPresentation)}
        submitBtnText={t('Delete')}
        submitBtnVariant={ButtonVariant.danger}
      >
        <span>
          {isRunning(vm) && isHotPlugNIC && (
            <Alert
              title={t(
                'Deleting a network interface is supported only on VirtualMachines that were created in versions greater than 4.13.',
              )}
              component="h6"
              isInline
              variant={AlertVariant.warning}
            />
          )}
          <br />
          <ConfirmActionMessage
            obj={{ metadata: { name: nicName, namespace: vm?.metadata?.namespace } }}
          />
        </span>
      </TabModal>
    ));
  }, [createModal, isHotPlugNIC, nicName, nicPresentation, t, vm]);

  return { actionsDisabled, onConfigure, onRemove };
};

export default useNetworkInterfaceActionHandlers;

import React, { FC, ReactNode } from 'react';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import InlineCodeClipboardCopy from '@kubevirt-utils/components/Consoles/components/CloudInitCredentials/InlineCodeClipboardCopy';
import useFQDN from '@kubevirt-utils/hooks/useFQDN/useFQDN';
import useIsFQDNEnabled from '@kubevirt-utils/hooks/useFQDN/useIsFQDNEnabled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkPresentation } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { getPrintableNetworkInterfaceType } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import {
  Button,
  ButtonVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListTermHelpTextButton,
  Flex,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';

import useNetworkInterfaceActionHandlers from './useNetworkInterfaceActionHandlers';

type NetworkInterfaceDetailsPopoverProps = {
  iface?: Pick<V1Interface, 'model' | 'name'>;
  interfaceType?: string;
  network: Pick<V1Network, 'multus' | 'pod' | 'name'>;
  nicPresentation?: NetworkPresentation;
  showActions?: boolean;
  triggerLabel?: ReactNode;
  vm?: V1VirtualMachine;
};

type NetworkInterfaceDetailsPopoverActionsProps = {
  hide: () => void;
  nicName: string;
  nicPresentation: NetworkPresentation;
  vm: V1VirtualMachine;
};

const NetworkInterfaceDetailsPopoverActions: FC<NetworkInterfaceDetailsPopoverActionsProps> = ({
  hide,
  nicName,
  nicPresentation,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { actionsDisabled, onConfigure, onRemove } = useNetworkInterfaceActionHandlers({
    nicName,
    nicPresentation,
    vm,
  });

  return (
    <Flex className="pf-v6-u-mt-md" gap={{ default: 'gapSm' }}>
      <Button
        data-test-id="network-interface-configure"
        isDisabled={actionsDisabled}
        onClick={() => {
          hide();
          onConfigure();
        }}
        variant={ButtonVariant.primary}
      >
        {t('Configure')}
      </Button>
      <Button
        data-test-id="network-interface-remove"
        isDisabled={actionsDisabled}
        onClick={() => {
          hide();
          onRemove();
        }}
        variant={ButtonVariant.secondary}
      >
        {t('Remove network')}
      </Button>
    </Flex>
  );
};

const NetworkInterfaceDetailsPopover: FC<NetworkInterfaceDetailsPopoverProps> = ({
  iface,
  interfaceType,
  network,
  nicPresentation,
  showActions = false,
  triggerLabel,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const fqdn = useFQDN(network?.name, vm);
  const isFQDNEnabled = useIsFQDNEnabled();
  const nicName = network?.name;

  const networkLabel =
    getNetworkNameLabel(t, { network }) ?? network?.multus?.networkName ?? t('Pod networking');

  const resolvedNicPresentation: NetworkPresentation | undefined =
    nicPresentation ??
    (iface && network ? { iface: iface as V1Interface, network: network as V1Network } : undefined);

  const canShowActions = Boolean(showActions && vm && resolvedNicPresentation && nicName);

  const popoverFields = {
    [t('Model')]: iface?.model,
    [t('Name')]: network?.name,
    [t('Network')]: networkLabel,
    [t('Type')]: interfaceType ?? (iface ? getPrintableNetworkInterfaceType(iface) : undefined),
  };

  return (
    <Popover
      bodyContent={(hide) => (
        <>
          <PopoverContentWithLightspeedButton
            content={
              <DescriptionList isHorizontal>
                {Object.entries(popoverFields).map(([key, value]) => (
                  <DescriptionListGroup key={key}>
                    <DescriptionListTerm>{key}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {value ?? NO_DATA_DASH}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                ))}
                {isFQDNEnabled && fqdn && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>{t('FQDN')}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <InlineCodeClipboardCopy clipboardText={fqdn} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            }
            hide={hide}
            promptType={OLSPromptType.VM_NETWORKS}
          />
          {canShowActions && (
            <NetworkInterfaceDetailsPopoverActions
              hide={hide}
              nicName={nicName}
              nicPresentation={resolvedNicPresentation}
              vm={vm}
            />
          )}
        </>
      )}
      className="co-network-interface-details-popover"
      hasAutoWidth
      position={PopoverPosition.left}
      showClose
    >
      <DescriptionListTermHelpTextButton data-test-id={`network-interface-trigger-${network?.name}`}>
        {triggerLabel ?? iface?.name ?? network?.name}
      </DescriptionListTermHelpTextButton>
    </Popover>
  );
};

export default NetworkInterfaceDetailsPopover;

import React, { FC } from 'react';
import { Link } from 'react-router';
import { V1Network } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  ClusterUserDefinedNetworkModel,
  NetworkAttachmentDefinitionModel,
  NetworkAttachmentDefinitionModelGroupVersionKind,
  UserDefinedNetworkModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNetworkNameLabel } from '@kubevirt-utils/resources/vm/utils/network/network-columns';
import { getNetworkResourceDetailPath, parseMultusNetworkReference } from '@kubevirt-utils/resources/vm/utils/network/network-reference';
import { isPodNetwork } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import useVMNetworkResourceTarget, {
  VMNetworkResourceKind,
  VMNetworkResourceTarget,
} from '@kubevirt-utils/resources/vm/utils/network/useVMNetworkResourceTarget';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

type VMNetworkResourceLinkProps = {
  displayLabel?: string;
  network: Pick<V1Network, 'multus' | 'pod' | 'name'>;
  vmNamespace: string;
};

const getModelForKind = (kind: VMNetworkResourceKind): K8sModel => {
  switch (kind) {
    case 'UserDefinedNetwork':
      return UserDefinedNetworkModel;
    case 'ClusterUserDefinedNetwork':
      return ClusterUserDefinedNetworkModel;
    default:
      return NetworkAttachmentDefinitionModel;
  }
};

const getFallbackTarget = (
  multusNetworkName: string,
  vmNamespace: string,
): VMNetworkResourceTarget | undefined => {
  const parsed = parseMultusNetworkReference(multusNetworkName, vmNamespace);

  if (!parsed) {
    return undefined;
  }

  return {
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    kind: 'NetworkAttachmentDefinition',
    name: parsed.name,
    namespace: parsed.namespace,
  };
};

const VMNetworkResourceLink: FC<VMNetworkResourceLinkProps> = ({
  displayLabel: displayLabelProp,
  network,
  vmNamespace,
}) => {
  const { t } = useKubevirtTranslation();
  const displayLabel =
    displayLabelProp ??
    getNetworkNameLabel(t, { network }) ??
    network?.multus?.networkName ??
    '-';

  const multusNetworkName = network?.multus?.networkName;
  const { target } = useVMNetworkResourceTarget(multusNetworkName, vmNamespace);

  if (isPodNetwork(network)) {
    return <span data-test-id={`vm-network-pod-${network?.name}`}>{displayLabel}</span>;
  }

  if (!multusNetworkName) {
    return <span data-test-id={`vm-network-empty-${network?.name}`}>{displayLabel}</span>;
  }

  const linkTarget = target ?? getFallbackTarget(multusNetworkName, vmNamespace);

  if (!linkTarget) {
    return (
      <span data-test-id={`vm-network-unlinked-${network?.name}`}>{displayLabel}</span>
    );
  }

  const model = getModelForKind(linkTarget.kind);
  const path = getNetworkResourceDetailPath(model, linkTarget.name, linkTarget.namespace);

  return (
    <span className="co-resource-item co-resource-item--inline" data-test-id={`vm-network-link-${network?.name}`}>
      <Link className="co-resource-item__resource-name" title={displayLabel} to={path}>
        {displayLabel}
      </Link>
    </span>
  );
};

export default VMNetworkResourceLink;

import { useMemo } from 'react';

import {
  ClusterUserDefinedNetworkModelGroupVersionKind,
  NetworkAttachmentDefinitionModelGroupVersionKind,
  UserDefinedNetworkModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  ClusterUserDefinedNetworkKind,
  UserDefinedNetworkKind,
} from '@kubevirt-utils/resources/udn/types';
import { K8sGroupVersionKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { NetworkAttachmentDefinitionKind } from '@overview/OverviewTab/inventory-card/utils/types';

import { parseMultusNetworkReference } from './network-reference';

export type VMNetworkResourceKind =
  | 'NetworkAttachmentDefinition'
  | 'UserDefinedNetwork'
  | 'ClusterUserDefinedNetwork';

export type VMNetworkResourceTarget = {
  groupVersionKind: K8sGroupVersionKind;
  kind: VMNetworkResourceKind;
  name: string;
  namespace?: string;
};

type UseVMNetworkResourceTargetResult = {
  loaded: boolean;
  loadError?: unknown;
  target?: VMNetworkResourceTarget;
};

const useVMNetworkResourceTarget = (
  multusNetworkName: string | undefined,
  vmNamespace: string,
): UseVMNetworkResourceTargetResult => {
  const parsed = useMemo(
    () => parseMultusNetworkReference(multusNetworkName, vmNamespace),
    [multusNetworkName, vmNamespace],
  );

  const nadWatch = parsed
    ? {
        groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
        name: parsed.name,
        namespace: parsed.namespace,
      }
    : null;

  const udnWatch = parsed
    ? {
        groupVersionKind: UserDefinedNetworkModelGroupVersionKind,
        name: parsed.name,
        namespace: parsed.namespace,
      }
    : null;

  const cudnWatch = parsed
    ? {
        groupVersionKind: ClusterUserDefinedNetworkModelGroupVersionKind,
        name: parsed.name,
      }
    : null;

  const [nad, nadLoaded, nadError] = useK8sWatchResource<NetworkAttachmentDefinitionKind>(nadWatch);
  const [udn, udnLoaded, udnError] = useK8sWatchResource<UserDefinedNetworkKind>(udnWatch);
  const [cudn, cudnLoaded, cudnError] =
    useK8sWatchResource<ClusterUserDefinedNetworkKind>(cudnWatch);

  return useMemo(() => {
    if (!parsed) {
      return { loaded: true };
    }

    const loaded = nadLoaded && udnLoaded && cudnLoaded;
    const loadError = nadError || udnError || cudnError;

    if (!loaded) {
      return { loaded: false };
    }

    if (loadError) {
      return { loaded: true, loadError };
    }

    if (nad?.metadata?.name) {
      return {
        loaded: true,
        target: {
          groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
          kind: 'NetworkAttachmentDefinition',
          name: parsed.name,
          namespace: parsed.namespace,
        },
      };
    }

    if (udn?.metadata?.name) {
      return {
        loaded: true,
        target: {
          groupVersionKind: UserDefinedNetworkModelGroupVersionKind,
          kind: 'UserDefinedNetwork',
          name: parsed.name,
          namespace: parsed.namespace,
        },
      };
    }

    if (cudn?.metadata?.name) {
      return {
        loaded: true,
        target: {
          groupVersionKind: ClusterUserDefinedNetworkModelGroupVersionKind,
          kind: 'ClusterUserDefinedNetwork',
          name: parsed.name,
        },
      };
    }

    return { loaded: true };
  }, [cudn, cudnError, cudnLoaded, nad, nadError, nadLoaded, parsed, udn, udnError, udnLoaded]);
};

export default useVMNetworkResourceTarget;

import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export type ParsedMultusNetworkReference = {
  displayName: string;
  name: string;
  namespace: string;
};

/**
 * Parse a Multus networkName into namespace and name.
 * Formats: `<name>` (same namespace as VM) or `<namespace>/<name>`.
 */
export const parseMultusNetworkReference = (
  multusNetworkName: string | undefined,
  vmNamespace: string,
): ParsedMultusNetworkReference | null => {
  if (!multusNetworkName) {
    return null;
  }

  const slashIndex = multusNetworkName.indexOf('/');
  if (slashIndex > 0) {
    return {
      displayName: multusNetworkName,
      name: multusNetworkName.slice(slashIndex + 1),
      namespace: multusNetworkName.slice(0, slashIndex),
    };
  }

  return {
    displayName: multusNetworkName,
    name: multusNetworkName,
    namespace: vmNamespace,
  };
};

const getModelReference = (model: K8sModel): string =>
  [model.apiGroup || 'core', model.apiVersion, model.kind].join('~');

/** Console detail page path for a namespaced or cluster-scoped network resource. */
export const getNetworkResourceDetailPath = (
  model: K8sModel,
  name: string,
  namespace?: string,
): string => {
  let url = '/k8s/';

  if (model.namespaced === false) {
    url += 'cluster/';
  } else {
    url += namespace ? `ns/${namespace}/` : 'all-namespaces/';
  }

  url += getModelReference(model);
  url += `/${encodeURIComponent(name)}`;

  return url;
};

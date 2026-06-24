import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME } from './const';

export const parseNestedJSON = <T>(str: string): T => {
  try {
    return JSON.parse(str, (_, val) => {
      if (typeof val === 'string') return parseNestedJSON(val);
      return val;
    });
  } catch (exc) {
    return (<unknown>str) as T;
  }
};

const createUserConfigMap = async (
  namespace: string,
  userName: string,
  data: { [key: string]: unknown },
  cluster?: string,
) =>
  kubevirtK8sCreate<IoK8sApiCoreV1ConfigMap>({
    cluster,
    data: {
      apiVersion: 'v1',
      data: {
        [userName]: JSON.stringify(data),
      },
      kind: 'ConfigMap',
      metadata: {
        name: KUBEVIRT_USER_SETTINGS_CONFIG_MAP_NAME,
        namespace,
      },
    },
    model: ConfigMapModel,
  });

export const patchUserConfigMap = async (
  userConfigMap: IoK8sApiCoreV1ConfigMap | undefined,
  userName: string,
  data: { [key: string]: unknown },
  cluster?: string,
  namespace?: null | string,
) => {
  if (!userName) {
    throw new Error('Cannot save user settings: user is not available');
  }

  if (!userConfigMap?.metadata?.name) {
    if (!namespace) {
      throw new Error('Cannot save user settings: operator namespace is not available');
    }

    return createUserConfigMap(namespace, userName, data, cluster);
  }

  const patches: { op: string; path: string; value?: unknown }[] = [];

  if (isEmpty(userConfigMap.data)) {
    patches.push({ op: 'add', path: '/data', value: {} });
  }

  const userDataPath = `/data/${userName}`;
  const hasUserEntry = userConfigMap.data?.[userName] !== undefined;

  patches.push({
    op: hasUserEntry ? 'replace' : 'add',
    path: userDataPath,
    value: JSON.stringify(data),
  });

  return kubevirtK8sPatch<IoK8sApiCoreV1ConfigMap>({
    cluster,
    data: patches,
    model: ConfigMapModel,
    resource: userConfigMap,
  });
};

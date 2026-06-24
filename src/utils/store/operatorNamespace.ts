import { ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  KUBEVIRT_HYPERCONVERGED,
  KUBEVIRT_OS_IMAGES_NS,
  OPENSHIFT_CNV,
  OPENSHIFT_OS_IMAGES_NS,
} from '@kubevirt-utils/constants/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { k8sList, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { signal } from '@preact/signals-react';

export const operatorNamespaceSignal = signal<null | string>(null);

const resolveOperatorNamespace = async (): Promise<null | string> => {
  try {
    const projectsResponse = await k8sList<K8sResourceCommon>({
      model: ProjectModel,
      queryParams: {},
    });

    const projects = Array.isArray(projectsResponse)
      ? projectsResponse
      : projectsResponse?.items || [];

    const projectNames = new Set(projects.map((project) => getName(project)).filter(Boolean));

    if (projectNames.has(OPENSHIFT_OS_IMAGES_NS) && projectNames.has(OPENSHIFT_CNV)) {
      return OPENSHIFT_CNV;
    }

    if (projectNames.has(KUBEVIRT_OS_IMAGES_NS) && projectNames.has(KUBEVIRT_HYPERCONVERGED)) {
      return KUBEVIRT_HYPERCONVERGED;
    }

    if (projectNames.has(OPENSHIFT_CNV)) {
      return OPENSHIFT_CNV;
    }

    if (projectNames.has(KUBEVIRT_HYPERCONVERGED)) {
      return KUBEVIRT_HYPERCONVERGED;
    }
  } catch {
    // Fall through to null when CNV is not installed on this cluster.
  }

  return null;
};

resolveOperatorNamespace().then((ns) => {
  operatorNamespaceSignal.value = ns;
});

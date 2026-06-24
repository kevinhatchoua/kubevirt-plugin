import React, { ReactNode } from 'react';

import TabCountBadge from './TabCountBadge';

export const getTabCountBadge = (count: number, loaded: boolean): ReactNode =>
  loaded && count > 0 ? <TabCountBadge count={count} /> : null;

export default TabCountBadge;

import React, { FC } from 'react';

import { Badge } from '@patternfly/react-core';

import './TabCountBadge.scss';

type TabCountBadgeProps = {
  count: number;
};

const TabCountBadge: FC<TabCountBadgeProps> = ({ count }) => (
  <Badge className="co-tab-count-badge" isRead>
    {count}
  </Badge>
);

export default TabCountBadge;

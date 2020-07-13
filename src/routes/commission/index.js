import React from 'react';
import { Route } from 'react-router-dom';

import SetupElements from './routes/SetupElements';
import SetupCommission from './routes/SetupCommission';

const Commission = ({ match }) => (
  <div>
    <Route path={`${match.url}/setupElements`} component={SetupElements} />
    <Route path={`${match.url}/setupCommission`} component={SetupCommission} />
  </div>
);

export default Commission;

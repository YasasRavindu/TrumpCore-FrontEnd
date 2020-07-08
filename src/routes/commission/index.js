import React from 'react';
import { Route } from 'react-router-dom';

import SetupElements from './routes/SetupElements';

const Commission = ({ match }) => (
  <div>
    <Route path={`${match.url}/setupElements`} component={SetupElements} />
  </div>
);

export default Commission;

import React from 'react';
import { Route } from 'react-router-dom';

import Create from './routes/Create';

const Commission = ({ match }) => (
  <div>
    <Route path={`${match.url}/create`} component={Create} />
  </div>
);

export default Commission;

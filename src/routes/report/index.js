import React from 'react';
import { Route } from 'react-router-dom';

import Transaction from './routes/Transaction';

const Report = ({ match }) => (
  <div>
    <Route path={`${match.url}/transaction`} component={Transaction} />
  </div>
);

export default Report;

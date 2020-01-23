import React from 'react';
import { Route } from 'react-router-dom';

import Report01 from './routes/report01';

const Report = ({ match }) => (
  <div>
    <Route path={`${match.url}/report01`} component={Report01} />
  </div>
);

export default Report;

import React from 'react';
import { Route } from 'react-router-dom';

import Generate from './routes/Generate';
import Assign from './routes/Assign';

const Devices = ({ match }) => (
  <div>
    <Route path={`${match.url}/generate`} component={Generate} />
    <Route path={`${match.url}/assign`} component={Assign} />
  </div>
);

export default Devices;

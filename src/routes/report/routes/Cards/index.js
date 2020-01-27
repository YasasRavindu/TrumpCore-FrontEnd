import React from 'react';
import { Route } from 'react-router-dom';

import Assigned from './routes/Assigned/';
import Created from './routes/Created';

const Cards = ({ match }) => (
  <div>
    <Route path={`${match.url}/assigned`} component={Assigned} />
    <Route path={`${match.url}/created`} component={Created} />
  </div>
);

export default Cards;

import React from 'react';
import { Route } from 'react-router-dom';

import Assigned from './routes/Assigned/';
import catalog from './routes/Catalog';

const Cards = ({ match }) => (
  <div>
    <Route path={`${match.url}/assigned`} component={Assigned} />
    <Route path={`${match.url}/catalog`} component={catalog} />
  </div>
);

export default Cards;

import React from 'react';
import { Route } from 'react-router-dom';

import loadable from 'react-loadable';
import LoadingComponent from 'components/Loading';

let Transaction = loadable({
  loader: () => import('./routes/Transaction/'),
  loading: LoadingComponent,
});
let POS = loadable({
  loader: () => import('./routes/POS/'),
  loading: LoadingComponent,
});

let Cards = loadable({
  loader: () => import('./routes/Cards/'),
  loading: LoadingComponent,
});

const Report = ({ match }) => (
  <div>
    <Route path={`${match.url}/transaction`} component={Transaction} />
    <Route path={`${match.url}/pos`} component={POS} />
    <Route path={`${match.url}/cards`} component={Cards} />
  </div>
);

export default Report;

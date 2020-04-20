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
let CoreBank = loadable({
  loader: () => import('./routes/CoreBank/'),
  loading: LoadingComponent,
});
let CoreBank2 = loadable({
  loader: () => import('./routes/CoreBank2/'),
  loading: LoadingComponent,
});

const Report = ({ match }) => (
  <div>
    <Route path={`${match.url}/transaction`} component={Transaction} />
    <Route path={`${match.url}/pos`} component={POS} />
    <Route path={`${match.url}/cards`} component={Cards} />
    <Route path={`${match.url}/corebank`} component={CoreBank} />
    <Route path={`${match.url}/corebank2`} component={CoreBank2} />
  </div>
);

export default Report;

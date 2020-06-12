import React from 'react';
import { Route } from 'react-router-dom';

import Login from './routes/Login';
import ForgotPassword from './routes/ForgotPassword';

import './styles.scss';

const Page = ({ match }) => (
  <div>
    <Route path={`${match.url}/login`} component={Login} />
    <Route path={`${match.url}/forgot-password`} component={ForgotPassword} />
  </div>
);

export default Page;

import React from 'react';
import { Route } from 'react-router-dom';

import Users from './routes/users';
import Roles from './routes/roles';

const UserManagement = ({ match }) => (
  <div>
    <Route path={`${match.url}/users`} component={Users} />
    <Route path={`${match.url}/roles`} component={Roles} />
  </div>
);

export default UserManagement;

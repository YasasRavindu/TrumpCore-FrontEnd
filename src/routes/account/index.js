import React from 'react';
import { Route } from 'react-router-dom';

import Management from './routes/Management';
import Upload from './routes/Upload';

const Account = ({ match }) => (
  <div>
    <Route path={`${match.url}/management`} component={Management} />
    <Route path={`${match.url}/upload`} component={Upload} />
  </div>
);

export default Account;

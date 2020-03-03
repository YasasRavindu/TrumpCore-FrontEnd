import React from 'react';
import { Route } from 'react-router-dom';

import Management from './routes/Management';
import UploadAccount from './routes/Upload';

const Account = ({ match }) => (
  <div>
    <Route path={`${match.url}/management`} component={Management} />
    <Route path={`${match.url}/upload`} component={UploadAccount} />
  </div>
);

export default Account;

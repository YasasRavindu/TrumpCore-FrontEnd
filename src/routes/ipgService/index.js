import React from 'react';
import { Route } from 'react-router-dom';

import Management from './routes/Management';

const IpgService = ({ match }) => (
  <div>
    <Route path={`${match.url}/management`} component={Management} />
  </div>
);

export default IpgService;

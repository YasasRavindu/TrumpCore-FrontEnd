import React from 'react';
import { Route } from 'react-router-dom';

import Registation from './routes/Registration';
import Management from './routes/Management';
import Remove from './routes/Remove';

//import devices from './routes/devices';

const Devices = ({ match }) => (
  <div>
    <Route path={`${match.url}/registration`} component={Registation} />
    <Route path={`${match.url}/management`} component={Management} />
    <Route path={`${match.url}/remove`} component={Remove} />
    {/* <Route path={`${match.url}/roles`} component={Roles} /> */}
  </div>
);

export default Devices;

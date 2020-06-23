import React from 'react';
import { Route } from 'react-router-dom';
import { withRouter } from 'react-router';
import loadable from 'react-loadable';
import LoadingComponent from 'components/Loading';
import { Layout } from 'antd';
const { Content } = Layout;

let AsyncException = loadable({
  loader: () => import('routes/exception/'),
  loading: LoadingComponent,
});

let AsyncWelcome = loadable({
  loader: () => import('routes/welcome/'),
  loading: LoadingComponent,
});
let AsyncUserProfile = loadable({
  loader: () => import('routes/userProfile/'),
  loading: LoadingComponent,
});

let AsyncCardManagement = loadable({
  loader: () => import('routes/cardManagement/'),
  loading: LoadingComponent,
});
let AsyncDevices = loadable({
  loader: () => import('routes/devices/'),
  loading: LoadingComponent,
});
let AsyncUserManagement = loadable({
  loader: () => import('routes/userManagement/'),
  loading: LoadingComponent,
});
let AsyncReport = loadable({
  loader: () => import('routes/report/'),
  loading: LoadingComponent,
});
let AsyncAccount = loadable({
  loader: () => import('routes/account/'),
  loading: LoadingComponent,
});
let AsyncPayeeService = loadable({
  loader: () => import('routes/payeeService/'),
  loading: LoadingComponent,
});
let AsyncIpgService = loadable({
  loader: () => import('routes/ipgService/'),
  loading: LoadingComponent,
});

class AppContent extends React.Component {
  render() {
    const { match } = this.props;

    return (
      <Content id="app-content">
        <Route path={`${match.url}/exception`} component={AsyncException} />
        <Route path={`${match.url}/devices`} component={AsyncDevices} />
        <Route path={`${match.url}/cardManagement`} component={AsyncCardManagement} />
        <Route path={`${match.url}/userManagement`} component={AsyncUserManagement} />
        <Route path={`${match.url}/account`} component={AsyncAccount} />
        <Route path={`${match.url}/report`} component={AsyncReport} />
        <Route path={`${match.url}/payeeService`} component={AsyncPayeeService} />
        <Route path={`${match.url}/userProfile`} component={AsyncUserProfile} />
        <Route path={`${match.url}/ipgService`} component={AsyncIpgService} />
        <Route path={`${match.url}/welcome`} component={AsyncWelcome} />
      </Content>
    );
  }
}

export default withRouter(AppContent);

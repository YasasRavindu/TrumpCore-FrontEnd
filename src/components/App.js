import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import loadable from 'react-loadable';
import LoadingComponent from 'components/Loading';
import moment from 'moment';

// 3rd
import 'styles/antd.less';
import 'styles/bootstrap/bootstrap.scss';
// custom
import 'styles/layout.scss';
import 'styles/theme.scss';
import 'styles/ui.scss';
import 'styles/vendors.scss';
import COLLECTION from 'constants/authority/commonData';

let AsyncAppLayout = loadable({
  loader: () => import('components/Layout/AppLayout/'),
  loading: LoadingComponent,
});
let AsyncException = loadable({
  loader: () => import('routes/exception/'),
  loading: LoadingComponent,
});
let AsyncAccount = loadable({
  loader: () => import('routes/user/'),
  loading: LoadingComponent,
});

class App extends React.Component {
  render() {
    const { match, location } = this.props;

    const isRoot = location.pathname === '/' ? true : false;
    const isApp = location.pathname.match(/\/app\//g);
    const isUser = location.pathname.match(/\/user\//g);

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    if (isRoot || (isApp && !currentUser)) {
      //  isApp allows to let go other user routes.
      return <Redirect to={COLLECTION.ROUTE.login} />;
    }

    if (currentUser && isUser) {
      return <Redirect to={COLLECTION.ROUTE.welcome} />;
    }

    return (
      <div id="app">
        <Route path={`${match.url}app`} component={AsyncAppLayout} />
        <Route path={`${match.url}exception`} component={AsyncException} />
        <Route path={`${match.url}user`} component={AsyncAccount} />
      </div>
    );
  }
}

export default App;

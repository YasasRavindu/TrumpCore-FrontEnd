import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import loadable from 'react-loadable';
import LoadingComponent from 'components/Loading';

// 3rd
import 'styles/antd.less';
import 'styles/bootstrap/bootstrap.scss';
// custom
import 'styles/layout.scss';
import 'styles/theme.scss';
import 'styles/ui.scss';
import 'styles/vendors.scss';

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
    // const isLogin = location.pathname === '/user/login' ? true : false;
    const isApp = location.pathname.match(/\/app\//g);
    const isUser = location.pathname.match(/\/user\//g);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (isRoot) {
      // return <Redirect to={'/app/dashboard'} />;
      return <Redirect to={'/user/login'} />;
    }

    if (isApp && !currentUser) {
      return <Redirect to={'/user/login'} />;
    } else if (isUser && currentUser) {
      return <Redirect to={'/app/cardManagement/generate'} />;
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

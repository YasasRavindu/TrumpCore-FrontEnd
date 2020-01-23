import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ConnectedRouter } from 'react-router-redux';
import { Provider } from 'react-redux';
import { Route } from 'react-router-dom';
import ScrollToTop from 'components/ScrollToTop';
import APPCONFIG from 'constants/appConfig';
import App from './App';
import IdleTimer from 'react-idle-timer';
import DEMO from 'constants/demoData';

export default class Root extends Component {
  constructor(props) {
    super(props);
    this.idleTimer = null;
    this.timeout = APPCONFIG.timeout;

    // this.onAction = this._onAction.bind(this);
    // this.onActive = this._onActive.bind(this);
    this.onIdle = this._onIdle.bind(this);
  }

  // _onAction(e) {
  //   console.log('user did something', e);
  // }

  // _onActive(e) {
  //   console.log('user is active', e);
  //   console.log('time remaining', this.idleTimer.getRemainingTime());
  // }

  _onIdle(e) {
    // console.log('user is idle', e);
    // console.log('last active', this.idleTimer.getLastActiveTime());
    this.logOut();
  }

  logOut = () => {
    localStorage.removeItem('currentUser');
    window.location = DEMO.headerLink.signOut;
  };

  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <ScrollToTop>
            <>
              {/*--------------------------------------------------------------------------------*/}
              {/* IdleTimer                                                                      */}
              {/*--------------------------------------------------------------------------------*/}
              <IdleTimer
                ref={ref => {
                  this.idleTimer = ref;
                }}
                element={document}
                onActive={this.onActive}
                onIdle={this.onIdle}
                onAction={this.onAction}
                debounce={250}
                timeout={this.timeout}
              />
              <Route path="/" component={App} />
            </>
          </ScrollToTop>
        </ConnectedRouter>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import DEMO from 'constants/demoData';
import { Layout, Menu, Dropdown, Icon, Avatar, Badge, Tooltip, Popover, Divider } from 'antd';
import Logo from 'components/Logo';
import { push } from 'react-router-redux';
import { toggleCollapsedNav, toggleOffCanvasMobileNav } from 'actions/settingsActions';
import Notifications from 'routes/layout/routes/header/components/Notifications';
import { Route, Redirect, Link } from 'react-router-dom';
const { Header } = Layout;

class AppHeader extends React.Component {
  constructor(props) {
    super(props);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  avatarDropdown1 = () => {
    return (
      <Menu className="app-header-dropdown">
        {/* <Menu.Item key="4" className="d-block d-md-none">
        {' '}
        Signed in as <strong>{DEMO.user}</strong>{' '}
      </Menu.Item>
      <Menu.Divider className="d-block d-md-none" /> */}
        {/* <Menu.Item key="1" disabled>
        {' '}
        <Icon type="setting" />
        Settings{' '}
      </Menu.Item>
      <Menu.Item key="0">
        {' '}
        <a href={DEMO.headerLink.about}>
          <Icon type="info-circle-o" />
          About
        </a>{' '}
      </Menu.Item>
      <Menu.Item key="2">
        {' '}
        <a href={DEMO.headerLink.help}>
          <Icon type="question-circle-o" />
          Need Help?
        </a>{' '}
      </Menu.Item> */}
        <Menu.Item key="2">
          <a href={'/app/userProfile'}>
            <Icon type="setting" />
            Settings
          </a>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3">
          <span onClick={this.logOut}>
            <Icon type="logout" />
            Sign out
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  onToggleCollapsedNav = () => {
    const { handleToggleCollapsedNav, collapsedNav } = this.props;
    handleToggleCollapsedNav(!collapsedNav);
  };

  onToggleOffCanvasMobileNav = () => {
    const { handleToggleOffCanvasMobileNav, offCanvasMobileNav } = this.props;
    handleToggleOffCanvasMobileNav(!offCanvasMobileNav);
  };

  logOut = () => {
    localStorage.removeItem('currentUser');
    window.location = DEMO.headerLink.signOut;
  };

  render() {
    const { collapsedNav, offCanvasMobileNav, colorOption, showLogo } = this.props;

    return (
      <Header className="app-header">
        <div
          className={classnames('app-header-inner', {
            'bg-white': ['11', '12', '13', '14', '15', '16', '21'].indexOf(colorOption) >= 0,
            'bg-dark': colorOption === '31',
            'bg-primary': ['22', '32'].indexOf(colorOption) >= 0,
            'bg-success': ['23', '33'].indexOf(colorOption) >= 0,
            'bg-info': ['24', '34'].indexOf(colorOption) >= 0,
            'bg-warning': ['25', '35'].indexOf(colorOption) >= 0,
            'bg-danger': ['26', '36'].indexOf(colorOption) >= 0,
          })}
        >
          <div className="header-left">
            <div className="list-unstyled list-inline">
              {showLogo && [<Logo key="logo" />, <Divider type="vertical" key="line" />]}

              <span
                className="header-link list-inline-item d-none d-md-inline-block"
                onClick={this.onToggleCollapsedNav}
              >
                <Icon type={collapsedNav ? 'menu-unfold' : 'menu-fold'} className="list-icon" />
              </span>
              <span
                className="header-link list-inline-item d-md-none"
                onClick={this.onToggleOffCanvasMobileNav}
              >
                <Icon
                  type={offCanvasMobileNav ? 'menu-unfold' : 'menu-fold'}
                  className="list-icon"
                />
              </span>

              {/* <a
                href={DEMO.link}
                className="list-inline-item d-none d-md-inline-block"
                onClick={this.onToggleCollapsedNav}
              >
                <Icon type={collapsedNav ? 'menu-unfold' : 'menu-fold'} className="list-icon" />
              </a>
              <a
                href={DEMO.link}
                className="list-inline-item d-md-none"
                onClick={this.onToggleOffCanvasMobileNav}
              >
                <Icon
                  type={offCanvasMobileNav ? 'menu-unfold' : 'menu-fold'}
                  className="list-icon"
                />
              </a> */}
              {/* <Tooltip placement="bottom" title="UI Overview">
                <a href="#/app/ui-overview" className="list-inline-item d-none d-md-inline-block">
                  <Icon type="shop" className="list-icon" />
                </a>
              </Tooltip> */}
            </div>
          </div>

          <div className="header-right">
            <div className="list-unstyled list-inline">
              {/* <li className="list-inline-item search-box seach-box-right d-none d-md-inline-block">
                <div className="search-box-inner">
                  <div className="search-box-icon">
                    <Icon type="search" />
                  </div>
                  <input type="text" placeholder="search..." />
                  <span className="input-bar" />
                </div>
              </li>
              <Popover
                placement="bottomRight"
                content={<Notifications />}
                trigger="click"
                overlayClassName="app-header-popover"
              >
                <a href={DEMO.link} className="list-inline-item">
                  <Badge count={11}>
                    <Icon type="bell" className="list-notification-icon" />
                  </Badge>
                </a>
              </Popover> */}
              <Dropdown
                className="list-inline-item"
                overlay={this.avatarDropdown1}
                trigger={['click']}
                placement="bottomRight"
              >
                <span className="header-link ant-dropdown-link">
                  <Avatar src="/assets/images-demo/avatars/6.png" size="small" />
                  <span className="avatar-text d-none d-md-inline">
                    {this.currentUser && this.currentUser.accName
                      ? this.currentUser.accName
                      : 'user'}
                  </span>
                </span>

                {/* <a className="ant-dropdown-link no-link-style" href={DEMO.link}>
                  <Avatar src="/assets/images-demo/avatars/6.png" size="small" />
                  <span className="avatar-text d-none d-md-inline">
                    {this.currentUser && this.currentUser.accName
                      ? this.currentUser.accName
                      : 'user'}
                  </span>
                </a> */}
              </Dropdown>
            </div>
          </div>
        </div>
      </Header>
    );
  }
}

const mapStateToProps = state => ({
  offCanvasMobileNav: state.settings.offCanvasMobileNav,
  collapsedNav: state.settings.collapsedNav,
  colorOption: state.settings.colorOption,
});

const mapDispatchToProps = dispatch => ({
  handleToggleCollapsedNav: isCollapsedNav => {
    dispatch(toggleCollapsedNav(isCollapsedNav));
  },
  handleToggleOffCanvasMobileNav: isOffCanvasMobileNav => {
    dispatch(toggleOffCanvasMobileNav(isOffCanvasMobileNav));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);

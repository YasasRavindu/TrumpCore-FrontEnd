import React from 'react';
import { Form, Icon, Input, Button, notification } from 'antd';
import { withRouter } from 'react-router-dom';
import APPCONFIG from 'constants/appConfig';
import CUSTOM_MESSAGE from 'constants/notification/message';
import DEMO from 'constants/demoData';
import { environment, commonUrl } from '../../../../../environments';
import axios from 'axios';
const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };

    // --------------------- placement ---------------------
    // ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
    notification.config({
      placement: 'topRight',
    });
    // -----------------------------------------------------
  }

  openNotificationWithIcon = (type, msg) => {
    notification[type]({
      message: type === 'error' ? 'Login Error!' : 'Login Success!',
      description: msg,
    });
  };

  showLoginReqError = error => {
    let msg = null;
    if (
      error &&
      error.response &&
      error.response.data &&
      error.response.data.validationFailures &&
      error.response.data.validationFailures[0] &&
      error.response.data.validationFailures[0].code
    ) {
      let errorCode = error.response.data.validationFailures[0].code;
      msg = CUSTOM_MESSAGE.LOGIN_ERROR[errorCode];
      if (msg === undefined) {
        msg = CUSTOM_MESSAGE.LOGIN_ERROR['defaultError'];
      }
    } else {
      msg = CUSTOM_MESSAGE.LOGIN_ERROR['defaultError'];
    }
    return msg;
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios
          .post(environment.baseUrl + 'platform-users/login', {
            username: values.username,
            password: values.password,
          })
          .then(response => {
            console.log('------------------- response - ', response);
            let currentUser = response.data.content;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            this.openNotificationWithIcon('success', 'Welcome To TrumpCore!');
            this.props.history.push('/app/cardManagement/generate');
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            this.openNotificationWithIcon('error', this.showLoginReqError(error));
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <section className="form-v1-container">
        <h2>Login to Continue</h2>
        <p className="lead">Welcome back, sign in with your {APPCONFIG.brand} account</p>

        <div className="divider divider-with-content my-4">
          <span className="divider-inner-content" />
        </div>
        <Form onSubmit={this.handleSubmit} className="form-v1">
          <FormItem>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(
              <Input
                size="large"
                prefix={<Icon type="user" style={{ fontSize: 13 }} />}
                placeholder="Username"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your Password!' }],
            })(
              <Input
                size="large"
                prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
                type="password"
                placeholder="Password"
              />
            )}
          </FormItem>
          {/* <FormItem className="form-v1__remember">
            {getFieldDecorator('login2-remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(<Checkbox>Remember me</Checkbox>)}
          </FormItem> */}
          <FormItem>
            <Button type="primary" htmlType="submit" className="btn-cta btn-block">
              Log in
            </Button>
          </FormItem>
        </Form>
        <p className="additional-info">
          {/* Don't have an account yet? <a href={DEMO.signUp}>Sign up</a> */}
          Don't have an account yet? <a>Sign up</a>
        </p>
        <p className="additional-info">
          {/* Forgot your username or password? <a href={DEMO.forgotPassword}>Reset password</a> */}
          Forgot your username or password? <a>Reset password</a>
        </p>
      </section>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(withRouter(NormalLoginForm));

export default WrappedNormalLoginForm;

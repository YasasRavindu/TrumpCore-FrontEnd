import React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import { withRouter } from 'react-router-dom';
import APPCONFIG from 'constants/appConfig';
import DEMO from 'constants/demoData';
import { environment, commonUrl } from '../../../../../environments';
import axios from 'axios';
const FormItem = Form.Item;

class NormalLoginForm extends React.Component {
  state = {
    username: '',
    password: '',
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.setState(
          {
            username: values.username,
            password: values.password,
          },
          () => {
            axios
              .post(environment.baseUrl + 'platform-users/login', {
                username: this.state.username,
                password: this.state.password,
              })
              .then(response => {
                if (response.status == 200) {
                }
                console.log('------------------- response - ', response);
                //return response;
              })
              .catch(error => {
                console.log('------------------- error - ', error);
                //return error;
              });
          }
        );
        //this.props.history.push(DEMO.home2);
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

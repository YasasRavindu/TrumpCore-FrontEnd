import React from 'react';
import { Form, Icon, Input, Button, message } from 'antd';
import { withRouter } from 'react-router-dom';
import DEMO from 'constants/demoData';
import getErrorMessage from 'constants/notification/message';
import { environment, commonUrl } from 'environments';
import axios from 'axios';
const FormItem = Form.Item;

class NormalForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.setState({
        loading: true,
      });
      if (!err) {
        //console.log('Received values of form: ', values.email);
        // this.props.history.push(DEMO.home2);
        axios
          .get(environment.baseUrl + 'platform-users/resetPassword/' + values.email)
          .then(response => {
            console.log('------------------- response - ', response.data.content);
            message.success(
              'A link has been sent to the email you entered. You can reset your password by clicking on the link.!',
              5
            );
            this.setState({
              loading: false,
            });
            this.props.form.resetFields();
            this.props.history.push('/user/login');
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            message.error(getErrorMessage(error, 'RESETPASSWORD_RESET_ERROR'));
            this.setState({
              loading: false,
            });
            this.props.form.resetFields();
          });
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <section className="form-v1-container">
        <h2>Forgot Password?</h2>
        <p className="additional-info col-lg-10 mx-lg-auto mb-3">
          Enter the email address you used when you joined and we’ll send you instructions to reset
          your password.
        </p>
        <Form onSubmit={this.handleSubmit} className="form-v1">
          <FormItem className="mb-3">
            {getFieldDecorator('email', {
              rules: [
                { type: 'email', message: 'The input is not valid E-mail!' },
                { required: true, message: 'Please input your email!' },
              ],
            })(
              <Input
                size="large"
                prefix={<Icon type="mail" style={{ fontSize: 13 }} />}
                placeholder="Email"
              />
            )}
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              loading={this.state.loading}
              htmlType="submit"
              className="btn-cta btn-block"
            >
              Send Reset Instructions
            </Button>
          </FormItem>
        </Form>
        <p className="additional-info">
          Do you want go to back? <a href="/user/login">Login</a>
        </p>
      </section>
    );
  }
}

const WrappedNormalForm = Form.create()(withRouter(NormalForm));

export default WrappedNormalForm;

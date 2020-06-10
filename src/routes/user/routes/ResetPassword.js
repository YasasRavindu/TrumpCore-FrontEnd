import React from 'react';
import { Form, Icon, Input, Button, message } from 'antd';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import getErrorMessage from 'constants/notification/message';
import { environment, commonUrl } from 'environments';
const FormItem = Form.Item;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      token: undefined,
      userId: undefined,
      verifyToken: undefined,
    };
    this.url = this.props.location.pathname;
  }

  async componentDidMount() {
    this._isMounted = true;
    this.checkUrl();
  }
  checkUrl() {
    const parts = this.url.split('/');
    console.log(parts);
    if (
      parts.length >= 5 &&
      parts[1] === 'user' &&
      parts[2] === 'resetForm' &&
      parts[3].length > 0 &&
      parts[4].length > 0
    ) {
      this.setState(
        {
          token: parts[3],
          userId: parts[4],
        },
        () => {
          axios
            .get(
              environment.baseUrl +
                'platform-users/resetForm/' +
                this.state.token +
                '/' +
                this.state.userId
            )
            .then(response => {
              console.log('------------------- response - ', response);
              this.setState({
                verifyToken: true,
              });
            })
            .catch(error => {
              console.log('------------------- error - ', error);
              message.error(getErrorMessage(error, 'RESETPASSWORD_LINK_ERROR'));
              this.setState({
                verifyToken: false,
              });
            });
        }
      );
    } else {
      this.setState({
        verifyToken: null,
      });
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (this.state.userId) {
          axios
            .put(environment.baseUrl + 'platform-users/updatePassword', {
              id: this.state.userId,
              password: values.password,
              newPassword: values.confirm,
            })
            .then(response => {
              message.success('Your password has been changed successfully');
              console.log('------------------- response - ', response);
              this.props.form.resetFields();
              this.props.history.push('/user/login');
            })
            .catch(error => {
              console.log('------------------- error - ', error);
              message.error(getErrorMessage(error, 'RESETPASSWORD_CHANGE_ERROR'));
              this.props.form.resetFields();
            });
        } else {
          message.error('Something Wrong!');
          this.props.form.resetFields();
        }
      }
    });
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { verifyToken } = this.state;
    return (
      <section className="cover cover-page">
        <div
          className="cover-bg-img"
          style={{
            backgroundImage:
              "url('/assets/images-demo/covers/bench-accounting-49909-unsplash-lg.jpg')",
          }}
        ></div>
        <div className="cover-form-container">
          <div className="col-12 col-md-8 col-lg-6 col-xl-4">
            {verifyToken === true ? (
              <section className="form-v1-container">
                <h2>Reset Password?</h2>
                <p className="additional-info col-lg-10 mx-lg-auto mb-3">
                  Add a new password conforming to the password criteria. Confirm on the new
                  password to save changes.
                </p>
                <Form onSubmit={this.handleSubmit} className="form-v1">
                  <FormItem className="mb-3">
                    {getFieldDecorator('password', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your password!',
                        },
                        {
                          validator: this.validateToNextPassword,
                        },
                        { min: 5, message: 'Password must be minimum 5 characters.' },
                      ],
                    })(<Input.Password placeholder="Password" />)}
                  </FormItem>
                  <FormItem className="mb-3">
                    {getFieldDecorator('confirm', {
                      rules: [
                        {
                          required: true,
                          message: 'Please confirm your password!',
                        },
                        {
                          validator: this.compareToFirstPassword,
                        },
                        { min: 5, message: 'Password must be minimum 5 characters.' },
                      ],
                    })(
                      <Input.Password
                        placeholder="Confirm Password"
                        onBlur={this.handleConfirmBlur}
                      />
                    )}
                  </FormItem>
                  <FormItem>
                    <Button
                      type="primary"
                      placeholder="Password"
                      htmlType="submit"
                      className="btn-cta btn-block"
                    >
                      Reset Password
                    </Button>
                  </FormItem>
                </Form>
                <p className="additional-info">
                  Do you want go to back? <a href="/user/login">Login</a>
                </p>
              </section>
            ) : verifyToken === false ? (
              <section className="form-v1-container">
                <h2>The Link is expire or Invalid</h2>
              </section>
            ) : verifyToken === undefined ? (
              <section className="form-v1-container">
                <h2>Loading...</h2>
              </section>
            ) : (
              <section className="form-v1-container">
                <h2>The URL is wrong...</h2>
              </section>
            )}
          </div>
        </div>
      </section>
    );
  }
}

const ResetPassword = Form.create()(withRouter(Data));
export default ResetPassword;

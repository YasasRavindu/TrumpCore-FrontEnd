import React from 'react';
import { Table, Icon, Input, Button, Modal, Form, Tag, Divider, Row, Col, message } from 'antd';
import { environment, commonUrl } from '../../environments';
import axios from 'axios';
import picture_avatar from '../../assets/images/6.png';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (this.currentUser && this.currentUser.id) {
          axios
            .post(environment.baseUrl + 'platform-users/changePassword', {
              id: this.currentUser.id,
              newPass: values.password,
              confirmPass: values.confirm,
            })
            .then(response => {
              message.success('Your password has been changed successfully');
              console.log('------------------- response - ', response);
              this.props.form.resetFields();
            })
            .catch(error => {
              message.error('Something Wrong!');
              console.log('------------------- error - ', error);
            });
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
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <article className="article">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <article className="profile-card-v2 h-100">
                <h4>Profile Details</h4>
                <div className="divider divider-solid my-4" />
                <div
                  style={{
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={picture_avatar}
                    alt="avatar"
                    style={{ width: '100%' }}
                    className="no_border"
                  />
                </div>
                <h3 className="mt-2">{this.currentUser && this.currentUser.accName}</h3>
                <div className="mt-2 mb-4"></div>
              </article>
            </div>

            <div className="col-lg-8 mb-8">
              <article className="profile-card-v2 h-100">
                <h4>Change Password</h4>
                <div className="divider divider-solid my-4" />
                <div>
                  <Form onSubmit={this.handleSubmit}>
                    <Row gutter={24}>
                      <Col span={8} order={1}>
                        <Form.Item label="Password" hasFeedback>
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
                          })(<Input.Password />)}
                        </Form.Item>
                      </Col>
                      <Col span={8} order={2}>
                        <Form.Item label="Confirm Password" hasFeedback>
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
                          })(<Input.Password onBlur={this.handleConfirmBlur} />)}
                        </Form.Item>
                      </Col>
                      <Col span={8} order={3}>
                        <Form.Item>
                          <Button className="mt-4" type="primary" htmlType="submit">
                            Change
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </article>
            </div>
          </div>
        </article>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);
const UserProfile = () => <WrappedData />;

export default UserProfile;

import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {
  Table,
  Icon,
  Input,
  Button,
  Modal,
  Form,
  Tag,
  Divider,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  message,
  Badge,
  AutoComplete,
  Tooltip,
  Upload,
  Breadcrumb,
  Alert,
} from 'antd';

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import moment from 'moment';
import profile_avatar from '../../../assets/images/profile_avatar.png';
import picture_attachment_avatar from '../../../assets/images/picture_attachment_avatar.jpg';

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
const dateFormat = 'YYYY-MM-DD';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
}

function convertImgToBase64URL(url, callback, outputFormat) {
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    var canvas = document.createElement('CANVAS'),
      ctx = canvas.getContext('2d'),
      dataURL;
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    dataURL = canvas.toDataURL(outputFormat);
    callback(dataURL);
    canvas = null;
  };
  img.src = url;
}

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      pageNo: 1,
      simProviderList: [],
      accountList: [],
      filteredAccountList: [],
      selectedAccount: undefined,
      kycModalVisible: false,
      kycImgModalVisible: false,
      simNoModalVisible: false,
      dobModalVisible: false,
      simRegModalVisible: false,
      loadingKYC: false,
      profileImageUrl: '',
      identityImage: '',
      tempIdentityImage: '',
      dob: undefined,
      loading: false,
      kycImgError: false,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadData();
  }

  loadData = () => {
    axios
      .post(environment.baseUrl + 'account/filterSearch', {
        status: '',
        context: 'all',
        cardAssigned: '',
      })
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const accountList = response.data.content.map(account => {
          account.key = account.id;
          return account;
        });
        this._isMounted &&
          this.setState({
            accountList: accountList,
            filteredAccountList: accountList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
    axios
      .get(environment.baseUrl + 'maintenance/searchProviders')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const simProviderList = response.data.content;
        this._isMounted &&
          this.setState({
            simProviderList: simProviderList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  async viewAccount(id) {
    await axios
      .get(environment.baseUrl + 'account/' + id)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        let selectedAccount = response.data.content;
        this.updateIdentityImage(selectedAccount);
        axios
          .get(environment.baseUrl + 'maintenance/account/' + selectedAccount.id)
          .then(response => {
            console.log('------------------- response - ', response.data.content);
            selectedAccount['simRegistry'] = response.data.content;
            this.updateAccount(selectedAccount);
            console.log('------------------- selectedAccount - ', selectedAccount);
          })
          .catch(error => {
            this.updateAccount(selectedAccount);
            console.log('------------------- error - ', error);
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  }

  dataFilter = e => {
    let searchText = e.target.value;
    let data = this.state.accountList;
    if (data.length > 0 && searchText && searchText !== '') {
      data = data.filter(d => {
        return (
          d.holder.toLowerCase().includes(searchText.toLowerCase()) ||
          d.accountNumber.toLowerCase().includes(searchText.toLowerCase())
        );
      });
    }
    this._isMounted &&
      this.setState({
        filteredAccountList: data,
      });
  };

  updateIdentityImage(selectedAccount) {
    let newThis = this;
    const url = environment.baseUrl + 'file/downloadImg/identification/' + selectedAccount.id;
    convertImgToBase64URL(url, function(base64Img) {
      newThis._isMounted &&
        newThis.setState({
          identityImage: base64Img,
          tempIdentityImage: base64Img,
        });
    });
  }

  updateAccount(selectedAccount) {
    this._isMounted &&
      this.setState({
        selectedAccount: selectedAccount,
        profileImageUrl: environment.baseUrl + 'file/downloadImg/account/' + selectedAccount.id,
      });
  }

  resetAccount = () => {
    this._isMounted &&
      this.setState({
        selectedAccount: undefined,
        kycModalVisible: false,
        kycImgModalVisible: false,
        simNoModalVisible: false,
        dobModalVisible: false,
        simRegModalVisible: false,
        loadingKYC: false,
        profileImageUrl: '',
        identityImage: '',
        tempIdentityImage: '',
        dob: undefined,
        loading: false,
        kycImgError: false,
      });
  };

  toggleModal = key => {
    const { selectedAccount, identityImage } = this.state;
    let value = false;
    if (key === 'kycModalVisible') {
      value = !this.state.kycModalVisible;
      if (value) {
        this.props.form.setFieldsValue({
          identityNo: selectedAccount.identityNo === null ? '' : selectedAccount.identityNo,
        });
      } else {
        this.setState({
          tempIdentityImage: identityImage,
        });
      }
    } else if (key === 'simNoModalVisible') {
      value = !this.state.simNoModalVisible;
      if (value) {
        this.props.form.setFieldsValue({
          simNo:
            selectedAccount.simRegistry && selectedAccount.simRegistry.simNo
              ? selectedAccount.simRegistry.simNo
              : '',
        });
      }
    } else if (key === 'dobModalVisible') {
      value = !this.state.dobModalVisible;
      if (value) {
        this.props.form.setFieldsValue({
          dob:
            selectedAccount.simRegistry && selectedAccount.simRegistry.dob
              ? moment(selectedAccount.simRegistry.dob, dateFormat)
              : '',
        });
      }
    } else if (key === 'kycImgModalVisible') {
      value = !this.state.kycImgModalVisible;
    } else if (key === 'simRegModalVisible') {
      value = !this.state.simRegModalVisible;
    }

    this._isMounted &&
      this.setState({
        [key]: value,
        kycImgError: false,
      });
  };

  handleChangeKYC = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loadingKYC: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, tempIdentityImage => {
        this.setState({
          tempIdentityImage,
          loadingKYC: false,
          kycImgError: false,
        });
      });
    }
  };

  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, profileImageUrl =>
        this.setState(
          {
            profileImageUrl,
            loading: false,
          },
          () => {
            if (this.state.profileImageUrl && this.state.selectedAccount) {
              axios
                .post(environment.baseUrl + 'file/commonImageUpload', {
                  context: 'account',
                  contextId: this.state.selectedAccount.id,
                  imgString: this.state.profileImageUrl.split(',').pop(),
                })
                .then(response => {
                  console.log('------------------- response - ', response.data.content);
                  message.success('Successfully uploaded!');
                })
                .catch(error => {
                  console.log('------------------- error - ', error);
                  message.error('Something went wrong!');
                });
            } else {
              message.error('Something went wrong!');
              this.setState({
                profileImageUrl: '',
              });
            }
          }
        )
      );
    }
  };

  submitKYC = () => {
    const { selectedAccount, tempIdentityImage } = this.state;
    if (selectedAccount !== undefined) {
      this.props.form.validateFields(['identityNo'], (err, values) => {
        if (!err) {
          if (tempIdentityImage !== '') {
            axios
              .put(environment.baseUrl + 'account/updateKYC/' + selectedAccount.id, {
                identityNo: values.identityNo,
                identityImg: tempIdentityImage.split(',')[1],
              })
              .then(response => {
                console.log('------------------- response - ', response.data.content);
                selectedAccount.identityNo = values.identityNo;
                selectedAccount.identityImg = tempIdentityImage;
                this.setState({
                  selectedAccount,
                  identityImage: tempIdentityImage,
                });
                this.toggleModal('kycModalVisible');
              })
              .catch(error => {
                console.log('------------------- error - ', error);
              });
          } else {
            this.setState({
              kycImgError: true,
            });
          }
        }
      });
    }
  };

  submitSIMNO = () => {
    this.props.form.validateFields(['simNo'], (err, values) => {
      if (!err) {
        const { selectedAccount } = this.state;
        if (selectedAccount.simRegistry !== undefined) {
          selectedAccount.simRegistry.simNo = values.simNo;
          this.updateSimRegistry('simNoModalVisible');
        }
      }
    });
  };

  submitDob = () => {
    this.props.form.validateFields(['dob'], (err, values) => {
      if (!err) {
        const { selectedAccount } = this.state;
        if (selectedAccount.simRegistry !== undefined) {
          this.updateSimRegistry('dobModalVisible');
        }
      }
    });
  };

  submitSimReg = () => {
    const { selectedAccount, dob } = this.state;
    this.props.form.validateFields(
      ['firstName', 'lastName', 'gender', 'dob', 'simProvider', 'mobileNo', 'simNo'],
      (err, values) => {
        if (!err) {
          axios
            .post(environment.baseUrl + 'maintenance/saveRegistry', {
              firstName: values.firstName,
              lastName: values.lastName,
              simNo: values.simNo,
              mobileNo: values.mobileNo,
              dob: dob,
              gender: values.gender,
              account: {
                id: selectedAccount.id,
              },
              provider: {
                id: values.simProvider,
              },
            })
            .then(response => {
              console.log('------------------- response - ', response.data.content);
              this.toggleModal('simRegModalVisible');
              this.props.form.resetFields();
              this.viewAccount(selectedAccount.id);
            })
            .catch(error => {
              console.log('------------------- error - ', error);
            });
        }
      }
    );
  };

  dateHandler = (date, dateString) => {
    this.setState({
      dob: dateString,
    });
  };

  paginationHandler = (pageNo, pageSize) => {
    this.setState({
      pageNo,
    });
  };

  updateSimRegistry(key) {
    const { selectedAccount, dob } = this.state;
    let newDob = dob !== undefined ? dob : selectedAccount.simRegistry.dob;
    console.log(newDob);

    if (selectedAccount.simRegistry !== undefined) {
      axios
        .put(environment.baseUrl + 'maintenance/updateRegistry', {
          id: selectedAccount.simRegistry.id,
          simNo: selectedAccount.simRegistry.simNo,
          dob: newDob,
        })
        .then(response => {
          console.log('------------------- response - ', response.data.content);
          selectedAccount.simRegistry.dob = newDob;
          this.toggleModal(key);
        })
        .catch(error => {
          console.log('------------------- error - ', error);
        });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const uploadButton = (
      <div>
        <Icon type={this.state.loadingKYC ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    const { getFieldDecorator } = this.props.form;
    const {
      pageNo,
      simProviderList,
      filteredAccountList,
      selectedAccount,
      kycModalVisible,
      kycImgModalVisible,
      simNoModalVisible,
      dobModalVisible,
      simRegModalVisible,
      profileImageUrl,
      identityImage,
      tempIdentityImage,
    } = this.state;

    return (
      <>
        <div className="container-fluid no-breadcrumb container-mw chapter">
          {selectedAccount === undefined && (
            <div className="box box-default">
              <div className="box-header">Account Management</div>
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col span={12}>
                      <FormItem>
                        <Input.Search
                          placeholder="Search here..."
                          onChange={this.dataFilter}
                          style={{ width: '100% ' }}
                        />
                      </FormItem>
                    </Col>
                    {/* <Col span={6}>
                      <FormItem>
                        <Select placeholder="Search Type" defaultValue="name">
                          <Option value="name">Holder Name</Option>
                          <Option value="number">Account Number</Option>
                        </Select>
                      </FormItem>
                    </Col> */}
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table
                    dataSource={filteredAccountList}
                    pagination={{ current: pageNo, onChange: this.paginationHandler }}
                  >
                    <Column title="Holder Name" dataIndex="holder" key="holder" />
                    <Column title="Account Number" dataIndex="accountNumber" key="accountNumber" />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          <Tooltip title="View">
                            <Icon onClick={() => this.viewAccount(record.id)} type="menu-unfold" />
                          </Tooltip>
                        </span>
                      )}
                    />
                  </Table>
                </article>
              </div>
            </div>
          )}

          {selectedAccount !== undefined && (
            <>
              <article className="article">
                <div className="row">
                  <Button
                    type="primary"
                    //shape="circle"
                    icon="arrow-left"
                    size="default"
                    className="float-left"
                    onClick={() => this.resetAccount()}
                  >
                    Back
                  </Button>
                  <h2 className="article-title mr-5">Account View</h2>
                </div>
                <div className="row">
                  <div className="col-lg-4 mb-4">
                    <article className="profile-card-v2 h-100">
                      <h4>Account Details</h4>
                      <div className="divider divider-solid my-4" />

                      <div>
                        <Upload
                          name="avatar"
                          listType="picture-card"
                          showUploadList={false}
                          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                          beforeUpload={beforeUpload}
                          onChange={this.handleChange}
                        >
                          {profileImageUrl ? (
                            <img
                              src={profileImageUrl}
                              alt="avatar"
                              className="no_border"
                              onError={e => {
                                e.target.onerror = null;
                                e.target.src = profile_avatar;
                              }}
                            />
                          ) : (
                            uploadButton
                          )}
                        </Upload>
                      </div>

                      <div className="mt-2 mb-4">
                        {selectedAccount.holder && <h5>{selectedAccount.holder}</h5>}
                        <h5>
                          Create Date -{' '}
                          {selectedAccount.createdDateTime
                            ? selectedAccount.createdDateTime.split('T')[0]
                            : ' - '}
                        </h5>
                        <h5>
                          Account No -{' '}
                          {selectedAccount.accountNumber ? selectedAccount.accountNumber : ' - '}
                        </h5>
                      </div>
                    </article>
                  </div>

                  <div className="col-lg-4 mb-4">
                    <article className="profile-card-v2 h-100">
                      <h4>Identity Card Details</h4>
                      <div className="divider divider-solid my-4" />

                      {!(selectedAccount.identityImg && selectedAccount.identityNo) && (
                        <div className="mt-1 mb-4">
                          <h3 className="hero-title">Not Updated Yet!</h3>
                          <p className="hero-lead">
                            KYC details have not yet updated. You can update it here.
                          </p>
                          <div className="hero-cta">
                            <Button onClick={() => this.toggleModal('kycModalVisible')}>
                              Update KYC
                            </Button>
                          </div>
                        </div>
                      )}

                      {selectedAccount.identityImg && selectedAccount.identityNo && (
                        <>
                          <img
                            src={identityImage}
                            alt="avatar"
                            className="no_border"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = picture_attachment_avatar;
                            }}
                          />
                          <div className="mt-1 mb-4">
                            <Button
                              className="mt-2"
                              type="default"
                              shape="circle"
                              icon="eye-o"
                              size="default"
                              onClick={() => this.toggleModal('kycImgModalVisible')}
                            />
                          </div>
                          <div className="mt-4 mb-4">
                            <h5>ID No -{selectedAccount.identityNo}</h5>
                          </div>
                          <div>
                            <Button
                              type="default"
                              shape="circle"
                              icon="edit"
                              size="default"
                              onClick={() => this.toggleModal('kycModalVisible')}
                            />
                          </div>
                        </>
                      )}
                    </article>
                  </div>

                  <div className="col-lg-4 mb-4">
                    <article className="profile-card-v2 h-100">
                      <h4>SIM Registry Details</h4>
                      <div className="divider divider-solid my-4" />

                      {selectedAccount.simRegistry === undefined && (
                        <div className="mt-1 mb-4">
                          <h3 className="hero-title">No SIM Registry Details!</h3>
                          <p className="hero-lead">
                            There is no SIM Registry Record for this Account. If you need, You can
                            create it here.
                          </p>
                          <div className="hero-cta">
                            <Button onClick={() => this.toggleModal('simRegModalVisible')}>
                              Add SIM Registry Details
                            </Button>
                          </div>
                        </div>
                      )}

                      {selectedAccount.simRegistry && (
                        <div className="mt-4 mb-4">
                          <Row>
                            <Col span={24}>
                              <h5 className="mt-2 mb-4 ml-4" style={{ textAlign: 'left' }}>
                                Mobile No -{' '}
                                {selectedAccount.simRegistry.mobileNo
                                  ? selectedAccount.simRegistry.mobileNo
                                  : ' NaN '}
                              </h5>
                            </Col>
                          </Row>

                          <Row>
                            <Col span={18}>
                              <h5 className="mt-2 mb-2 ml-4" style={{ textAlign: 'left' }}>
                                SIM No -{' '}
                                {selectedAccount.simRegistry.simNo
                                  ? selectedAccount.simRegistry.simNo
                                  : ' NaN '}
                              </h5>
                            </Col>
                            <Col span={6}>
                              <div className="mb-4">
                                <Button
                                  type="default"
                                  shape="circle"
                                  icon="edit"
                                  size="default"
                                  onClick={() => this.toggleModal('simNoModalVisible')}
                                />
                              </div>
                            </Col>
                          </Row>

                          <Row>
                            <Col span={18}>
                              <h5 className="mt-2 mb-2 ml-4" style={{ textAlign: 'left' }}>
                                Date of Birth -{' '}
                                {selectedAccount.simRegistry.dob
                                  ? selectedAccount.simRegistry.dob
                                  : ' NaN '}
                              </h5>
                            </Col>
                            <Col span={6}>
                              <div>
                                <Button
                                  type="default"
                                  shape="circle"
                                  icon="edit"
                                  size="default"
                                  onClick={() => this.toggleModal('dobModalVisible')}
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </article>
                  </div>
                </div>
              </article>

              <Modal
                title="Update KYC"
                visible={kycModalVisible}
                onOk={this.submitKYC}
                onCancel={() => this.toggleModal('kycModalVisible')}
                centered
              >
                <Row gutter={24}>
                  <Col span={8}>
                    <div
                      style={{
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Upload
                        name="avatar"
                        listType="picture-card"
                        showUploadList={false}
                        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                        beforeUpload={beforeUpload}
                        onChange={this.handleChangeKYC}
                      >
                        {tempIdentityImage ? (
                          <img
                            src={tempIdentityImage}
                            alt="avatar"
                            style={{ width: '100%' }}
                            className="no_border"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = picture_attachment_avatar;
                            }}
                          />
                        ) : (
                          uploadButton
                        )}
                      </Upload>
                    </div>
                  </Col>
                  <Col span={16}>
                    <h5>Identity No</h5>
                    <div className="divider divider-solid my-2" />
                    <Form>
                      <FormItem>
                        {getFieldDecorator('identityNo', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your Identity Number',
                            },
                          ],
                        })(<Input placeholder="Identity No" />)}
                      </FormItem>
                    </Form>
                    {this.state.kycImgError && (
                      <span style={{ color: '#ff4d4f' }}>Identity Image is Required!</span>
                    )}
                  </Col>
                </Row>
              </Modal>

              <Modal
                title="Identity Attachment"
                visible={kycImgModalVisible}
                footer={null}
                onCancel={() => this.toggleModal('kycImgModalVisible')}
                centered
              >
                <Row gutter={24}>
                  <Col span={24}>
                    <img
                      style={{ width: '100%' }}
                      src={identityImage}
                      alt="avatar"
                      className="no_border"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = picture_attachment_avatar;
                      }}
                    />
                  </Col>
                </Row>
              </Modal>

              <Modal
                title="SIM NO"
                visible={simNoModalVisible}
                onOk={this.submitSIMNO}
                onCancel={() => this.toggleModal('simNoModalVisible')}
                centered
              >
                <Row gutter={24}>
                  <Col span={24}>
                    <Form>
                      <FormItem>
                        {getFieldDecorator('simNo', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your simNo',
                            },
                          ],
                        })(<Input placeholder="SIM No" />)}
                      </FormItem>
                    </Form>
                  </Col>
                </Row>
              </Modal>

              <Modal
                title="Date Of Birth"
                visible={dobModalVisible}
                onOk={this.submitDob}
                onCancel={() => this.toggleModal('dobModalVisible')}
                centered
              >
                <Row gutter={24}>
                  <Col span={24}>
                    <Form>
                      <FormItem>
                        {getFieldDecorator('dob', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your Birthday',
                            },
                          ],
                        })(<DatePicker onChange={this.dateHandler} format={dateFormat} />)}
                      </FormItem>
                    </Form>
                  </Col>
                </Row>
              </Modal>

              <Modal
                title="SIM Registration"
                visible={simRegModalVisible}
                onOk={this.submitSimReg}
                onCancel={() => this.toggleModal('simRegModalVisible')}
                centered
              >
                <Form>
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem>
                        {getFieldDecorator('firstName', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter First Name',
                            },
                          ],
                        })(<Input placeholder="First Name" />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem>
                        {getFieldDecorator('lastName', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter Last Name',
                            },
                          ],
                        })(<Input placeholder="Last Name" />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem>
                        {getFieldDecorator('gender', {
                          rules: [
                            {
                              required: true,
                              message: 'Please select Gender.',
                            },
                          ],
                        })(
                          <Select placeholder="Gender">
                            <Option value="M">Male</Option>
                            <Option value="F">Female</Option>
                            <Option value="O">Other</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem>
                        {getFieldDecorator('dob', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your Birthday',
                            },
                          ],
                        })(
                          <DatePicker
                            onChange={this.dateHandler}
                            format={dateFormat}
                            placeholder="Birthday"
                            style={{ width: '100%' }}
                          />
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem>
                        {getFieldDecorator('simProvider', {
                          rules: [
                            {
                              required: true,
                              message: 'Please select SIM Provider.',
                            },
                          ],
                        })(
                          <Select placeholder="SIM Provider">
                            {simProviderList &&
                              simProviderList.map(provider => {
                                return (
                                  <Option key={provider.id} value={provider.id}>
                                    {provider.providerName}
                                  </Option>
                                );
                              })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem>
                        {getFieldDecorator('mobileNo', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your mobileNo',
                            },
                          ],
                        })(<Input placeholder="Mobile No" />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem>
                        {getFieldDecorator('simNo', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your simNo',
                            },
                          ],
                        })(<Input placeholder="SIM No" />)}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              </Modal>
            </>
          )}
        </div>
      </>
    );
  }
}

const WrappedData = Form.create()(Data);
const management = () => <WrappedData />;
export default management;

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
} from 'antd';

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import profile_avatar from '../../../assets/images/profile_avatar.png';

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

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

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      accountList: [],
      selectedAccount: undefined,
      loading: false,
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
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  viewAccount = id => {
    // this._isMounted &&
    //   this.setState({
    //     selectedAccount: id,
    //   });
    axios
      .get(environment.baseUrl + 'account/' + id)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        this._isMounted &&
          this.setState({
            selectedAccount: response.data.content,
            imageUrl: environment.baseUrl + 'file/downloadImg/account/' + response.data.content.id,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  resetAccount = () => {
    this._isMounted &&
      this.setState({
        selectedAccount: undefined,
      });
  };

  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl =>
        this.setState(
          {
            imageUrl,
            loading: false,
          },
          () => {
            // console.log(this.state.imageUrl.split(',').pop());
            if (this.state.imageUrl && this.state.selectedAccount) {
              axios
                .post(environment.baseUrl + 'file/commonImageUpload', {
                  context: 'account',
                  contextId: this.state.selectedAccount.id,
                  imgString: this.state.imageUrl.split(',').pop(),
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
                imageUrl: undefined,
              });
            }
          }
        )
      );
    }
  };

  render() {
    const { accountList, selectedAccount } = this.state;
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const imageUrl = this.state.imageUrl;
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        {/* <QueueAnim type="bottom" className="ui-animate">
          {accountList && accountList.length > 0 && selectedAccount === undefined && (
            <AccountTable accountList={accountList} viewAccount={this.viewAccount} />
          )}
          {selectedAccount !== undefined && <AccountView resetAccount={this.resetAccount} />}
        </QueueAnim> */}

        {/* {accountList && accountList.length > 0 && selectedAccount === undefined && ( */}
        {selectedAccount === undefined && (
          <div className="box box-default">
            <div className="box-header">Account Management</div>
            <div className="box-body">
              <Form>
                <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                  <Col span={12}>
                    <FormItem>
                      <Input.Search
                        placeholder="input search text"
                        onChange={this.searchTextHandler}
                        style={{ width: '100% ' }}
                      />
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem>
                      <Select placeholder="Search Type" defaultValue="name">
                        <Option value="name">Holder Name</Option>
                        <Option value="number">Account Number</Option>
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem>
                      <Select placeholder="Role" defaultValue="name">
                        {/* {userRole &&
                            userRole.map(role => {
                              if (role.name !== 'Super Admin') {
                                return (
                                  <Option key={role.id} value={role.id}>
                                    {role.name}
                                  </Option>
                                );
                              }
                            })} */}
                        <Option value="name">Holder Name</Option>
                        <Option value="number">Account Number</Option>
                      </Select>
                    </FormItem>
                  </Col>
                </Row>
              </Form>

              <article className="article mt-2">
                <Table dataSource={accountList}>
                  <Column title="Holder Name" dataIndex="holder" key="holder" />
                  <Column title="Account Number" dataIndex="accountNumber" key="accountNumber" />
                  {/* <Column
                    title="Account Number"
                    dataIndex="account.accountNumber"
                    key="accountNo"
                  />
                  <Column
                    title="Status"
                    dataIndex="status"
                    key="status"
                    render={status => (
                      <Tag color={STATUS.DEVICE_STATUS[status].color}>
                        {STATUS.DEVICE_STATUS[status].label}
                      </Tag>
                    )}
                  /> */}
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
            {/* <span>
              <Tooltip title="Back">
                <Icon onClick={() => this.resetAccount()} type="left" />
              </Tooltip>
            </span> */}
            <article className="article">
              <div className="row">
                <h2 className="article-title">
                  Account View
                  {/* <span className="badge badge-pill">v2</span> */}
                </h2>
              </div>
              <div className="row">
                <div className="col-lg-4 mb-4">
                  <article className="profile-card-v2 h-100">
                    <h4>
                      Account Details
                      {/* <Button
                        type="primary"
                        shape="circle"
                        icon="edit"
                        size="default"
                        className="float-right"
                      /> */}
                    </h4>
                    <div className="divider divider-solid my-4" />
                    {/* <img src={profile_avatar} alt="avatar" /> */}
                    <div className="mt-2 mb-4">
                      <Upload
                        name="avatar"
                        listType="picture-card"
                        showUploadList={false}
                        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                        beforeUpload={beforeUpload}
                        onChange={this.handleChange}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
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
                    <div></div>
                  </article>
                </div>
                <div className="col-lg-4 mb-4">
                  <article className="profile-card-v2 h-100">
                    <h4>Identity Card Details</h4>
                    <div className="divider divider-solid my-4" />
                    <img src={profile_avatar} alt="avatar" className="no_border" />
                    <div className="mt-4 mb-4">
                      <h5>
                        ID No - {selectedAccount.identityNo ? selectedAccount.identityNo : ' NaN '}
                      </h5>
                    </div>
                    <div>
                      <Button type="primary" shape="circle" icon="edit" size="default" />
                    </div>
                  </article>
                </div>
                <div className="col-lg-4 mb-4">
                  <article className="profile-card-v2 h-100">
                    <h4>Sim Registry Details</h4>
                    <div className="divider divider-solid my-4" />
                    <div className="mt-4 mb-4">
                      <h5>SIM No - 12345679834534534</h5>
                      <h5>Mobile No - 0712345789</h5>
                    </div>

                    {/* <div className="divider divider-solid my-4" /> */}

                    <div>
                      <Button type="primary" shape="circle" icon="edit" size="default" />
                    </div>
                  </article>
                </div>
              </div>
            </article>
          </>
          // <div className="box box-default">
          //   <div className="box-header">
          //     <Breadcrumb separator=">">
          //           <Breadcrumb.Item href="#" onClick={this.resetAccount()}>
          //             Account Management
          //           </Breadcrumb.Item>
          //           <span>
          //             <Tooltip title="View">
          //               <Icon onClick={() => this.resetAccount()} type="menu-unfold" />
          //             </Tooltip>
          //           </span>
          //           <Breadcrumb.Item>Account View</Breadcrumb.Item>
          //         </Breadcrumb>
          //   </div>
          //   <div className="box-body"></div>
          // </div>
        )}
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);
const management = () => <WrappedData />;
export default management;

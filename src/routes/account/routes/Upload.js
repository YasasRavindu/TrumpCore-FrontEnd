import React from 'react';
import { Icon, Upload, message, Button, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import CSVReader from 'react-csv-reader';
const definedHeader = ['purseName', 'purseUserLastName', 'mobileNumber', 'dob', 'gender'];

const Dragger = Upload.Dragger;
const { Column, ColumnGroup } = Table;

// const props = {
//   name: 'file',
//   multiple: false,
//   action: '//jsonplaceholder.typicode.com/posts/',
//   onChange(info) {
//     console.log('---info', info);

//     const status = info.file.status;
//     if (status !== 'uploading') {
//       console.log(info.file, info.fileList);
//     }
//     if (status === 'done') {
//       message.success(`${info.file.name} file uploaded successfully.`);
//     } else if (status === 'error') {
//       message.error(`${info.file.name} file upload failed.`);
//     }
//   },
// };

const handleForce = (data, fileName) => {
  console.log(data, fileName);

  const headerCheck = definedHeader.some(r => data[0].indexOf(r) >= 0);
  if (headerCheck) {
    const i = 0;
    const dataList = data.slice(0, i).concat(data.slice(i + 1, data.length));
    console.log('datalist========', dataList);
  } else {
    message.error("Uploaded csv header doesn't match");
  }
};

const tableData = [
  { key: 1, AccountNo: '1234567', reason: 'wrong account number' },
  {
    key: 2,
    AccountNo: '1234567',
    reason: 'wrong account number',
  },
];

class UploadAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div className="row">
            <div className="col-xl-6">
              <div className="number-card-v1 mb-4">
                <div className="box box-default">
                  <div className="box-body">
                    {/* <Dragger {...props}>
                      <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                      </p>
                      <p className="ant-upload-text">Click or drag file to this area to upload</p>
                      <p className="ant-upload-hint">
                        Support for a single or bulk upload. Strictly prohibit from uploading
                        company data or other band files
                      </p>
                    </Dragger> */}
                    <CSVReader
                      cssClass="react-csv-input"
                      label="Upload"
                      onFileLoaded={handleForce}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3">
              <div className="number-card-v1 mb-4">
                <div className="card-top">
                  <span>
                    75<span className="h5">%</span>
                  </span>
                </div>
                <div className="card-info">
                  <span>Pass</span>
                </div>
                <div className="card-bottom">
                  <Icon type="smile-o" className="text-info" />
                </div>
              </div>
            </div>
            <div className="col-xl-3">
              <div className="number-card-v1 mb-4">
                <div className="card-top">
                  <span>
                    25<span className="h5">%</span>
                  </span>
                </div>
                <div className="card-info">
                  <span>Fail</span>
                </div>
                <div className="card-bottom">
                  <Icon type="frown-o" className="text-info" />
                </div>
              </div>
            </div>
          </div>
          <div className="box box-default">
            <div className="box-body">
              <article className="article mt-2">
                <Table dataSource={tableData}>
                  <Column title="Account Number" dataIndex="AccountNo" key="AccountNo" />
                  <Column title="Reason" dataIndex="reason" key="reason" />
                </Table>
              </article>
            </div>
          </div>
        </QueueAnim>
      </div>
    );
  }
}

export default UploadAccount;

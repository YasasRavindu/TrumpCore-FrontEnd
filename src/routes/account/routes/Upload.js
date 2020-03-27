import React from 'react';
import { Icon, Upload, message, Button, Table, Empty } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { CSVReader } from 'react-papaparse';
import axios from 'axios';
import { environment, commonUrl } from '../../../environments';
const definedHeader = ['purseName', 'purseUserLastName', 'mobileNumber', 'dob', 'gender'];

const { Column, ColumnGroup } = Table;

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
    this.state = {
      showBtn: false,
      csvObject: {},
      csvAccount: 0,
    };
  }

  onDrop = data => {
    console.log('=====data', data);
    this.setState({
      showBtn: false,
    });
    const headerCheck = definedHeader.some(r => data[0].data.indexOf(r) >= 0);

    if (headerCheck) {
      const i = 0;
      const dataList = data
        .slice(0, i)
        .concat(data.slice(i + 1, data.length))
        .map(d => d.data);
      let nullCount = 0;
      dataList.forEach(element => {
        const checkValue = element.includes('');
        if (checkValue) {
          nullCount++;
        }
      });
      if (nullCount === 0) {
        let account = 0;
        let obj = {};
        let dataObject = {};
        dataList.map((data, index) => {
          dataObject = {
            purseName: data[0],
            purseUserLastName: data[1],
            mobileNumber: data[2],
            dob: data[3],
            gender: data[4],
          };
          obj[index] = dataObject;
          account++;
        });
        //console.log(obj, account);

        if (obj && account > 0) {
          this.setState({
            showBtn: true,
            csvObject: obj,
            csvAccount: account,
          });
        } else {
          message.error('Something Wrong');
        }
      } else {
        message.error(
          'We have identified ' +
            nullCount +
            ' empty values in your CSV file. Please fill them out and upload again.'
        );
      }
    } else {
      message.error("Uploaded csv header doesn't match");
    }
  };

  onError = (err, file, inputElem, reason) => {
    console.log(err);
    message.error(err);
  };

  dataParse = () => {
    console.log('====show', this.state.showBtn, this.state.csvObject, this.state.csvAccount);
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.id) {
      //console.log(currentUser.id);
      axios
        .post(environment.baseUrl + 'maintenance/bulkAccount', {
          accounts: this.state.csvAccount,
          user: {
            id: currentUser.id,
          },
          records: [this.state.csvObject],
        })
        .then(response => {
          console.log('------------------- response - ', response);
          this.setState({
            showBtn: false,
            csvObject: {},
            csvAccount: 0,
          });
        })
        .catch(error => {
          console.log('------------------- error - ', error);
          this.setState({
            showBtn: false,
            csvObject: {},
            csvAccount: 0,
          });
        });
    } else {
      message.error("Couldn't verify your credentials. Please sign in again and try uploading.");
    }
  };

  render() {
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div className="row">
            <div className="col-xl-6">
              <div className="number-card-v1 mb-4">
                <div className="box box-default">
                  <div className="box-body">
                    <CSVReader
                      onDrop={this.onDrop}
                      onError={this.onError}
                      style={{ maxHeight: 140 }}
                      config={{ skipEmptyLines: true }}
                    >
                      <span>Drop CSV file here or click to upload.</span>
                    </CSVReader>
                    {this.state.showBtn && (
                      <Button
                        type="primary"
                        className="float-right mt-2"
                        onClick={() => this.dataParse()}
                      >
                        submit
                      </Button>
                    )}
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

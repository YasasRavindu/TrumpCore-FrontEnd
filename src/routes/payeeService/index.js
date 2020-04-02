import React from 'react';
import { Route } from 'react-router-dom';

import SalaryUpload from './routes/SalaryUpload';

const PayeeService = ({ match }) => (
  <div>
    <Route path={`${match.url}/salaryUpload`} component={SalaryUpload} />
  </div>
);

export default PayeeService;

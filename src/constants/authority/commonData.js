// * ~ CUSTOME APP CONFIG ~

const COLLECTION = {};

// Routes
COLLECTION.ROUTE = {
  login: '/user/login',
  welcome: '/app/welcome',
  error403: '/exception/403',
  error404: '/exception/404',
  error500: '/exception/500',
};

// Idle
COLLECTION.IDLE = {
  timeout: 1000 * 60 * 10,
};

export default COLLECTION;

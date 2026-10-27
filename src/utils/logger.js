const logger = {
  info: (action, data) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      action,
      ...data
    }));
  },
  error: (action, error, data) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      action,
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
      ...data
    }));
  }
};

module.exports = logger;

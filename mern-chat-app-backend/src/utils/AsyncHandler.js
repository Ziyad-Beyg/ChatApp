const AsyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((error) => {
    console.error("AsyncHandler Error: ", error);
    next(error);
  });
};

export default AsyncHandler;

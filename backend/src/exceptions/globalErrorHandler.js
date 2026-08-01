const globalErrorHandler = (err, req, res, next) => {

    console.error("========== ERROR ==========");
    console.error(err.stack);
    console.error("===========================");

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

export default globalErrorHandler;
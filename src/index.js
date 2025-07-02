import express from 'express';

const app = express();
const PORT = 3000;
app.use((req, res, next) => {
    console.log(`Time: ${new Date().toLocaleString()}`);
    next();
});
app.use(express.json());
// app.use((req, res, next) => {
//     console.log(`👉 [${req.method}] ${req.originalUrl}`);
//     next();
//   });

app.get("/", (req, res) => {
    // console.log("✅ Reached GET / route");
    res.json({ message: "Hello World!" });
});
// app.use((req, res, next) => {
//     console.log(`👉 [${req.method}] ${req.originalUrl}`);
//     next();
//   });

app.use((req, res, next) => {
    // console.log("❌ Reached 404 handler");
    res.status(404).json({
        message: 'Not found',
    });
});
app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
  });

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

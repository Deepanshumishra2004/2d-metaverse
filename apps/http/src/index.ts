import Express from "express";
import { router } from "./routes/v1/index.js";
import cors from "cors"

const app = Express();
app.use(Express.json());
app.use(cors())

app.use('/api/v1',router);

app.listen(3001);

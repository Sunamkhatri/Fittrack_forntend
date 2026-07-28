import app from "./src/app.js";
import { PORT } from "./src/configs/constant.js";
import { connectToMongoDB } from "./src/config/database.js";

async function bootstrap() {
  await connectToMongoDB();
  app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
  });
}

bootstrap();

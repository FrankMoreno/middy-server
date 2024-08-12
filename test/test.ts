import { middyServer } from "../src";
import { handler } from "./middy_handler";

middyServer(handler);

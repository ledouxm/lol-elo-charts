import { HttpApi } from "@effect/platform";
import { DuoQApi } from "./duoq.api.ts";

export class AppApi extends HttpApi.make("app-api").add(DuoQApi) {}

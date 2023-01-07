import axios from "axios";
import { Client } from "../apiClients";

export const ApiUrl = "http://localhost:5200";

export const GetApiClient = () => {
    return new Client(ApiUrl, axios);
}
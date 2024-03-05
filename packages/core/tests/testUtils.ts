import Galeforce from "galeforce";
import { faker } from "@faker-js/faker";
import { getRandomString } from "pastable";

export const createMockSummoner = async () => {
    const data: Galeforce.dto.SummonerDTO = {
        accountId: getRandomString(45),
        id: getRandomString(45),
        name: faker.person.fullName(),
        profileIconId: 1,
        puuid: getRandomString(78),
        revisionDate: 1,
        summonerLevel: 31,
    };
};

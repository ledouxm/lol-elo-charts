const winColor = 0x00ff26;
const lossColor = 0xff0000;

export const getColor = (isLoss: boolean) => (isLoss ? lossColor : winColor);

const winEmoji = ":chart_with_upwards_trend:";
const lossEmoji = ":chart_with_downwards_trend:";

export const getEmoji = (isLoss: boolean) => (isLoss ? lossEmoji : winEmoji);

const winArrow = ":arrow_upper_right:";
const lossArrow = ":arrow_lower_right:";

export const getArrow = (isLoss: boolean) => (isLoss ? lossArrow : winArrow);

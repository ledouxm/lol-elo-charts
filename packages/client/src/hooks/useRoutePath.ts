import { useRouteMatch } from "react-router-dom";

export const useRoutePath = () => {
    const match = useRouteMatch();
    return match.path.endsWith("/") ? match.path.slice(0, -1) : match.path;
};

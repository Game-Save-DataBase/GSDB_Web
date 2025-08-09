import { Link, useLocation } from "react-router-dom";

function NotFound() {
    const location = useLocation();

    const queryType = location.search ? location.search.substring(1) : null;
    const getMessage = () => {
        switch (queryType) {
            case "g":
                return {
                    title: "Game not found",
                    text: "The game you are looking for does not exist or was removed.",
                    link: "/catalog",
                    linkText: "Browse Catalog"
                };
            case "u":
                return {
                    title: "User not found",
                    text: "The user profile you are trying to view does not exist.",
                };
            case "s":
                return {
                    title: "Save Data not found",
                    text: "The save data you requested could not be found.",
                    link: "/catalog",
                    linkText: "Browse Catalog"
                };
            default:
                return {
                    title: "Page not found",
                    text: "The page you are looking for does not exist.",
                };
        }
    };

    const { title, text, link, linkText } = getMessage();

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>404 - {title}</h1>
            <p>{text}</p>
            {link && <Link to={link}>{linkText}</Link>}
            <br />
            <Link to="/">Go back to home page</Link>
        </div>
    );
}

export default NotFound;

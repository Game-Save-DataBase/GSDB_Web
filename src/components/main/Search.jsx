import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import config from "../../utils/config";
import api from "../../utils/interceptor";
import View from "../views/View.jsx";
import { LoadingContext } from "../../contexts/LoadingContext";
import {
    Form,
    Stack,
    Button,
    Spinner
} from "react-bootstrap";
import FilterSelect from "../filters/FilterSelect";
import FilterDate from "../filters/FilterDate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownShortWide, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';

const Search = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sortFilter, setSort] = useState("")
    const [order, setOrder] = useState("asc"); // "asc" o "desc"
    const toggleOrder = () => {
        setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };
    const type = searchParams.get("type");
    const typeText = type === 'g' ? "Game" : (type === 's' ? "Save" : "User")
    const query = searchParams.get("q") || "";

    const { isInitialLoad, block, unblock, markAsLoaded, resetLoad } =
        useContext(LoadingContext);
    const [loading, setLoading] = useState(false);

    const [results, setResults] = useState(null);
    const [platforms, setPlatforms] = useState([]);
    const [tags, setTags] = useState([]);

    const [limit, setLimit] = useState(20);
    const [offset, setOffset] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewType, setViewType] = useState("list");
    const [hasMore, setHasMore] = useState(false);

    const [tempPlatforms, setTempPlatforms] = useState([]);
    const [tempDateFrom, setTempDateFrom] = useState("");
    const [tempDateTo, setTempDateTo] = useState("");
    const [tempTags, setTempTags] = useState([]);

    // Mapa abreviaturas plataforma
    const platformAbbrMap = platforms.reduce((acc, p) => {
        if (p.value && p.abbreviation) acc[p.value] = p.abbreviation;
        return acc;
    }, {});
    const tagMap = tags.reduce((acc, tag) => {
        acc[tag.tagID] = tag.name;
        return acc;
    }, {});

    // Validaciones iniciales
    useEffect(() => {
        // if (!["g", "s", "u"].includes(type) || !query) {
        if (!["g", "s", "u"].includes(type)) {
            navigate("/notfound", { replace: true });
        }
    }, [type, query, navigate]);

    // Cargar plataformas y tags
    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const res = await api.get(`${config.api.platforms}?limit=500`);
                const data = Array.isArray(res.data) ? res.data : [];
                setPlatforms(
                    data.map((p) => ({
                        value: p.platformID?.toString() ?? "",
                        label: p.name ?? "",
                        abbreviation: p.abbreviation ?? ""
                    }))
                );
            } catch (err) {
                console.error("Error fetching platforms", err);
            }
        };
        const fetchTags = async () => {
            try {
                const res = await api.get(`${config.api.tags}`);
                const tagArray = Array.isArray(res.data) ? res.data : [res.data];
                setTags(tagArray);
            } catch (err) {
                console.error("Error fetching tags", err);
            }
        };

        fetchPlatforms();
        fetchTags();
    }, []);

    // Construir filters desde params
    const buildFiltersFromParams = () => {
        let f = {
            platformIDs: [],
            dateFrom: "",
            dateTo: "",
            tags: []
        };

        if (type === "u") return f; // sin filtros

        if (searchParams.get("platformID[in]")) {
            f.platformIDs = searchParams.get("platformID[in]").split(",");
        }
        if (searchParams.get("release_date[gte]") && type === "g") {
            f.dateFrom = searchParams.get("release_date[gte]");
        }
        if (searchParams.get("release_date[lte]") && type === "g") {
            f.dateTo = searchParams.get("release_date[lte]");
        }
        if (searchParams.get("postedDate[gte]") && type === "s") {
            f.dateFrom = searchParams.get("postedDate[gte]");
        }
        if (searchParams.get("postedDate[lte]") && type === "s") {
            f.dateTo = searchParams.get("postedDate[lte]");
        }
        if (type === "s" && searchParams.get("tagID[in]")) {
            f.tags = searchParams.get("tagID[in]").split(",");
        }
        return f;
    };

    // Fetch results usando filters
    const fetchResults = async () => {
        const filters = buildFiltersFromParams();
        const sortParam = searchParams.get("sort") || "";
        const orderParam = searchParams.get("order") || "desc";
        let filterQuery = "";
        if (filters.platformIDs.length > 0) {
            filterQuery += `&platformID[in]=${filters.platformIDs.join(",")}`;
        }
        if (filters.dateFrom !== "") {
            filterQuery +=
                type === "g"
                    ? `&release_date[gte]=${filters.dateFrom}`
                    : type === "s"
                        ? `&postedDate[gte]=${filters.dateFrom}`
                        : "";
        }
        if (filters.dateTo !== "") {
            filterQuery +=
                type === "g"
                    ? `&release_date[lte]=${filters.dateTo}`
                    : type === "s"
                        ? `&postedDate[lte]=${filters.dateTo}`
                        : "";
        }
        if (type === "s" && filters.tags.length > 0) {
            filterQuery += `&tagID[in]=${filters.tags.join(",")}`;
        }

        let endpoint = "";
        switch (type) {
            case "s":
                endpoint = `${config.api.savedatas}/search?q=${encodeURIComponent(
                    query
                )}&limit=${limit}&offset=${offset}&${sortParam != "" ? `&sort[${orderParam}]=${sortParam}` : ""}${filterQuery}`;
                break;
            case "g":
                endpoint = `${config.api.games}/search?q=${encodeURIComponent(
                    query
                )}&limit=${limit}&offset=${offset}&${sortParam != "" ? `&sort[${orderParam}]=${sortParam}` : ""}${filterQuery}`;
                break;
            case "u":
                endpoint = `${config.api.users}/search?q=${encodeURIComponent(
                    query
                )}&limit=${limit}&offset=${offset}&${sortParam != "" ? `&sort[${orderParam}]=${sortParam}` : ""}`;
                break;
        }
        try {
            setLoading(true);
            console.log(endpoint)
            const res = await api.get(endpoint);
            if (res.status === 204 || !res.data || (Array.isArray(res.data) && res.data.length === 0)) {
                setResults([]);
                setHasMore(false);
                return;
            }

            let data = Array.isArray(res.data) ? res.data.filter(Boolean) : [res.data].filter(Boolean);

            let processed = [];

            switch (type) {
                case "g":
                    processed = data.map((d) => ({
                        ...d,
                        img_error: `${config.api.assets}/defaults/game-cover`,
                        link: `/g/${d.slug}`,
                        nDownloads: null,
                    }));
                    break;
                case "s":
                    processed = await Promise.all(
                        data.map(async (save) => {
                            let gameData = {};
                            let userData = {};
                            try {
                                const gRes = await api.get(
                                    `${config.api.games}?gameID=${save.gameID}&external=false`
                                );
                                gameData = gRes.data || {};
                            } catch { }
                            try {
                                const uRes = await api.get(
                                    `${config.api.users}?userID=${save.userID}`
                                );
                                userData = uRes.data || {};
                            } catch { }
                            return {
                                ...save,
                                cover: `${config.api.assets}/savedata/${save.saveID}/scr/main`,
                                img_error:
                                    gameData.cover || `${config.api.assets}/defaults/game-cover`,
                                user: {
                                    name: userData.userName || "unknown",
                                    link: `/u/${userData.userName}`
                                },
                                link: `/s/${save.saveID}`,
                                tagNames: save.tagID?.map(id => tagMap[id]).filter(Boolean) || [],
                                uploads: null,
                                lastUpdate: null
                            };
                        })
                    );
                    break;
                case "u":
                    processed = data.map((user) => ({
                        ...user,
                        img_error: `${config.api.assets}/defaults/pfp`,
                        link: `/u/${user.userName}`,
                        title: `${user.alias || `@${user.userName}`}`,
                        description: user.alias === "" ? user.bio : `@${user.userName} ${user.bio != "" ? `— ${user.bio}` : ""}`,
                        cover: `${config.api.assets}/user/${user.userID}/pfp`,
                        nUploads: user.uploads.length,
                        lastUpdate: null,
                        nDownloads: null,
                        nReviews: user.likes.length + user.dislikes.length,
                        badge: user.admin ? 'admin' : user.verified ? 'verified' : user.trusted ? 'trusted' : null
                    }));
                    break;
            }

            setResults(processed);
            setHasMore(processed.length === limit);
        } catch (err) {
            console.error("Error fetching results", err);
        }
        finally {
            setLoading(false)
        }
    };

    // Init page
    useEffect(() => {
        const initPage = async () => {
            if (!["g", "s", "u"].includes(type) || !query) return;
            if (type === "s" && tags.length === 0) return;
            const initialFilters = buildFiltersFromParams();
            setTempPlatforms(initialFilters.platformIDs);
            setTempDateFrom(initialFilters.dateFrom);
            setTempDateTo(initialFilters.dateTo);
            setTempTags(initialFilters.tags);

            resetLoad();
            block();
            await fetchResults();
            markAsLoaded();
            unblock();
        };
        initPage();
    }, [type, query, tags]);

    useEffect(() => {
        const search = async () => {
            await fetchResults();
        }
        search();
    }, [limit, offset, searchParams])

    //se vuelve ala primera pagina cuando se cambia el limit, para evitar errores
    useEffect(() => {
        setCurrentPage(1);
    }, [limit]);
    // cada vez que cambien limit o currentPage, recalculamos offset
    useEffect(() => {
        setOffset((currentPage - 1) * limit);
    }, [currentPage, limit]);

    // Reset filtros sin borrar type y q
    const resetFilters = () => {
        setTempPlatforms([]);
        setTempDateFrom("");
        setTempDateTo("");
        setTempTags([]);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("platformID[in]");
        newParams.delete("release_date[gte]");
        newParams.delete("release_date[lte]");
        newParams.delete("postedDate[gte]");
        newParams.delete("postedDate[lte]");
        newParams.delete("tagID[in]");
        newParams.delete("sort");
        newParams.delete("order");
        setSearchParams(newParams);
        setOffset(0);
        setCurrentPage(1);
        fetchResults();
    };

    // Aplicar filtros y actualizar URL
    const applyFilters = (f) => {
        const newParams = new URLSearchParams(searchParams);
        if (type !== "u") {
            newParams.delete("platformID[in]");
            newParams.delete("release_date[gte]");
            newParams.delete("release_date[lte]");
            newParams.delete("postedDate[gte]");
            newParams.delete("postedDate[lte]");
            newParams.delete("tagID[in]");
            let prevSort = newParams.get("sort");
            let prevOrder = newParams.get("order");
            newParams.delete("sort");
            newParams.delete("order");

            if (f.selectedPlatforms?.length > 0) {
                newParams.set("platformID[in]", f.selectedPlatforms.join(","));
            }
            if (f.selectedDateFrom != "") {
                if (type === "g")
                    newParams.set("release_date[gte]", f.selectedDateFrom);
                else if (type === "s")
                    newParams.set("postedDate[gte]", f.selectedDateFrom);
            }
            if (f.selectedDateTo != "") {
                if (type === "g")
                    newParams.set("release_date[lte]", f.selectedDateTo);
                else if (type === "s")
                    newParams.set("postedDate[lte]", f.selectedDateTo);
            }
            if (type === "s" && f.selectedTags?.length > 0) {
                newParams.set("tagID[in]", f.selectedTags.join(","));
            }
            if (sortFilter != prevSort || order != prevOrder) {
                newParams.set("sort", sortFilter);
                newParams.set("order", order);
            }

        }
        setSearchParams(newParams);
    };

    // Al aplicar filtros
    const handleApplyFilters = () => {
        const newParams = new URLSearchParams(searchParams);

        // Guardar plataformas
        if (tempPlatforms.length > 0) {
            newParams.set("platforms", tempPlatforms.join(","));
        } else {
            newParams.delete("platforms");
        }

        // Guardar fechas
        if (tempDateFrom) {
            newParams.set("dateFrom", tempDateFrom);
        } else {
            newParams.delete("dateFrom");
        }

        if (tempDateTo) {
            newParams.set("dateTo", tempDateTo);
        } else {
            newParams.delete("dateTo");
        }

        // Guardar tags
        if (tempTags.length > 0) {
            newParams.set("tags", tempTags.join(","));
        } else {
            newParams.delete("tags");
        }

        // 👇 Guardar sort y order en la URL
        if (sortFilter) {
            newParams.set("sort", sortFilter);
        } else {
            newParams.delete("sort");
        }
        newParams.set("order", order);

        // Aplicar
        applyFilters({
            selectedPlatforms: tempPlatforms,
            selectedDateFrom: tempDateFrom,
            selectedDateTo: tempDateTo,
            selectedTags: tempTags
        });

        setSearchParams(newParams);
    };


    if (isInitialLoad || !results) {
        return (
            <div className="text-center mt-5">
                <h2>Searching <strong><em>{query}</em></strong> in {typeText}</h2>
            </div>
        );
    }

    return (
        <div className="center mt-3">
            <h2 className="text-center mb-5">{typeText} search results for <strong><em>{query}</em></strong></h2>
            <Stack direction="horizontal" gap={3} className="mb-4 flex-wrap align-items-end" style={{ rowGap: "1rem" }}>
                {(type === "g" || type === "s") && (
                    <Form.Group style={{ minWidth: "200px" }} className="mb-0 flex-fill">
                        <FilterSelect
                            label="Platform"
                            selected={tempPlatforms}
                            onChange={setTempPlatforms}
                            options={platforms}
                        />
                    </Form.Group>
                )}
                {type === "s" && (
                    <Form.Group style={{ minWidth: "200px" }} className="mb-0 flex-fill">
                        <FilterSelect
                            label="Tags"
                            selected={tempTags}
                            onChange={setTempTags}
                            options={tags.map((t) => ({
                                value: t.tagID?.toString(),
                                label: t.name
                            }))}
                        />
                    </Form.Group>
                )}
                {(type === "g" || type === "s") && (
                    <>
                        <Form.Group style={{ minWidth: "100px" }} className="mb-0 flex-fill">
                            <FilterDate
                                label={type === 'g' ? "Release Date From" : "Posted Date From"}
                                value={tempDateFrom}
                                onChange={setTempDateFrom}
                            />
                        </Form.Group>
                        <Form.Group style={{ minWidth: "100px" }} className="mb-0 flex-fill">
                            <FilterDate
                                label={type === 'g' ? "Release Date To" : "Posted Date To"}
                                value={tempDateTo}
                                onChange={setTempDateTo}
                            />
                        </Form.Group>
                    </>

                )}


                <Form.Group style={{ minWidth: "90px" }} className="mb-0 flex-fill">
                    <Form.Label>View</Form.Label>
                    <Form.Select value={viewType} onChange={(e) => setViewType(e.target.value)}>
                        <option value="list">List</option>
                        <option value="card">Card</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group style={{ minWidth: "90px" }} className="mb-0 flex-fill">
                    <Form.Label>Items per page</Form.Label>
                    <Form.Select
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                    >
                        <option value={1}>1</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={40}>40</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group
                    style={{ minWidth: "100px" }}
                    className="mb-0 flex-fill"
                >
                    <Form.Label>Sort by</Form.Label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Select
                            value={sortFilter}
                            onChange={(e) => setSort(e.target.value)}
                            style={{ flexGrow: 1 }}
                        >
                            <option value="">Default</option>
                            {type != 'u' && (
                                <>
                                    <option value="title">Title</option>
                                </>)}
                            {type === 'g' && (
                                <>
                                    <option value="nUploads">Uploads</option>
                                    <option value="lastUpdate">Last update</option>
                                    <option value="release_date">Release date</option>
                                </>)}
                            {type === 's' && (
                                <>
                                    <option value="postedDate">Posted date</option>
                                    <option value="nDownloads">Downloads</option>
                                    <option value="rating">User rating</option>
                                </>)}
                            {type === 'u' && (
                                <>
                                    <option value="userName">User name</option>
                                    <option value="alias">Alias</option>
                                    <option value="admin">Is admin</option>
                                    <option value="verified">Is verified</option>
                                    <option value="trusted">Is trusted</option>
                                    <option value="rating">Rating</option>                                </>)}
                        </Form.Select>

                        <FontAwesomeIcon
                            icon={order === "asc" ? faArrowDownShortWide : faArrowUpShortWide}
                            onClick={toggleOrder}
                            style={{
                                marginLeft: "8px",
                                cursor: "pointer",
                                fontSize: "1.2em"
                            }}
                        />
                    </div>
                </Form.Group>
                <div className="d-flex align-items-end mb-0 gap-2">
                    <Button variant="primary" onClick={handleApplyFilters}>
                        Filter
                    </Button>
                    <Button variant="outline-secondary" onClick={resetFilters}>
                        Clear Filters
                    </Button>
                </div>
            </Stack>
            {loading ? (
                <div className="text-center mt-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <View
                    type={viewType}
                    data={results}
                    // openLinksInNewTab={true}
                    renderProps={{
                        title: "title",
                        releaseDate: "release_date",
                        uploadDate: "postedDate",
                        lastUpdate: "lastUpdate",
                        image: "cover",
                        errorImage: "img_error",
                        uploads: "nUploads",
                        link: "link",
                        platforms: "platformID",
                        downloads: "nDownloads",
                        description: "description",
                        tags: "tagNames",
                        nReviews: "nReviews",
                        badge: "badge"
                    }}
                    platformMap={platformAbbrMap}
                    limit={limit}
                    offset={offset}
                    currentPage={currentPage}
                    hasMore={hasMore}
                    onPageChange={setCurrentPage}
                />
            )}

        </div>
    );
};

export default Search;

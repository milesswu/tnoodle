import React, { Component } from "react";
import { connect } from "react-redux";
import Loading from "./Loading";
import {
    updateWcif,
    updateEditingStatus,
    updateCompetitionName,
    updateCompetitions,
    updateMe,
    updateCompetitionId,
    updateFileZipBlob,
    addCachedObject,
    addSuggestedFmcTranslations,
    setSuggestedFmcTranslations,
    setBestMbldAttempt,
} from "../redux/ActionCreators";
import { defaultWcif } from "../constants/default.wcif";
import {
    isLogged,
    logIn,
    logOut,
    fetchMe,
    getUpcomingManageableCompetitions,
    getCompetitionJson,
    getQueryParameter,
} from "../api/wca.api";
import {
    fetchSuggestedFmcTranslations,
    fetchBestMbldAttempt,
} from "../api/tnoodle.api";
import { getDefaultCompetitionName } from "../util/competition.name.util";
import "./SideBar.css";

const mapStateToProps = (store) => ({
    me: store.me,
    competitions: store.competitions,
    cachedObjects: store.cachedObjects,
});

const mapDispatchToProps = {
    updateWcif,
    updateEditingStatus,
    updateCompetitionName,
    updateCompetitions,
    updateMe,
    updateCompetitionId,
    updateFileZipBlob,
    addCachedObject,
    addSuggestedFmcTranslations,
    setSuggestedFmcTranslations,
    setBestMbldAttempt,
};

const SideBar = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor(props) {
            super(props);

            this.state = {
                me: props.me,
                competitions: props.competitions,
                loadingUser: false,
                loadingCompetitions: false,
                loadingCompetitionInformation: false,
                competitionId: null,
            };
        }
        margin = 1; // Margin for login button and "Manual Selection"

        componentDidMount() {
            if (this.state.me == null && isLogged()) {
                this.setLoadingUser(true);
                fetchMe()
                    .then((me) => {
                        this.setState({ ...this.state, me });
                        this.props.updateMe(me);
                        this.setLoadingUser(false);
                    })
                    .catch((e) => {
                        console.error(
                            "Could not get information about the logged user",
                            e
                        );
                        this.setLoadingUser(false);
                    });
            }

            if (this.state.competitions == null && isLogged()) {
                this.setLoadingCompetitions(true);
                getUpcomingManageableCompetitions()
                    .then((competitions) => {
                        this.setState({ ...this.state, competitions });
                        this.props.updateCompetitions(competitions);
                        this.setLoadingCompetitions(false);
                    })
                    .catch((e) => {
                        console.error("Could not get upcoming competitions", e);
                        this.setLoadingCompetitions(false);
                    });
            }

            let competitionId = getQueryParameter("competitionId");
            if (competitionId != null) {
                this.handleCompetitionSelection(competitionId);
            }
        }

        setLoadingUser = (flag) => {
            this.setState({ ...this.state, loadingUser: flag });
        };

        setLoadingCompetitions = (flag) => {
            this.setState({ ...this.state, loadingCompetitions: flag });
        };

        setLoadingCompetitionInformation = (flag) => {
            this.setState({
                ...this.state,
                loadingCompetitionInformation: flag,
            });
        };

        pluralize = (string, number) => {
            return string + (number > 1 ? "s" : "");
        };

        currentLocationWithoutQuery = () => {
            return window.location.origin + window.location.pathname;
        };

        setPageWithoutRedirect = (url) => {
            window.history.pushState(null, "", url);
        };

        handleManualSelection = () => {
            this.props.updateEditingStatus(false);
            this.props.updateCompetitionId(null);
            this.props.updateWcif({ ...defaultWcif });
            this.props.setBestMbldAttempt(null);
            this.props.updateCompetitionName(getDefaultCompetitionName());
            this.props.updateFileZipBlob(null);
            this.removeCompetitionIdQueryParam();
        };

        handleCompetitionSelection = (competitionId) => {
            this.updateCompetitionIdQueryParam(competitionId);

            // For quick switching between competitions.
            let cachedObject = this.props.cachedObjects[competitionId];
            if (cachedObject != null) {
                let cachedWcif = cachedObject.wcif;
                this.setWcif(cachedWcif);
                this.maybeAddCompetition(cachedWcif.id, cachedWcif.name);

                let cachedSuggestedFmcTranslations =
                    cachedObject.suggestedFmcTranslations;
                this.props.addSuggestedFmcTranslations(
                    cachedSuggestedFmcTranslations
                );

                let cachedBestMbldAttempt = cachedObject.bestMbldAttempt;
                this.props.setBestMbldAttempt(cachedBestMbldAttempt);
                return;
            }

            this.setState({
                ...this.state,
                loadingCompetitionInformation: true,
                competitionId,
            });

            getCompetitionJson(competitionId)
                .then((wcif) => {
                    this.setWcif(wcif);
                    this.props.addCachedObject(competitionId, "wcif", wcif);
                    this.maybeAddCompetition(wcif.id, wcif.name);

                    this.getAndCacheSuggestedFmcTranslations(wcif);

                    this.getAndCacheBestMbldAttempt(wcif);
                })
                .catch((e) => {
                    console.error(
                        "Could not get information for " + competitionId,
                        e
                    );
                    this.setLoadingCompetitionInformation(false);
                });
        };

        getAndCacheSuggestedFmcTranslations = (wcif) => {
            fetchSuggestedFmcTranslations(wcif).then((translations) => {
                this.props.addCachedObject(
                    wcif.id,
                    "suggestedFmcTranslations",
                    translations
                );
                this.props.addSuggestedFmcTranslations(translations);
            });
        };

        getAndCacheBestMbldAttempt = (wcif) => {
            fetchBestMbldAttempt(wcif).then((bestAttempt) => {
                if (!bestAttempt) {
                    return;
                }
                let attempted = bestAttempt.attempted;
                this.props.addCachedObject(
                    wcif.id,
                    "bestMbldAttempt",
                    attempted
                );
                this.props.setBestMbldAttempt(attempted);
            });
        };

        // In case we use competitionId from query params, it's not fetched.
        // We add it to the list.
        maybeAddCompetition = (competitionId, competitionName) => {
            if (!this.state.competitions) {
                return;
            }
            if (
                !this.state.competitions.find(
                    (competition) => competition.name === competitionName
                )
            ) {
                this.setState({
                    ...this.state,
                    competitions: [
                        ...this.state.competitions,
                        { id: competitionId, name: competitionName },
                    ],
                });
            }
        };

        updateCompetitionIdQueryParam = (competitionId) => {
            var searchParams = new URLSearchParams(window.location.search);
            searchParams.set("competitionId", competitionId);
            this.setPageWithoutRedirect(
                this.currentLocationWithoutQuery() +
                    "?" +
                    searchParams.toString()
            );
        };

        removeCompetitionIdQueryParam = () => {
            var searchParams = new URLSearchParams(window.location.search);
            searchParams.delete("competitionId");
            this.setPageWithoutRedirect(
                this.currentLocationWithoutQuery() +
                    "?" +
                    searchParams.toString()
            );
        };

        setWcif = (wcif) => {
            this.setLoadingCompetitionInformation(false);
            this.props.updateEditingStatus(true);
            this.props.updateWcif(wcif);
            this.props.updateCompetitionId(wcif.id);
            this.props.updateCompetitionName(wcif.name);
            this.props.updateFileZipBlob(null);
        };

        setSuggestedFmcTranslations = (suggestedFmcTranslations) => {
            if (suggestedFmcTranslations != null) {
                this.props.setSuggestedFmcTranslations(
                    suggestedFmcTranslations
                );
            }
        };

        logInButton = () => {
            return (
                <div id="login-area" className={`w-100 mt-${this.margin}`}>
                    <button
                        type="button"
                        className="btn btn-primary btn-lg btn-block btn-outline-light"
                        onClick={isLogged() ? logOut : logIn}
                    >
                        {isLogged() ? "Log Out" : "Log In"}
                    </button>
                    {this.state.me != null && (
                        <p className="text-white mt-2">
                            Welcome, {this.state.me.name}.{" "}
                            {this.state.competitions != null &&
                                `You have ${
                                    this.state.competitions.length
                                } manageable ${this.pluralize(
                                    " competition",
                                    this.state.competitions.length
                                )} upcoming.`}
                        </p>
                    )}
                </div>
            );
        };

        loadingArea = () => {
            if (this.state.loadingUser) {
                return (
                    <div className="text-white">
                        <Loading />
                        <p>Loading user...</p>
                    </div>
                );
            }

            if (this.state.loadingCompetitions) {
                return (
                    <div className="text-white">
                        <Loading />
                        <p>Loading competitions...</p>
                    </div>
                );
            }

            if (this.state.loadingCompetitionInformation) {
                return (
                    <div className="text-white">
                        <Loading />
                        <p>
                            Loading information for {this.state.competitionId}
                            ...
                        </p>
                    </div>
                );
            }
        };

        render() {
            return (
                <div className="h-100">
                    <img
                        className="tnoodle-logo mt-2"
                        src={require("../assets/tnoodle_logo.svg")}
                        alt="TNoodle logo"
                    />
                    <h1 className="display-3" id="title">
                        TNoodle
                    </h1>
                    <div>
                        <ul className="list-group">
                            <li>
                                {(this.state.competitions != null &&
                                    this.state.competitions.length) > 0 && (
                                    <button
                                        type="button"
                                        className={`btn btn-primary btn-lg btn-block btn-outline-light mb-${this.margin}`}
                                        onClick={this.handleManualSelection}
                                    >
                                        Manual Selection
                                    </button>
                                )}
                            </li>
                            {this.state.competitions != null &&
                                this.state.competitions.map(
                                    (competition, i) => (
                                        <li key={i}>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-lg btn-block m-1"
                                                onClick={(_) =>
                                                    this.handleCompetitionSelection(
                                                        competition.id
                                                    )
                                                }
                                            >
                                                {competition.name}
                                            </button>
                                        </li>
                                    )
                                )}
                        </ul>

                        {this.loadingArea()}
                    </div>
                    {this.logInButton()}
                </div>
            );
        }
    }
);

export default SideBar;

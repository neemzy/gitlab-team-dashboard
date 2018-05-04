import { fetchGitlab } from "gitlab-fetcher";
import config from "../cfg";

const apiURL = config.baseURL + "/api/v4";
const labelRE = new RegExp(config.labelsToExclude);

function fetchAllPagesFromApi(url, payload) {
  return fetchGitlab(config.token, apiURL + url, payload);
}

function fetchMilestones() {
  return fetchAllPagesFromApi("/groups")
    .then(groups => Promise.all(
      // Project milestones (deprecated)
      config.projectIds.map(id => fetchAllPagesFromApi("/projects/" + id + "/milestones", { state: "active" }))
        // Group milestones
        .concat(groups.map(group => fetchAllPagesFromApi("/groups/" + group.id + "/milestones", { state: "active" })))
    ))
    .then(milestones => milestones
      .reduce((acc, cur) => acc.concat(cur), [])
      .map(milestone => ({
        ...milestone,
        "web_url": config.baseURL + "/dashboard/issues?state=opened&utf8=✓&milestone_title=" + milestone.title
      }))
    );
}

function fetchUser(username) {
  return fetchAllPagesFromApi("/users", { username }).then(users => users.pop());
}

function fetchOpenedMergeRequests(userId) {
  return fetchAllPagesFromApi("/merge_requests", { scope: "all", state: "opened", "author_id": userId });
}

function fetchAssignedMergeRequests(userId) {
  return fetchAllPagesFromApi("/merge_requests", { scope: "all", state: "opened", "assignee_id": userId });
}

function fetchAssignedIssues(userId) {
  return fetchAllPagesFromApi("/issues", { scope: "all", state: "opened", "assignee_id": userId })
    .then(issues => config.labelsToExclude
      ? issues.filter(issue => issue.labels.reduce((result, label) => result && !label.match(labelRE), true))
      : issues
    );
}

export { fetchMilestones, fetchUser, fetchOpenedMergeRequests, fetchAssignedMergeRequests, fetchAssignedIssues };

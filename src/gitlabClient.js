import { fetchGitlab, callGitlab } from "gitlab-fetcher";
import config from "../cfg";

const apiURL = config.baseURL + "/api/v4";
const labelRE = new RegExp(config.labelsToExclude);

function fetchAllPagesFromAPI(url, payload) {
  return fetchGitlab(config.token, apiURL + url, payload);
}

function callAPI(url, payload) {
  return callGitlab(config.token, apiURL + url, payload);
}

function formatMergeRequests(mrs, excludeSelf = false) {
  return mrs
    // Remove WIP and/or self-assigned MRs if relevant
    .then(mrs => mrs.filter(mr => (config.wipMergeRequests || !mr.work_in_progress) && (!excludeSelf || mr.assignee.id !== mr.author.id)))
    // Fetch, aggregate and format approval data
    .then(mrs => Promise.all([
      mrs,
      ...mrs.map(mr => callAPI(`/projects/${mr.project_id}/merge_requests/${mr.iid}/approvals`))
    ]))
    .then(([mrs, ...responses]) => Promise.all([mrs, ...responses.map(response => response.json())]))
    .then(([mrs, ...approvals]) => mrs.map(mr => ({
      ...mr,
      ...approvals.find(approval => approval.id === mr.id)
    })))
    .then(mrs => mrs.map(mr => ({
      ...mr,
      approvalCount: mr.approved_by.length || 0,
      approvalGoal: mr.approvals_required || 0
    })));
}

function formatIssues(issues, excludeSelf = false) {
  return issues
    // Remove orphan and/or self-assigned issues if relevant (and exclude some by label as well)
    .then(issues => issues.filter(issue => (config.orphanIssues || issue.milestone)
      && (!excludeSelf || !issue.assignees.find(({ id }) => id === issue.author.id))
      && (!config.labelsToExclude || issue.labels.reduce((result, label) => result && !label.match(labelRE), true))
    ));
}

function fetchMilestones() {
  return fetchAllPagesFromAPI("/groups")
    .then(groups => Promise.all(
      // Project milestones (deprecated)
      config.projectIds.map(id => fetchAllPagesFromAPI("/projects/" + id + "/milestones", { state: "active" }))
        // Group milestones
        .concat(groups.map(group => fetchAllPagesFromAPI("/groups/" + group.id + "/milestones", { state: "active" })))
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
  return fetchAllPagesFromAPI("/users", { username }).then(users => users.pop());
}

function fetchOpenedMergeRequests(userId) {
  return formatMergeRequests(fetchAllPagesFromAPI("/merge_requests", {
    scope: "all",
    state: "opened",
    "author_id": userId
  }));
}

function fetchAssignedMergeRequests(userId) {
  return formatMergeRequests(fetchAllPagesFromAPI("/merge_requests", {
    scope: "all",
    state: "opened",
    "assignee_id": userId
  }), !config.selfAssignedMergeRequests);
}

function fetchOpenedIssues(userId) {
  return formatIssues(fetchAllPagesFromAPI("/issues", {
    scope: "all",
    state: "opened",
    "author_id": userId
  }));
}

function fetchAssignedIssues(userId) {
  return formatIssues(fetchAllPagesFromAPI("/issues", {
    scope: "all",
    state: "opened",
    "assignee_id": userId
  }), !config.selfAssignedIssues);
}

export {
  fetchMilestones,
  fetchUser,
  fetchOpenedMergeRequests,
  fetchAssignedMergeRequests,
  fetchOpenedIssues,
  fetchAssignedIssues
};

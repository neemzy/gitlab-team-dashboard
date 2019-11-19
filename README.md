# gitlab-team-dashboard

Gitlab dashboard for team activity tracking

Two tabs:

- **Members**: opened MRs, assigned MRs, opened issues, and assigned issues per user
- **Issues**: assigned issues for the whole team per milestone - issues not belonging to an active milestone are ignored, milestones are sorted by ascending due date

## Setup

```sh
$ npm i
$ cp cfg.json.dist cfg.json
```

Then edit `cfg.json` to suit your needs:

- `baseURL`: Gitlab instance host
- `token`: Gitlab token - you need to get one from your user account
- `usernames`: names of users you want to fetch data for
- `projectIds`: by default, only group milestones are fetched; enable project milestones individually here
- `labelsToExclude`: a regex to exclude issues bearing matching labels (leave blank to disable)
- `orphanIssues`: whether to show issues not belonging to an active milestone on the Members tab
- `selfAssignedIssues`: whether to show self-opened issues in the "assigned issues" section
- `selfAssignedMergeRequests`: whether to show self-opened merge requests in the "assigned MRs" section
- `wipMergeRequests`: whether to show "WIP" merge requests on the Members tab
- `logoURL`: URL of the logo displayed at the top (defaults to a Gitlab logo)

## Develop

```sh
$ npm start
```

Then browse `http://localhost:8080`.

## Build

### Local

```sh
$ npm run local
```

Then browse `file:///path/to/gitlab-team-dashboard/dist/index.html`.

### Production

```sh
$ npm run build
```

Then use your HTTP server of choice.

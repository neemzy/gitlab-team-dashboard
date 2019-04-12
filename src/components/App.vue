<template>
  <div class="app">
    <h1 class="title"><img :src="logoURL" class="logo" alt="Gitlab team dashboard" /></h1>
    <Tabs class="tabs">
      <Tab title="Members" active>
        <div class="section" v-for="data in sortedUsers" :key="data.user.id">
          <h2><User :user="data.user" /></h2>
          <div class="subsection" v-if="data.openedMergeRequests.length">
            <h3>Opened MRs ({{ data.openedMergeRequests.length }})</h3>
            <DataTable :data="data.openedMergeRequests" />
          </div>
          <div class="subsection" v-if="data.assignedMergeRequests.length">
            <h3>Assigned MRs ({{ data.assignedMergeRequests.length }})</h3>
            <DataTable :data="data.assignedMergeRequests" />
          </div>
          <div class="subsection" v-if="data.assignedIssues.length">
            <h3>Assigned issues ({{ data.assignedIssues.length }})</h3>
            <DataTable :data="data.assignedIssues" labels />
          </div>
          <div
            class="subsection"
            v-if="!data.openedMergeRequests.length && !data.assignedMergeRequests.length && !data.assignedIssues.length"
          >All clear!</div>
        </div>
      </Tab>
      <Tab title="Issues">
        <div class="section" v-for="data in milestonesAndIssues" :key="data.milestone.id" v-if="data.issues.length">
          <h2><a :href="data.milestone.web_url" target="_blank">{{ data.milestone.title }}</a>{{ data.milestone.due_date
            ? ", due " + data.milestone.due_date.split("-").reverse().join("/")
            : ""
          }} ({{ data.issues.length }})</h2>
          <DataTable :data="data.issues" labels />
        </div>
      </Tab>
    </Tabs>
  </div>
</template>

<script>
import config from "../../cfg";
import {
  fetchMilestones,
  fetchUser,
  fetchOpenedMergeRequests,
  fetchAssignedMergeRequests,
  fetchAssignedIssues
} from "../gitlabClient";
import User from "./User";
import DataTable from "./DataTable";
import { Tabs, Tab } from "vue-simple-tabs";

export default {
  data() {
    return {
      milestones: [],
      users: {}
    };
  },
  computed: {
    sortedUsers() {
      return config.usernames
        .map(username => this.users[username])
        .filter(user => !!user);
    },

    issuesForMilestones() {
      const uniqueIds = [];

      return this.sortedUsers
        .map(user => user.assignedIssues)
        .reduce((acc, cur) => acc.concat(cur), [])
        .filter(issue => {
          if (uniqueIds.includes(issue.id)) {
            return false;
          }

          uniqueIds.push(issue.id);

          return issue && "milestone" in issue && issue.milestone;
        });
    },

    milestonesAndIssues() {
      return this.milestones
        .map(milestone => ({
          milestone,
          issues: this.issuesForMilestones.filter(issue => issue.milestone.id === milestone.id)
        }))
        .sort((a, b) => a.milestone.due_date === null
          ? 1
          : b.milestone.due_date === null
            ? -1
            : parseInt(a.milestone.due_date.split("-").join("")) - parseInt(b.milestone.due_date.split("-").join(""))
        );
    },

    logoURL() {
      return config.logoURL || "";
    }
  },
  methods: {
    getMilestoneData() {
      return fetchMilestones()
        .then(milestones => {
          this.milestones = milestones;
        });
    },

    getUserData(username) {
      return fetchUser(username)
        .then(user => Promise.all([
          user,
          fetchOpenedMergeRequests(user.id),
          fetchAssignedMergeRequests(user.id),
          fetchAssignedIssues(user.id)
        ]))
        .then(data => {
          this.users = {
            ...this.users,
            [username]: {
              user: data[0],
              openedMergeRequests: config.wipMergeRequests ? data[1] : data[1].filter(mr => !mr.work_in_progress),
              assignedMergeRequests: config.wipMergeRequests ? data[2] : data[2].filter(mr => !mr.work_in_progress),
              assignedIssues: config.orphanIssues ? data[3] : data[3].filter(issue => issue.milestone)
            }
          };
        })
        .catch(console.error);
    }
  },
  mounted() {
    this.getMilestoneData().then(() => {
      config.usernames.forEach(username => {
        this.getUserData(username);
      });
    });
  },
  components: { User, DataTable, Tabs, Tab }
};
</script>

<style scoped>
.app {
  padding: 3rem;
}

.title {
  margin: 0;
}

.logo {
  max-width: 250px;
  max-height: 125px;
}

.section {
  margin-top: 5rem;
}

.subsection {
  margin-top: 3rem;
}

.subsection h3 {
  margin-bottom: 1rem;
}
</style>

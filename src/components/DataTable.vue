<template>
  <table class="dataTable">
    <thead>
      <tr>
        <th></th>
        <th>Project</th>
        <th>Date</th>
        <th>Title</th>
        <th>Author</th>
        <th>Assignee(s)</th>
        <th v-if="labels">Label(s)</th>
        <th v-if="upvotes">Upvote(s)</th>
        <th v-if="approvals">Approval(s)</th>
        <th>Comment(s)</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="datum in data" :key="datum.id">
        <td><a :href="datum.web_url" target="_blank">#{{ datum.iid }}</a></td>
        <td><a :href="project(datum, true)" target="_blank">{{ project(datum) }}</a></td>
        <td>{{ date(datum) }}</td>
        <td><a :href="datum.web_url" target="_blank">{{ datum.title }}</a></td>
        <td><User :user="datum.author" /></td>
        <td>
          <ul v-if="datum.assignees" class="dataList">
            <li v-for="assignee in datum.assignees" :key="assignee.id"><User :user="assignee" /></li>
          </ul>
          <User v-else-if="datum.assignee" :user="datum.assignee" />
        </td>
        <td v-if="labels">
          <ul class="dataList">
            <li v-for="(label, index) in datum.labels" :key="index">{{ label }}</li>
          </ul>
        </td>
        <td v-if="upvotes">{{ datum.upvotes }}</td>
        <td v-if="approvals">{{ datum.approvalCount }}<span v-if="datum.approvalGoal > 0">/{{ datum.approvalGoal }}</span></td>
        <td>{{ datum.user_notes_count }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import config from "../../cfg";
import User from "./User";

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    labels: {
      type: Boolean,
      default: false
    },
    upvotes: {
      type: Boolean,
      default: false
    },
    approvals: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    sortedData() {
      return this.data.concat().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },
  methods: {
    project(datum, withBaseURL = false) {
      const project = datum.web_url.replace(/\/(merge_requests|issues)\/[0-9]+/, "");

      if (!withBaseURL) {
        return project
          .replace(config.baseURL, "")
          .replace(/^(\/)/, "");
      }

      return project;
    },
    date(datum) {
      const date = new Date(datum.created_at);

      return [date.getDate(), date.getMonth() + 1, date.getFullYear()].map(segment => {
        segment = String(segment);

        if (segment.length === 1) {
          segment = "0" + segment;
        }

        return segment;
      }).join("/");
    }
  },
  components: { User }
};
</script>

<style scoped>
.dataTable {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 5px;
  vertical-align: top;
}

th {
  text-align: left;
}

.dataList {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
</style>

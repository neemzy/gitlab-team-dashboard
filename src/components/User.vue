<template>
  <a :href="user.web_url" target="_blank">
    <img class="avatar" :src="user.avatar_url" />
    {{ user.name }}
  </a>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
.avatar {
  width: 1.333em;
  height: 1.333em;
  vertical-align: middle;
  border-radius: 50%;
}
</style>

<template>
  <div class="app">
    <button @click="askTabsPermission()">Request Tabs Permission</button>
  </div>
</template>

<script>

import { havePermission, requestPermission } from '../background/permissions';

export default {
  data() {
    return {
    };
  },
  async mounted() {
  },
  methods: {
    async askTabsPermission() {
      if (await requestPermission('tabs')) {
        // TODO: hide ask permission button
        alert('accepted');
        const _browser = window.chrome || browser;
        _browser.runtime.sendMessage({ tag: "PERMISSIONS_CHANGED" });
      } else {
        // TODO: show warning
        alert('refused');
      };
    }
  },
};

</script>